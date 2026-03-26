/* GTM Signal Dashboard – client-side rendering */

(function () {
  const PREFIX = window.APP_PREFIX || "";

  const CATEGORIES = [
    { key: "pipeline",    cardId: "pipeline-card",    emptyMsg: "No pipeline alerts" },
    { key: "competitive", cardId: "competitive-card",  emptyMsg: "No competitive signals" },
    { key: "accounts",    cardId: "accounts-card",     emptyMsg: "No account signals" },
    { key: "market",      cardId: "market-card",       emptyMsg: "No market signals" },
  ];

  // -----------------------------------------------------------------------
  // Fetch & render
  // -----------------------------------------------------------------------

  async function loadBrief() {
    try {
      const res = await fetch(`${PREFIX}/api/brief`);
      const data = await res.json();

      if (data.error && !data.generated_at) {
        showError(data.error);
        showEmpty();
        return;
      }
      hideError();
      renderTimestamp(data.generated_at);
      renderAllSignals(data.signals);
    } catch (err) {
      showError("Failed to load signal data.");
      showEmpty();
    }
  }

  // -----------------------------------------------------------------------
  // Show empty state for all cards
  // -----------------------------------------------------------------------

  function showEmpty() {
    for (const cat of CATEGORIES) {
      const body = document.querySelector(`#${cat.cardId} .card-body`);
      body.className = "card-body";
      body.innerHTML = `<div class="unavailable">No signals fetched yet</div>`;
    }
  }

  // -----------------------------------------------------------------------
  // Timestamp
  // -----------------------------------------------------------------------

  function renderTimestamp(ts) {
    const el = document.getElementById("timestamp");
    if (!ts) { el.textContent = ""; return; }
    const d = new Date(ts);
    el.textContent = d.toLocaleDateString("en-US", {
      weekday: "short", month: "short", day: "numeric",
    }) + " at " + d.toLocaleTimeString("en-US", {
      hour: "numeric", minute: "2-digit",
    });
  }

  // -----------------------------------------------------------------------
  // Render all signal categories
  // -----------------------------------------------------------------------

  function renderAllSignals(signals) {
    if (!signals) {
      showEmpty();
      return;
    }
    for (const cat of CATEGORIES) {
      renderSignalCategory(cat, signals[cat.key]);
    }
  }

  function renderSignalCategory(cat, signals) {
    const body = document.querySelector(`#${cat.cardId} .card-body`);

    if (!signals || !Array.isArray(signals) || signals.length === 0) {
      body.className = "card-body";
      body.innerHTML = `<div class="unavailable">${esc(cat.emptyMsg)}</div>`;
      return;
    }

    body.className = "card-body";
    const items = signals.map(signal => {
      const sevClass = severityClass(signal.severity);
      return `<li class="signal-item">
        <span class="severity-dot ${sevClass}"></span>
        <div class="signal-content">
          <div class="signal-title">${esc(signal.title)}</div>
          <div class="signal-desc">${esc(signal.description)}</div>
        </div>
      </li>`;
    }).join("");

    body.innerHTML = `<ul class="signal-list">${items}</ul>`;
  }

  function severityClass(severity) {
    switch ((severity || "").toLowerCase()) {
      case "high":   return "severity-high";
      case "medium": return "severity-medium";
      default:       return "severity-low";
    }
  }

  // -----------------------------------------------------------------------
  // Error banner
  // -----------------------------------------------------------------------

  function showError(msg) {
    const el = document.getElementById("error-banner");
    el.textContent = msg;
    el.style.display = "block";
  }

  function hideError() {
    document.getElementById("error-banner").style.display = "none";
  }

  // -----------------------------------------------------------------------
  // Escape HTML
  // -----------------------------------------------------------------------

  function esc(str) {
    if (!str) return "";
    const d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  // -----------------------------------------------------------------------
  // Refresh button
  // -----------------------------------------------------------------------

  function setupRefresh() {
    const btn = document.getElementById("refresh-btn");
    btn.addEventListener("click", async () => {
      btn.disabled = true;
      btn.textContent = "Refreshing...";

      try {
        await fetch(`${PREFIX}/api/refresh`, { method: "POST" });
      } catch {
        btn.textContent = "Refresh";
        btn.disabled = false;
        return;
      }

      // Poll for updated data (fetch.sh takes ~30-60s)
      const originalTs = document.getElementById("timestamp").textContent;
      let attempts = 0;
      const poll = setInterval(async () => {
        attempts++;
        try {
          const res = await fetch(`${PREFIX}/api/brief`);
          const data = await res.json();
          const newTs = data.generated_at || "";
          if (newTs && newTs !== originalTs || attempts > 24) {
            clearInterval(poll);
            btn.textContent = "Refresh";
            btn.disabled = false;
            if (data.generated_at) {
              hideError();
              renderTimestamp(data.generated_at);
              renderAllSignals(data.signals);
            }
          }
        } catch {
          // keep polling
        }
      }, 5000);
    });
  }

  // -----------------------------------------------------------------------
  // Init
  // -----------------------------------------------------------------------

  document.addEventListener("DOMContentLoaded", () => {
    loadBrief();
    setupRefresh();
  });
})();
