/* Onboarding Playbook Generator - Frontend */
(function () {
  const PREFIX = window.APP_PREFIX || "";

  // -----------------------------------------------------------------------
  // Simple Markdown → HTML renderer
  // -----------------------------------------------------------------------
  function mdToHtml(md) {
    let html = md;

    // Escape HTML entities first
    html = html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    // Headers
    html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
    html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
    html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");

    // Bold and italic
    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

    // Inline code
    html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

    // Tables
    html = html.replace(
      /^(\|.+\|)\n(\|[\s:|-]+\|)\n((?:\|.+\|\n?)+)/gm,
      function (_, headerRow, _sep, bodyRows) {
        const headers = headerRow.split("|").filter(c => c.trim());
        let table = "<table><thead><tr>";
        headers.forEach(h => { table += "<th>" + h.trim() + "</th>"; });
        table += "</tr></thead><tbody>";
        bodyRows.trim().split("\n").forEach(row => {
          const cells = row.split("|").filter(c => c.trim());
          table += "<tr>";
          cells.forEach(c => { table += "<td>" + c.trim() + "</td>"; });
          table += "</tr>";
        });
        table += "</tbody></table>";
        return table;
      }
    );

    // Unordered lists
    html = html.replace(/^((?:- .+\n?)+)/gm, function (block) {
      const items = block.trim().split("\n").map(line =>
        "<li>" + line.replace(/^- /, "") + "</li>"
      ).join("");
      return "<ul>" + items + "</ul>";
    });

    // Ordered lists
    html = html.replace(/^((?:\d+\. .+\n?)+)/gm, function (block) {
      const items = block.trim().split("\n").map(line =>
        "<li>" + line.replace(/^\d+\.\s*/, "") + "</li>"
      ).join("");
      return "<ol>" + items + "</ol>";
    });

    // Paragraphs - wrap remaining text lines
    html = html.replace(/^(?!<[hoult])((?!<).+)$/gm, "<p>$1</p>");

    // Clean up empty paragraphs
    html = html.replace(/<p>\s*<\/p>/g, "");

    return html;
  }

  // -----------------------------------------------------------------------
  // Determine base URL for API calls
  // -----------------------------------------------------------------------
  function apiBase() {
    // When behind the gateway, SSE won't work through the proxy.
    // Use direct port for the generate endpoint.
    return PREFIX;
  }

  function directApiBase() {
    // For SSE streaming, bypass gateway and hit the app directly
    if (PREFIX && window.location.port === "8000") {
      return "http://localhost:3004";
    }
    return PREFIX;
  }

  // -----------------------------------------------------------------------
  // Page: Index
  // -----------------------------------------------------------------------
  if (document.body.dataset.page === "index") {
    const form = document.getElementById("generate-form");
    const generateBtn = document.getElementById("generate-btn");
    const statusEl = document.getElementById("generate-status");
    const outputCard = document.getElementById("output-card");
    const outputArea = document.getElementById("output-area");
    const outputTitle = document.getElementById("output-title");
    const downloadBtn = document.getElementById("download-btn");
    const savedList = document.getElementById("saved-list");
    const savedEmpty = document.getElementById("saved-empty");

    let currentMarkdown = "";
    let currentProductName = "";

    // Load saved playbooks
    function loadSaved() {
      fetch(apiBase() + "/api/playbooks")
        .then(r => r.json())
        .then(data => {
          if (data.playbooks && data.playbooks.length > 0) {
            savedEmpty.style.display = "none";
            savedList.innerHTML = data.playbooks.map(p => {
              const date = new Date(p.created_at + "Z").toLocaleDateString("en-US", {
                month: "short", day: "numeric", year: "numeric"
              });
              return `<a class="saved-item" href="${PREFIX}/view/${p.id}">
                <div>
                  <div class="saved-item-name">${escapeHtml(p.product_name)}</div>
                  <div class="saved-item-meta">${escapeHtml(p.customer_segment)}</div>
                </div>
                <div class="saved-item-date">${date}</div>
              </a>`;
            }).join("");
          } else {
            savedEmpty.style.display = "block";
            savedList.innerHTML = "";
          }
        })
        .catch(() => {});
    }

    loadSaved();

    // Generate playbook
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const data = {
        product_name: form.product_name.value.trim(),
        product_desc: form.product_desc.value.trim(),
        customer_segment: form.customer_segment.value.trim(),
        desired_outcomes: form.desired_outcomes.value.trim(),
      };

      if (!data.product_name || !data.product_desc || !data.customer_segment) return;

      currentMarkdown = "";
      currentProductName = data.product_name;
      outputCard.style.display = "block";
      outputArea.innerHTML = '<span class="streaming-cursor"></span>';
      downloadBtn.style.display = "none";
      generateBtn.disabled = true;
      statusEl.textContent = "Generating...";

      // Use direct port for SSE to bypass gateway buffering
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
            buffer = lines.pop(); // keep incomplete line

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
                if (msg.text) {
                  currentMarkdown += msg.text;
                  outputArea.innerHTML = mdToHtml(currentMarkdown) + '<span class="streaming-cursor"></span>';
                  outputArea.scrollTop = outputArea.scrollHeight;
                }
                if (msg.done) {
                  finishStream(msg.id);
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

      function finishStream(id) {
        outputArea.innerHTML = mdToHtml(currentMarkdown);
        generateBtn.disabled = false;
        statusEl.textContent = id ? "Saved!" : "Done";
        downloadBtn.style.display = "inline-flex";
        if (id) {
          outputTitle.textContent = "Generated Playbook";
        }
        loadSaved();
        setTimeout(() => { statusEl.textContent = ""; }, 3000);
      }
    });

    // Download
    downloadBtn.addEventListener("click", function () {
      const blob = new Blob([currentMarkdown], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = slugify(currentProductName) + "-onboarding-playbook.md";
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  // -----------------------------------------------------------------------
  // Page: View
  // -----------------------------------------------------------------------
  if (document.body.dataset.page === "view") {
    const id = window.PLAYBOOK_ID;
    const titleEl = document.getElementById("view-title");
    const metaEl = document.getElementById("view-meta");
    const outputArea = document.getElementById("output-area");
    const downloadBtn = document.getElementById("download-btn");
    const deleteBtn = document.getElementById("delete-btn");

    let playbook = null;

    fetch(apiBase() + "/api/playbooks/" + id)
      .then(r => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then(data => {
        playbook = data;
        titleEl.textContent = data.product_name;
        const date = new Date(data.created_at + "Z").toLocaleDateString("en-US", {
          month: "short", day: "numeric", year: "numeric"
        });
        metaEl.textContent = data.customer_segment + " \u2022 " + date;
        outputArea.innerHTML = mdToHtml(data.playbook_md);
      })
      .catch(() => {
        titleEl.textContent = "Not Found";
        outputArea.innerHTML = "<p>This playbook could not be loaded.</p>";
      });

    downloadBtn.addEventListener("click", function () {
      if (!playbook) return;
      const blob = new Blob([playbook.playbook_md], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = slugify(playbook.product_name) + "-onboarding-playbook.md";
      a.click();
      URL.revokeObjectURL(url);
    });

    deleteBtn.addEventListener("click", function () {
      if (!confirm("Delete this playbook?")) return;
      fetch(apiBase() + "/api/playbooks/" + id, { method: "DELETE" })
        .then(() => {
          window.location.href = PREFIX + "/";
        });
    });
  }

  // -----------------------------------------------------------------------
  // Utilities
  // -----------------------------------------------------------------------
  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function slugify(str) {
    return str.toLowerCase().trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }
})();
