const PREFIX = window.APP_PREFIX || "";
const state = {
  activeTag: null,
  activeType: null,
  promptBody: "",
  promptSlug: "",
  offset: 0,
  loading: false,
};

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function toText(value) {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value);
}

function escapeHtml(text) {
  return toText(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeRegExp(text) {
  return toText(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightText(text, query) {
  const value = toText(text);
  if (!query) return escapeHtml(value);

  const regex = new RegExp(escapeRegExp(query), "ig");
  let result = "";
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(value)) !== null) {
    result += escapeHtml(value.slice(lastIndex, match.index));
    result += `<mark>${escapeHtml(match[0])}</mark>`;
    lastIndex = match.index + match[0].length;
  }

  result += escapeHtml(value.slice(lastIndex));
  return result;
}

function highlightVariables(body) {
  return escapeHtml(body).replace(
    /\{\{(\w+)\}\}/g,
    '<span class="variable-highlight">{{$1}}</span>'
  );
}

function truncate(text, maxLen = 160) {
  const value = toText(text).trim();
  if (value.length <= maxLen) return value;
  return `${value.slice(0, maxLen)}...`;
}

async function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const el = document.createElement("textarea");
  el.value = text;
  el.setAttribute("readonly", "");
  el.style.position = "absolute";
  el.style.left = "-9999px";
  document.body.appendChild(el);
  el.select();
  const ok = document.execCommand("copy");
  document.body.removeChild(el);
  if (!ok) {
    throw new Error("Clipboard copy failed");
  }
}

// ---------------------------------------------------------------------------
// Prompt card (shared between index and search)
// ---------------------------------------------------------------------------

function createPromptCard(prompt, options = {}) {
  const { query = "", showSnippet = false } = options;

  const card = document.createElement("a");
  card.className = "prompt-card";
  card.href = `${PREFIX}/prompt/${prompt.slug}`;

  if (prompt.type) {
    const typeBadge = document.createElement("span");
    typeBadge.className = `type-badge type-${prompt.type}`;
    typeBadge.textContent = prompt.type === "ai-prompt" ? "AI Prompt" : "Template";
    card.appendChild(typeBadge);
  }

  const title = document.createElement("div");
  title.className = "prompt-card-title";
  title.innerHTML = query ? highlightText(prompt.name, query) : escapeHtml(prompt.name);
  card.appendChild(title);

  if (prompt.description) {
    const desc = document.createElement("div");
    desc.className = "prompt-card-desc";
    const text = truncate(prompt.description, 120);
    desc.innerHTML = query ? highlightText(text, query) : escapeHtml(text);
    card.appendChild(desc);
  }

  if (showSnippet && prompt.snippet) {
    const snippet = document.createElement("div");
    snippet.className = "prompt-card-snippet";
    snippet.innerHTML = query
      ? highlightText(prompt.snippet, query)
      : escapeHtml(prompt.snippet);
    card.appendChild(snippet);
  }

  const meta = document.createElement("div");
  meta.className = "prompt-card-meta";
  const parts = [];

  if (prompt.variables && prompt.variables.length) {
    parts.push(`${prompt.variables.length} variable${prompt.variables.length === 1 ? "" : "s"}`);
  }

  if (prompt.source_file) {
    parts.push(prompt.source_file);
  }

  if (parts.length) {
    meta.textContent = parts.join(" · ");
    card.appendChild(meta);
  }

  if (prompt.tags && prompt.tags.length) {
    const tagWrap = document.createElement("div");
    tagWrap.className = "prompt-card-tags";
    prompt.tags.forEach((tag) => {
      const chip = document.createElement("span");
      chip.className = "tag-chip-small";
      chip.textContent = tag;
      tagWrap.appendChild(chip);
    });
    card.appendChild(tagWrap);
  }

  return card;
}

// ---------------------------------------------------------------------------
// Index page
// ---------------------------------------------------------------------------

async function loadTags() {
  const bar = document.getElementById("tag-bar");
  if (!bar) return;

  let url = PREFIX + "/api/tags";
  if (state.activeType) {
    url += `?type=${encodeURIComponent(state.activeType)}`;
  }
  const res = await fetch(url);
  if (!res.ok) return;

  const data = await res.json();
  const tags = data.tags || [];

  if (!tags.length) {
    bar.style.display = "none";
    return;
  }

  bar.style.display = "";
  bar.classList.remove("expanded");
  bar.innerHTML = "";

  const allChip = document.createElement("button");
  allChip.className = "tag-chip active";
  allChip.textContent = "All";
  allChip.addEventListener("click", () => {
    state.activeTag = null;
    state.offset = 0;
    updateActiveChip(bar);
    loadPrompts(false);
  });
  bar.appendChild(allChip);

  tags.forEach((tag) => {
    const chip = document.createElement("button");
    chip.className = "tag-chip";
    chip.textContent = tag.name;
    chip.dataset.tag = tag.name;
    chip.addEventListener("click", () => {
      state.activeTag = tag.name;
      state.offset = 0;
      updateActiveChip(bar);
      loadPrompts(false);
    });
    bar.appendChild(chip);
  });

  // Add toggle if tags overflow
  requestAnimationFrame(() => {
    if (bar.scrollHeight > 96) {
      const toggle = document.createElement("button");
      toggle.className = "tag-toggle";
      toggle.textContent = "Show more";
      toggle.addEventListener("click", () => {
        const expanded = bar.classList.toggle("expanded");
        toggle.textContent = expanded ? "Show less" : "Show more";
      });
      bar.appendChild(toggle);
    }
  });
}

function updateActiveChip(bar) {
  bar.querySelectorAll(".tag-chip").forEach((chip) => {
    const isActive = state.activeTag
      ? chip.dataset.tag === state.activeTag
      : !chip.dataset.tag;
    chip.classList.toggle("active", isActive);
  });
}

async function loadPrompts(append = true) {
  if (state.loading) return;

  state.loading = true;

  let url = `${PREFIX}/api/prompts?offset=${state.offset}&limit=50`;
  if (state.activeType) {
    url += `&type=${encodeURIComponent(state.activeType)}`;
  }
  if (state.activeTag) {
    url += `&tag=${encodeURIComponent(state.activeTag)}`;
  }

  const res = await fetch(url);
  state.loading = false;
  if (!res.ok) return;

  const data = await res.json();
  const prompts = data.prompts || [];
  const grid = document.getElementById("prompt-grid");

  if (!append) {
    grid.innerHTML = "";
    state.offset = 0;
  }

  if (!append && prompts.length === 0) {
    grid.innerHTML = '<div class="empty-state">No prompts yet.</div>';
  }

  prompts.forEach((prompt) => {
    grid.appendChild(createPromptCard(prompt));
  });

  state.offset += prompts.length;

  const loadMore = document.getElementById("load-more");
  if (loadMore) {
    loadMore.style.display = data.has_more ? "inline-flex" : "none";
  }
}

async function loadTypes() {
  const bar = document.getElementById("type-bar");
  if (!bar) return;

  const res = await fetch(PREFIX + "/api/types");
  if (!res.ok) return;

  const data = await res.json();
  const types = data.types || [];

  if (types.length <= 1) {
    bar.style.display = "none";
    return;
  }

  bar.innerHTML = "";

  const allBtn = document.createElement("button");
  allBtn.className = "type-btn active";
  allBtn.textContent = "All";
  allBtn.addEventListener("click", () => {
    state.activeType = null;
    state.activeTag = null;
    state.offset = 0;
    updateActiveTypeBtn(bar);
    loadTags();
    loadPrompts(false);
  });
  bar.appendChild(allBtn);

  const typeLabels = { "ai-prompt": "AI Prompts", "template": "Templates" };
  types.forEach((t) => {
    const btn = document.createElement("button");
    btn.className = "type-btn";
    btn.textContent = `${typeLabels[t.name] || t.name} (${t.count})`;
    btn.dataset.type = t.name;
    btn.addEventListener("click", () => {
      state.activeType = t.name;
      state.activeTag = null;
      state.offset = 0;
      updateActiveTypeBtn(bar);
      loadTags();
      loadPrompts(false);
    });
    bar.appendChild(btn);
  });
}

function updateActiveTypeBtn(bar) {
  bar.querySelectorAll(".type-btn").forEach((btn) => {
    const isActive = state.activeType
      ? btn.dataset.type === state.activeType
      : !btn.dataset.type;
    btn.classList.toggle("active", isActive);
  });
}

function initIndex() {
  const loadMore = document.getElementById("load-more");
  if (loadMore) {
    loadMore.addEventListener("click", () => loadPrompts(true));
  }

  loadTypes();
  loadTags();
  loadPrompts(false);
}

// ---------------------------------------------------------------------------
// Prompt detail page
// ---------------------------------------------------------------------------

async function initPrompt() {
  const slug = document.body.dataset.promptSlug;
  const container = document.getElementById("prompt-detail");

  if (!slug) {
    container.innerHTML = '<div class="status">Prompt not found.</div>';
    return;
  }

  const res = await fetch(`${PREFIX}/api/prompts/${slug}`);
  if (!res.ok) {
    container.innerHTML = '<div class="status">Could not load prompt.</div>';
    return;
  }

  const prompt = await res.json();
  const titleEl = document.getElementById("prompt-title");
  titleEl.textContent = prompt.name;
  document.title = prompt.name;

  let html = '<div class="card prompt-detail-card">';

  if (prompt.type) {
    const typeLabel = prompt.type === "ai-prompt" ? "AI Prompt" : "Template";
    html += `<span class="type-badge type-${prompt.type}">${typeLabel}</span>`;
  }

  if (prompt.description) {
    html += `<p class="prompt-description">${escapeHtml(prompt.description)}</p>`;
  }

  if (prompt.tags && prompt.tags.length) {
    html += '<div class="prompt-tags">';
    prompt.tags.forEach((tag) => {
      html += `<span class="tag-chip-small">${escapeHtml(tag)}</span>`;
    });
    html += "</div>";
  }

  if (prompt.variables && prompt.variables.length) {
    html += '<div class="prompt-variables">';
    html += '<span class="section-label">Variables: </span>';
    prompt.variables.forEach((variable) => {
      html += `<code class="variable-badge">{{${escapeHtml(variable)}}}</code> `;
    });
    html += "</div>";
  }

  const metaParts = [];
  if (prompt.variables && prompt.variables.length) {
    metaParts.push(`<span>${prompt.variables.length} variable${prompt.variables.length === 1 ? "" : "s"}</span>`);
  }
  if (prompt.source_file) {
    metaParts.push(`<span>${escapeHtml(prompt.source_file)}</span>`);
  }
  if (metaParts.length) {
    html += `<div class="prompt-meta-row">${metaParts.join('<span class="meta-dot">\u00b7</span>')}</div>`;
  }

  html += "</div>";

  html += '<div class="code-card">';
  html += '<div class="section-title">Prompt body</div>';
  html += `<pre class="code-panel">${highlightVariables(prompt.body)}</pre>`;
  html += "</div>";

  html += '<div class="actions prompt-actions">';
  html += '<button class="primary" id="copy-btn">Copy to clipboard</button>';
  if (prompt.variables && prompt.variables.length) {
    html += `<a class="primary" href="${PREFIX}/prompt/${slug}/run">Run with variables</a>`;
  }
  html += '<span class="status" id="copy-status"></span>';
  html += "</div>";

  container.innerHTML = html;

  document.getElementById("copy-btn").addEventListener("click", async () => {
    const btn = document.getElementById("copy-btn");
    const status = document.getElementById("copy-status");

    status.textContent = "";

    try {
      await copyToClipboard(prompt.body);
      btn.textContent = "Copied!";
      setTimeout(() => {
        btn.textContent = "Copy to clipboard";
      }, 2000);
    } catch (_error) {
      status.textContent = "Could not copy prompt.";
    }
  });
}

// ---------------------------------------------------------------------------
// Run page
// ---------------------------------------------------------------------------

async function initRun() {
  const slug = document.body.dataset.promptSlug;
  const res = await fetch(`${PREFIX}/api/prompts/${slug}`);

  if (!res.ok) {
    document.getElementById("run-form").innerHTML =
      '<p class="status">Could not load prompt.</p>';
    return;
  }

  const prompt = await res.json();
  document.getElementById("run-title").textContent = prompt.name;
  document.title = `Run: ${prompt.name}`;
  document.getElementById("back-link").href = `${PREFIX}/prompt/${slug}`;

  state.promptBody = prompt.body;
  state.promptSlug = slug;

  const form = document.getElementById("run-form");

  if (!prompt.variables || !prompt.variables.length) {
    form.innerHTML =
      '<p class="status">This prompt has no variables. You can copy it directly from the detail page.</p>';
    updatePreview();
    return;
  }

  prompt.variables.forEach((variable) => {
    const group = document.createElement("div");
    group.className = "form-group";

    const label = document.createElement("label");
    label.textContent = variable;
    label.setAttribute("for", `var-${variable}`);

    const input = document.createElement("input");
    input.type = "text";
    input.id = `var-${variable}`;
    input.dataset.variable = variable;
    input.placeholder = `Enter ${variable}...`;
    input.addEventListener("input", updatePreview);

    group.appendChild(label);
    group.appendChild(input);
    form.appendChild(group);
  });

  updatePreview();

  document.getElementById("copy-btn").addEventListener("click", async () => {
    const status = document.getElementById("copy-status");
    status.textContent = "";

    const inputs = document.querySelectorAll("#run-form input[data-variable]");
    const variables = {};
    inputs.forEach((input) => {
      variables[input.dataset.variable] = input.value;
    });

    const runRes = await fetch(`${PREFIX}/api/prompts/${state.promptSlug}/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variables }),
    });

    if (!runRes.ok) {
      const err = await runRes.json().catch(() => ({}));
      status.textContent = err.error || "Could not render prompt.";
      return;
    }

    const data = await runRes.json();

    try {
      await copyToClipboard(data.rendered);
      const btn = document.getElementById("copy-btn");
      btn.textContent = "Copied!";
      setTimeout(() => {
        btn.textContent = "Copy to clipboard";
      }, 2000);
      status.textContent = "";
    } catch (_error) {
      status.textContent = "Could not copy prompt.";
    }
  });
}

function updatePreview() {
  const inputs = document.querySelectorAll("#run-form input[data-variable]");
  const variables = {};
  inputs.forEach((input) => {
    variables[input.dataset.variable] = input.value;
  });

  let rendered = state.promptBody;
  for (const [key, value] of Object.entries(variables)) {
    const token = `{{${key}}}`;
    rendered = rendered.replaceAll(token, value || token);
  }

  const preview = document.getElementById("preview-panel");
  preview.innerHTML = highlightVariables(rendered);
}

// ---------------------------------------------------------------------------
// Search page
// ---------------------------------------------------------------------------

function initSearch() {
  const input = document.getElementById("search-input");
  const meta = document.getElementById("search-meta");
  const results = document.getElementById("search-results");
  let timer;

  input.addEventListener("input", () => {
    const query = input.value.trim();
    clearTimeout(timer);

    if (!query) {
      meta.textContent = "";
      results.innerHTML = "";
      return;
    }

    timer = setTimeout(async () => {
      const res = await fetch(`${PREFIX}/api/search?q=${encodeURIComponent(query)}&limit=100`);
      if (!res.ok) {
        meta.textContent = "Search failed.";
        return;
      }

      const data = await res.json();
      const items = data.results || [];
      const total = Number.isFinite(data.total) ? data.total : items.length;

      meta.textContent = `${total} result${total === 1 ? "" : "s"} for "${query}"`;
      results.innerHTML = "";

      if (items.length === 0) {
        results.innerHTML = '<div class="empty-state">No matching prompts found.</div>';
        return;
      }

      items.forEach((prompt) => {
        results.appendChild(createPromptCard(prompt, { query, showSnippet: true }));
      });
    }, 300);
  });
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;
  if (page === "index") initIndex();
  else if (page === "prompt") initPrompt();
  else if (page === "run") initRun();
  else if (page === "search") initSearch();
});
