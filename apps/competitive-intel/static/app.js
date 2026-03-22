/* Competitive Intelligence - Frontend */
(function () {
  const PREFIX = window.APP_PREFIX || "";

  function apiBase() {
    return PREFIX;
  }

  function directApiBase() {
    if (PREFIX && window.location.port === "8000") {
      return "http://localhost:3006";
    }
    return PREFIX;
  }

  // -----------------------------------------------------------------------
  // Elements
  // -----------------------------------------------------------------------

  const form = document.getElementById("analyze-form");
  const analyzeBtn = document.getElementById("analyze-btn");
  const statusEl = document.getElementById("analyze-status");
  const outputCard = document.getElementById("output-card");
  const outputTitle = document.getElementById("output-title");
  const outputArea = document.getElementById("output-area");
  const resultsSection = document.getElementById("results-section");
  const resultCompanyTitle = document.getElementById("result-company-title");
  const resultSummary = document.getElementById("result-summary");
  const resultUpdates = document.getElementById("result-updates");
  const resultPositioning = document.getElementById("result-positioning");
  const resultActions = document.getElementById("result-actions");
  const exportBtn = document.getElementById("export-btn");
  const deleteBtn = document.getElementById("delete-btn");
  const savedList = document.getElementById("saved-list");
  const savedEmpty = document.getElementById("saved-empty");

  let currentAnalysisId = null;
  let currentResult = null;

  // -----------------------------------------------------------------------
  // Load saved analyses
  // -----------------------------------------------------------------------

  function loadSaved() {
    fetch(apiBase() + "/api/analyses")
      .then(r => r.json())
      .then(data => {
        if (data.analyses && data.analyses.length > 0) {
          savedEmpty.style.display = "none";
          savedList.innerHTML = data.analyses.map(a => {
            const date = new Date(a.created_at + "Z").toLocaleDateString("en-US", {
              month: "short", day: "numeric", year: "numeric"
            });
            const typeLabel = { general: "General Intel", battlecard: "Battlecard", comparison: "Comparison" }[a.analysis_type] || a.analysis_type;
            return `<div class="saved-item" data-id="${a.id}">
              <div>
                <div class="saved-item-name">${escapeHtml(a.company_name)}</div>
                <div class="saved-item-meta">${escapeHtml(typeLabel)}</div>
              </div>
              <div class="saved-item-date">${date}</div>
            </div>`;
          }).join("");

          savedList.querySelectorAll(".saved-item").forEach(el => {
            el.addEventListener("click", () => loadAnalysis(parseInt(el.dataset.id)));
          });
        } else {
          savedEmpty.style.display = "block";
          savedList.innerHTML = "";
        }
      })
      .catch(() => {});
  }

  loadSaved();

  // -----------------------------------------------------------------------
  // Load a saved analysis into results view
  // -----------------------------------------------------------------------

  function loadAnalysis(id) {
    fetch(apiBase() + "/api/analyses/" + id)
      .then(r => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then(data => {
        currentAnalysisId = data.id;
        // Parse markdown back to display — but we store the raw result on create
        // For saved items, just show the markdown rendered simply
        outputCard.style.display = "none";
        // Try to re-parse from markdown or show it raw
        resultsSection.style.display = "block";
        resultCompanyTitle.textContent = "Analysis: " + data.company_name;
        // We don't have the parsed JSON stored separately, so render markdown
        renderMarkdown(data.result_markdown);
        resultsSection.scrollIntoView({ behavior: "smooth" });
      })
      .catch(() => {});
  }

  function renderMarkdown(md) {
    // Simple markdown-to-HTML for display
    resultSummary.textContent = "";
    resultUpdates.innerHTML = "";
    resultPositioning.textContent = "";
    resultActions.innerHTML = "";

    if (!md) return;

    // Extract sections by heading
    const sections = {};
    let currentSection = "";
    const lines = md.split("\n");
    for (const line of lines) {
      if (line.startsWith("## ")) {
        currentSection = line.replace("## ", "").trim().toLowerCase();
        sections[currentSection] = [];
      } else if (line.startsWith("# ")) {
        // Title line, skip
      } else if (currentSection) {
        sections[currentSection] = sections[currentSection] || [];
        sections[currentSection].push(line);
      }
    }

    if (sections["summary"]) {
      resultSummary.textContent = sections["summary"].join("\n").trim();
    }
    if (sections["positioning"]) {
      resultPositioning.textContent = sections["positioning"].join("\n").trim();
    }
    if (sections["key updates"]) {
      const updatesText = sections["key updates"].join("\n");
      // Parse ### headings as update titles
      const updateBlocks = updatesText.split(/^### /m).filter(Boolean);
      resultUpdates.innerHTML = updateBlocks.map(block => {
        const blockLines = block.trim().split("\n");
        const title = blockLines[0] || "";
        const rest = blockLines.slice(1).join("\n").trim();
        const whyMatch = rest.match(/\*\*Why it matters:\*\*\s*(.*)/);
        const detail = rest.replace(/\*\*Why it matters:\*\*.*/, "").trim();
        return `<div class="update-item">
          <div class="update-title">${escapeHtml(title)}</div>
          <div class="update-detail">${escapeHtml(detail)}</div>
          ${whyMatch ? `<div class="update-why"><strong>Why it matters:</strong> ${escapeHtml(whyMatch[1])}</div>` : ""}
        </div>`;
      }).join("");
    }
    if (sections["strategic actions"]) {
      resultActions.innerHTML = sections["strategic actions"]
        .filter(l => l.startsWith("- "))
        .map(l => `<li>${escapeHtml(l.slice(2))}</li>`)
        .join("");
    }
  }

  // -----------------------------------------------------------------------
  // Analysis form submit
  // -----------------------------------------------------------------------

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const data = {
      company_name: form.company_name.value.trim(),
      analysis_type: form.analysis_type.value,
    };

    if (!data.company_name) return;

    currentAnalysisId = null;
    currentResult = null;
    resultsSection.style.display = "none";
    outputCard.style.display = "block";
    outputTitle.textContent = "Analyzing...";
    outputArea.innerHTML = '<span class="streaming-cursor"></span>';
    analyzeBtn.disabled = true;
    statusEl.textContent = "Researching...";

    const base = directApiBase();

    fetch(base + "/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(response => {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      function read() {
        reader.read().then(({ done, value }) => {
          if (done) {
            finishStream();
            return;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop();

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const msg = JSON.parse(line.slice(6));
              if (msg.error) {
                outputArea.innerHTML = `<p style="color:var(--danger)">${escapeHtml(msg.error)}</p>`;
                analyzeBtn.disabled = false;
                statusEl.textContent = "";
                return;
              }
              if (msg.status) {
                outputArea.innerHTML = '<span class="streaming-cursor"></span> ' + escapeHtml(msg.status);
              }
              if (msg.done) {
                finishStream(msg.id, msg.result);
                return;
              }
            } catch (_) {}
          }
          read();
        });
      }

      read();
    }).catch(err => {
      outputArea.innerHTML = `<p style="color:var(--danger)">Connection error: ${escapeHtml(err.message)}</p>`;
      analyzeBtn.disabled = false;
      statusEl.textContent = "";
    });

    function finishStream(id, result) {
      analyzeBtn.disabled = false;
      statusEl.textContent = id ? "Done!" : "";

      if (result) {
        currentAnalysisId = id;
        currentResult = result;
        outputCard.style.display = "none";
        renderResults(result);
        loadSaved();
      } else {
        outputTitle.textContent = "Raw Output";
      }

      setTimeout(() => { statusEl.textContent = ""; }, 3000);
    }
  });

  // -----------------------------------------------------------------------
  // Render structured results from JSON
  // -----------------------------------------------------------------------

  function renderResults(data) {
    resultsSection.style.display = "block";

    resultCompanyTitle.textContent = "Analysis: " + (data.company || "Unknown");

    resultSummary.textContent = data.summary || "Not available";

    // Updates
    const updates = data.updates || [];
    resultUpdates.innerHTML = updates.map(u => {
      return `<div class="update-item">
        <div class="update-title">${escapeHtml(u.title || "")}</div>
        <div class="update-detail">${escapeHtml(u.detail || "")}</div>
        <div class="update-why"><strong>Why it matters:</strong> ${escapeHtml(u.why_it_matters || "Not available")}</div>
      </div>`;
    }).join("");

    resultPositioning.textContent = data.positioning || "Not available";

    // Strategic actions
    const actions = data.strategic_actions || [];
    resultActions.innerHTML = actions.map(a =>
      `<li>${escapeHtml(a)}</li>`
    ).join("");
  }

  // -----------------------------------------------------------------------
  // Export markdown
  // -----------------------------------------------------------------------

  exportBtn.addEventListener("click", function () {
    if (!currentAnalysisId) return;
    window.open(apiBase() + "/api/analyses/" + currentAnalysisId + "/export", "_blank");
  });

  // -----------------------------------------------------------------------
  // Delete
  // -----------------------------------------------------------------------

  deleteBtn.addEventListener("click", function () {
    if (!currentAnalysisId) return;
    if (!confirm("Delete this analysis?")) return;

    fetch(apiBase() + "/api/analyses/" + currentAnalysisId, { method: "DELETE" })
      .then(() => {
        currentAnalysisId = null;
        currentResult = null;
        resultsSection.style.display = "none";
        loadSaved();
      });
  });

  // -----------------------------------------------------------------------
  // Utilities
  // -----------------------------------------------------------------------

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function escapeAttr(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
})();
