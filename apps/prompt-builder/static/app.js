/* Prompt Builder - Frontend */
(function () {
  const PREFIX = window.APP_PREFIX || "";

  function apiBase() {
    return PREFIX;
  }

  function directApiBase() {
    if (PREFIX && window.location.port === "8000") {
      return "http://localhost:3007";
    }
    return PREFIX;
  }

  // -----------------------------------------------------------------------
  // Elements
  // -----------------------------------------------------------------------

  const form = document.getElementById("generate-form");
  const generateBtn = document.getElementById("generate-btn");
  const statusEl = document.getElementById("generate-status");
  const outputCard = document.getElementById("output-card");
  const outputTitle = document.getElementById("output-title");
  const outputArea = document.getElementById("output-area");
  const resultsSection = document.getElementById("results-section");
  const resultsTitle = document.getElementById("results-title");
  const toneBadge = document.getElementById("tone-badge");
  const promptsList = document.getElementById("prompts-list");
  const exportBtn = document.getElementById("export-btn");
  const deleteBtn = document.getElementById("delete-btn");
  const savedList = document.getElementById("saved-list");
  const savedEmpty = document.getElementById("saved-empty");

  let currentPromptId = null;
  let currentResult = null;

  // -----------------------------------------------------------------------
  // Load saved prompt sets
  // -----------------------------------------------------------------------

  function loadSaved() {
    fetch(apiBase() + "/api/prompts")
      .then(r => r.json())
      .then(data => {
        if (data.prompts && data.prompts.length > 0) {
          savedEmpty.style.display = "none";
          savedList.innerHTML = data.prompts.map(p => {
            const date = new Date(p.created_at + "Z").toLocaleDateString("en-US", {
              month: "short", day: "numeric", year: "numeric"
            });
            const label = p.company_name || p.company_url;
            const meta = [p.target_role, p.target_department].filter(Boolean).join(" / ") || "General";
            return `<div class="saved-item" data-id="${p.id}">
              <div>
                <div class="saved-item-name">${escapeHtml(label)}</div>
                <div class="saved-item-meta">${escapeHtml(meta)}</div>
              </div>
              <div class="saved-item-date">${date}</div>
            </div>`;
          }).join("");

          savedList.querySelectorAll(".saved-item").forEach(el => {
            el.addEventListener("click", () => loadPromptSet(parseInt(el.dataset.id)));
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
  // Load a saved prompt set into results view
  // -----------------------------------------------------------------------

  function loadPromptSet(id) {
    fetch(apiBase() + "/api/prompts/" + id)
      .then(r => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then(data => {
        currentPromptId = data.id;
        currentResult = {
          company_name: data.company_name,
          prompts: data.prompts,
        };
        outputCard.style.display = "none";
        renderResults(currentResult);
        resultsSection.scrollIntoView({ behavior: "smooth" });
      })
      .catch(() => {});
  }

  // -----------------------------------------------------------------------
  // Generate form submit
  // -----------------------------------------------------------------------

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const data = {
      company_url: form.company_url.value.trim(),
      target_role: form.target_role.value.trim(),
      target_department: form.target_department.value.trim(),
    };

    if (!data.company_url) return;

    currentPromptId = null;
    currentResult = null;
    resultsSection.style.display = "none";
    outputCard.style.display = "block";
    outputTitle.textContent = "Generating...";
    outputArea.innerHTML = '<span class="streaming-cursor"></span>';
    generateBtn.disabled = true;
    statusEl.textContent = "Researching company...";

    const base = directApiBase();

    fetch(base + "/api/generate", {
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
                generateBtn.disabled = false;
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
      generateBtn.disabled = false;
      statusEl.textContent = "";
    });

    function finishStream(id, result) {
      generateBtn.disabled = false;
      statusEl.textContent = id ? "Done!" : "";

      if (result) {
        currentPromptId = id;
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
  // Render structured results
  // -----------------------------------------------------------------------

  function renderResults(data) {
    const companyName = data.company_name || "Unknown Company";
    const companyTone = data.company_tone || "";
    const prompts = data.prompts || [];

    resultsSection.style.display = "block";

    resultsTitle.textContent = "Prompts for " + companyName;
    if (companyTone) {
      toneBadge.textContent = "Tone: " + companyTone;
      toneBadge.style.display = "inline-block";
    } else {
      toneBadge.style.display = "none";
    }

    promptsList.innerHTML = prompts.map((p, i) => {
      const promptId = "prompt-text-" + i;
      return `<div class="card prompt-card">
        <div class="prompt-card-header">
          <h3 class="prompt-title">${escapeHtml(p.title || "Untitled")}</h3>
          <button class="copy-btn" data-target="${promptId}" title="Copy prompt">Copy</button>
        </div>
        <div class="prompt-text-box" id="${promptId}">${escapeHtml(p.prompt || "")}</div>
        <p class="prompt-use-case">${escapeHtml(p.use_case || "")}</p>
      </div>`;
    }).join("");

    // Attach copy handlers
    promptsList.querySelectorAll(".copy-btn").forEach(btn => {
      btn.addEventListener("click", function () {
        const target = document.getElementById(btn.dataset.target);
        if (!target) return;
        navigator.clipboard.writeText(target.textContent).then(() => {
          btn.textContent = "Copied!";
          setTimeout(() => { btn.textContent = "Copy"; }, 2000);
        }).catch(() => {
          // Fallback
          const range = document.createRange();
          range.selectNodeContents(target);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
          document.execCommand("copy");
          sel.removeAllRanges();
          btn.textContent = "Copied!";
          setTimeout(() => { btn.textContent = "Copy"; }, 2000);
        });
      });
    });
  }

  // -----------------------------------------------------------------------
  // Export markdown
  // -----------------------------------------------------------------------

  exportBtn.addEventListener("click", function () {
    if (!currentPromptId) return;
    window.open(apiBase() + "/api/prompts/" + currentPromptId + "/export", "_blank");
  });

  // -----------------------------------------------------------------------
  // Delete
  // -----------------------------------------------------------------------

  deleteBtn.addEventListener("click", function () {
    if (!currentPromptId) return;
    if (!confirm("Delete this prompt set?")) return;

    fetch(apiBase() + "/api/prompts/" + currentPromptId, { method: "DELETE" })
      .then(() => {
        currentPromptId = null;
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
