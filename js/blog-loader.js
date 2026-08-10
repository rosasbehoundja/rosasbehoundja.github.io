/**
 * Bibliothèque du blog.
 * Les ressources sont éditées dans content/blog-library.json.
 */
(function () {
  "use strict";

  const state = { entries: [], tag: "all", type: "all", query: "" };
  const $ = (selector) => document.querySelector(selector);

  function escapeHTML(value) {
    return String(value || "").replace(/[&<>'"]/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
    }[character]));
  }

  function language() {
    return document.documentElement.classList.contains("lang-fr") ? "fr" : "en";
  }

  function labelFor(entry, field) {
    return entry[`${field}_${language()}`] || entry[`${field}_en`] || entry[field] || "";
  }

  function tagsFor(entry) {
    return entry[`tags_${language()}`] || entry.tags_en || entry.tags || [];
  }

  function typeLabel(kind) {
    if (language() === "fr") return kind === "own" ? "Mon article" : "Ressource externe";
    return kind === "own" ? "My article" : "External resource";
  }

  function formatDate(date) {
    if (!date) return "";
    return new Intl.DateTimeFormat(language() === "fr" ? "fr-FR" : "en-US", {
      year: "numeric", month: "short", day: "numeric"
    }).format(new Date(`${date}T00:00:00`));
  }

  function allTags() {
    return [...new Set(state.entries.flatMap(tagsFor))]
      .sort((a, b) => a.localeCompare(b, "fr"));
  }

  function filteredEntries() {
    const query = state.query.toLocaleLowerCase();
    return state.entries.filter((entry) => {
      const searchable = [
        labelFor(entry, "title"), labelFor(entry, "description"), entry.author,
        entry.source, ...tagsFor(entry)
      ].join(" ").toLocaleLowerCase();
      return (state.type === "all" || entry.kind === state.type)
        && (state.tag === "all" || tagsFor(entry).includes(state.tag))
        && (!query || searchable.includes(query));
    });
  }

  function renderTags() {
    const tags = ["all", ...allTags()];
    const label = (tag) => tag === "all"
      ? (language() === "fr" ? "Tous les tags" : "All tags")
      : tag;
    $("#libraryTags").innerHTML = tags.map((tag) =>
      `<button class="library-tag${state.tag === tag ? " is-active" : ""}" data-tag="${escapeHTML(tag)}" type="button">${escapeHTML(label(tag))}</button>`
    ).join("");
  }

  function renderTypeOptions() {
    const select = $("#libraryType");
    const labels = language() === "fr"
      ? { all: "Tous les types", own: "Mes articles", external: "Ressources externes" }
      : { all: "All types", own: "My articles", external: "External resources" };
    select.innerHTML = Object.entries(labels)
      .map(([value, label]) => `<option value="${value}">${label}</option>`)
      .join("");
    select.value = state.type;
  }

  function renderCards() {
    const entries = filteredEntries();
    const grid = $("#libraryGrid");
    const count = $("#libraryCount");
    const empty = $("#libraryEmpty");
    const countLabel = language() === "fr"
      ? `${entries.length} ressource${entries.length > 1 ? "s" : ""}`
      : `${entries.length} resource${entries.length === 1 ? "" : "s"}`;
    count.textContent = countLabel;
    empty.hidden = entries.length !== 0;

    grid.innerHTML = entries.map((entry) => {
      const external = /^https?:\/\//i.test(entry.url);
      const linkAttrs = external ? ' target="_blank" rel="noopener noreferrer"' : "";
      return `<article class="library-card">
        <div class="library-card-meta">
          <span class="library-kind">${escapeHTML(typeLabel(entry.kind))}</span>
          <span>${entry.status === "draft" ? (language() === "fr" ? "Brouillon" : "Draft") : ""}</span>
          <time datetime="${escapeHTML(entry.date)}">${escapeHTML(formatDate(entry.date))}</time>
        </div>
        <h3><a href="${escapeHTML(entry.url)}"${linkAttrs}>${escapeHTML(labelFor(entry, "title"))}<i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i></a></h3>
        <p>${escapeHTML(labelFor(entry, "description"))}</p>
        <div class="library-card-footer">
          <span>${escapeHTML(entry.author || "")}${entry.source && entry.source !== entry.author ? ` · ${escapeHTML(entry.source)}` : ""}</span>
          <div class="library-card-tags">${tagsFor(entry).map((tag) => `<button type="button" data-tag="${escapeHTML(tag)}">#${escapeHTML(tag)}</button>`).join("")}</div>
        </div>
      </article>`;
    }).join("");
  }

  function render() {
    const search = $("#librarySearch");
    search.placeholder = language() === "fr" ? "Rechercher…" : "Search…";
    search.setAttribute("aria-label", language() === "fr" ? "Rechercher dans la bibliothèque" : "Search the library");
    renderTypeOptions();
    renderTags();
    renderCards();
  }

  function bindEvents() {
    $("#librarySearch").addEventListener("input", (event) => {
      state.query = event.target.value.trim();
      renderCards();
    });
    $("#libraryType").addEventListener("change", (event) => {
      state.type = event.target.value;
      renderCards();
    });
    $("#libraryTags").addEventListener("click", (event) => {
      const button = event.target.closest("button[data-tag]");
      if (!button) return;
      state.tag = button.dataset.tag;
      render();
    });
    $("#libraryGrid").addEventListener("click", (event) => {
      const button = event.target.closest("button[data-tag]");
      if (!button) return;
      state.tag = button.dataset.tag;
      render();
      $("#library").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    const languageObserver = new MutationObserver(render);
    languageObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  }

  async function init() {
    try {
      const response = await fetch("content/blog-library.json");
      if (!response.ok) throw new Error("catalogue introuvable");
      state.entries = await response.json();
      bindEvents();
      render();
    } catch (error) {
      console.error("Impossible de charger la bibliothèque du blog", error);
      $("#libraryEmpty").hidden = false;
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
