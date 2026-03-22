/* GTM Trends — Frontend */
(function () {
  const PREFIX = window.APP_PREFIX || "";
  const textarea = document.getElementById("jd-input");
  const countEl = document.getElementById("jd-count");
  const analyzeBtn = document.getElementById("analyze-btn");
  const inputSection = document.getElementById("input-section");
  const loadingEl = document.getElementById("loading");
  const resultsEl = document.getElementById("results");
  const resetBtn = document.getElementById("reset-btn");
  const resultsBadge = document.getElementById("results-badge");
  const toolDetail = document.getElementById("tool-detail");

  let chartInstance = null;
  let analysisData = null;

  // --- JD count detection ---
  function countJDs() {
    const text = textarea.value.trim();
    if (!text) {
      countEl.textContent = "0 JDs detected";
      analyzeBtn.disabled = true;
      return;
    }
    const parts = text.split(/\n\s*---\s*\n/);
    const count = parts.filter((p) => p.trim().length > 0).length;
    countEl.textContent = count + " JD" + (count !== 1 ? "s" : "") + " detected";
    analyzeBtn.disabled = false;
  }

  textarea.addEventListener("input", countJDs);

  // --- Analyze ---
  analyzeBtn.addEventListener("click", async () => {
    const text = textarea.value.trim();
    if (!text) return;

    inputSection.classList.add("hidden");
    loadingEl.classList.remove("hidden");
    resultsEl.classList.add("hidden");

    try {
      const resp = await fetch(PREFIX + "/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await resp.json();
      if (data.error) {
        alert(data.error);
        inputSection.classList.remove("hidden");
        loadingEl.classList.add("hidden");
        return;
      }
      analysisData = data;
      renderResults(data);
    } catch (err) {
      alert("Analysis failed: " + err.message);
      inputSection.classList.remove("hidden");
    } finally {
      loadingEl.classList.add("hidden");
    }
  });

  // --- Reset ---
  resetBtn.addEventListener("click", () => {
    resultsEl.classList.add("hidden");
    inputSection.classList.remove("hidden");
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
    toolDetail.classList.add("hidden");
  });

  // --- Render Results ---
  function renderResults(data) {
    resultsBadge.textContent = data.jd_count + " JD" + (data.jd_count !== 1 ? "s" : "") + " analyzed";
    renderToolsChart(data);
    renderSkills(data);
    renderCategories(data);
    resultsEl.classList.remove("hidden");
  }

  // --- Tools Chart (Chart.js horizontal bar) ---
  function renderToolsChart(data) {
    const canvas = document.getElementById("tools-chart");
    const tools = data.tools.slice(0, 25); // Top 25

    if (!tools.length) {
      canvas.parentElement.innerHTML = '<p style="color:var(--muted);text-align:center;padding:24px 0;">No tools detected. Try pasting more detailed JDs.</p>';
      return;
    }

    const colors = data.category_colors || {};
    const labels = tools.map((t) => t.name);
    const counts = tools.map((t) => t.count);
    const bgColors = tools.map((t) => colors[t.category] || "#58a6ff");

    // Dynamic height based on bar count
    const barHeight = 28;
    const minHeight = 200;
    const calcHeight = Math.max(minHeight, tools.length * barHeight + 60);
    canvas.parentElement.style.height = calcHeight + "px";

    if (chartInstance) chartInstance.destroy();

    chartInstance = new Chart(canvas, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            data: counts,
            backgroundColor: bgColors,
            borderRadius: 4,
            barPercentage: 0.7,
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function (ctx) {
                const tool = tools[ctx.dataIndex];
                return tool.count + "/" + data.jd_count + " JDs — " + tool.category;
              },
            },
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            max: data.jd_count,
            ticks: {
              stepSize: 1,
              color: "#8b949e",
              font: { size: 12 },
            },
            grid: { color: "rgba(48, 54, 61, 0.4)" },
            title: {
              display: true,
              text: "# of JDs mentioning",
              color: "#8b949e",
              font: { size: 12 },
            },
          },
          y: {
            ticks: {
              color: "#e6edf3",
              font: { size: 13 },
            },
            grid: { display: false },
          },
        },
        onClick: function (_evt, elements) {
          if (elements.length > 0) {
            const idx = elements[0].index;
            showToolDetail(tools[idx], data.jd_summaries);
          }
        },
      },
    });
  }

  function showToolDetail(tool, summaries) {
    let html = '<div class="detail-title">' + tool.name + " (" + tool.category + ")</div>";
    html += "<div>Found in " + tool.count + " of " + analysisData.jd_count + " JDs:</div>";
    tool.jd_indices.forEach((i) => {
      html += '<div class="detail-jd"><span class="detail-jd-num">JD ' + (i + 1) + ":</span> " + escapeHtml(summaries[i]) + "</div>";
    });
    toolDetail.innerHTML = html;
    toolDetail.classList.remove("hidden");
  }

  // --- Skills List ---
  function renderSkills(data) {
    const container = document.getElementById("skills-list");
    const skills = data.skills;

    if (!skills.length) {
      container.innerHTML = '<p style="color:var(--muted);padding:12px 0;">No skills detected.</p>';
      return;
    }

    let html = "";
    skills.forEach((skill, idx) => {
      const pct = (skill.count / data.jd_count) * 100;
      html += '<div class="skill-row" data-idx="' + idx + '">';
      html += '  <span class="skill-name">' + skill.name + "</span>";
      html += '  <div class="skill-bar-wrapper">';
      html += '    <div class="skill-bar"><div class="skill-bar-fill" style="width:' + pct + '%"></div></div>';
      html += '    <span class="skill-count">' + skill.count + "/" + data.jd_count + "</span>";
      html += "  </div>";
      html += "</div>";
      html += '<div class="skill-detail" id="skill-detail-' + idx + '">';
      skill.jd_indices.forEach((i) => {
        html += '<div class="detail-jd"><span class="detail-jd-num">JD ' + (i + 1) + ":</span> " + escapeHtml(data.jd_summaries[i]) + "</div>";
      });
      html += "</div>";
    });

    container.innerHTML = html;

    // Toggle detail on click
    container.querySelectorAll(".skill-row").forEach((row) => {
      row.addEventListener("click", () => {
        const idx = row.dataset.idx;
        const detail = document.getElementById("skill-detail-" + idx);
        detail.classList.toggle("open");
      });
    });
  }

  // --- Categories Accordion ---
  function renderCategories(data) {
    const container = document.getElementById("categories-list");
    const categories = data.categories;
    const colors = data.category_colors || {};
    const catNames = Object.keys(categories);

    if (!catNames.length) {
      container.innerHTML = '<p style="color:var(--muted);padding:12px 0;">No categories detected.</p>';
      return;
    }

    // Sort categories by total tool count descending
    catNames.sort((a, b) => {
      const sumA = categories[a].reduce((s, t) => s + t.count, 0);
      const sumB = categories[b].reduce((s, t) => s + t.count, 0);
      return sumB - sumA;
    });

    let html = "";
    catNames.forEach((cat, ci) => {
      const tools = categories[cat];
      const totalMentions = tools.reduce((s, t) => s + t.count, 0);
      const dotColor = colors[cat] || "#58a6ff";

      html += '<div class="category-group" data-cat="' + ci + '">';
      html += '  <div class="category-header">';
      html += '    <div class="category-left">';
      html += '      <span class="category-dot" style="background:' + dotColor + '"></span>';
      html += '      <span class="category-name">' + cat + "</span>";
      html += "    </div>";
      html += '    <div style="display:flex;align-items:center;gap:12px;">';
      html += '      <span class="category-count">' + tools.length + " tool" + (tools.length !== 1 ? "s" : "") + " &middot; " + totalMentions + " mention" + (totalMentions !== 1 ? "s" : "") + "</span>";
      html += '      <span class="category-chevron">&#9654;</span>';
      html += "    </div>";
      html += "  </div>";
      html += '  <div class="category-tools">';

      tools.forEach((tool, ti) => {
        const toolId = "cat-tool-" + ci + "-" + ti;
        html += '    <div class="cat-tool-row" data-tool-id="' + toolId + '">';
        html += '      <span class="cat-tool-name">' + tool.name + "</span>";
        html += '      <span class="cat-tool-count">' + tool.count + "/" + data.jd_count + "</span>";
        html += "    </div>";
        html += '    <div class="cat-tool-detail" id="' + toolId + '">';
        tool.jd_indices.forEach((i) => {
          html += '<div class="detail-jd"><span class="detail-jd-num">JD ' + (i + 1) + ":</span> " + escapeHtml(data.jd_summaries[i]) + "</div>";
        });
        html += "    </div>";
      });

      html += "  </div>";
      html += "</div>";
    });

    container.innerHTML = html;

    // Accordion toggle for categories
    container.querySelectorAll(".category-header").forEach((hdr) => {
      hdr.addEventListener("click", () => {
        hdr.parentElement.classList.toggle("open");
      });
    });

    // Toggle tool detail within categories
    container.querySelectorAll(".cat-tool-row").forEach((row) => {
      row.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = row.dataset.toolId;
        document.getElementById(id).classList.toggle("open");
      });
    });
  }

  // --- Utility ---
  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
})();
