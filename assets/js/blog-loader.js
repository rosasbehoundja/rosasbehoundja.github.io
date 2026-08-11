/**
 * Recherche dans les fichiers Markdown des thématiques.
 * La page du blog reste un index ; les résultats apparaissent après une recherche.
 */
(function () {
  "use strict";

  const THEME_SLUGS = ["my-writing", "afrique", "ecriture", "vie", "quete-du-sens", "masters-phd", "recherche", "societe", "ia", "ia-et-societe"];
  const state = { entries: [], tag: "all", query: "" };
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
    return (entry[`tags_${language()}`] || entry.tags_en || entry.tags || []).slice(0, 2);
  }

  function typeLabel(kind) {
    if (language() === "fr") return kind === "own" ? "Mon article" : "Lecture thématique";
    return kind === "own" ? "My article" : "Themed reading";
  }

  function parseTheme(raw, slug) {
    const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
    if (!match) return [];
    const meta = {};
    match[1].split("\n").forEach((line) => {
      const index = line.indexOf(":");
      if (index !== -1) meta[line.slice(0, index).trim()] = line.slice(index + 1).trim();
    });
    const sections = {};
    ["fr", "en"].forEach((lang) => {
      const section = match[2].match(new RegExp(`<!--lang:${lang}-->([\\s\\S]*?)(?=<!--lang:${lang === "fr" ? "en" : ""}-->|$)`));
      sections[lang] = section ? section[1] : "";
    });
    const entries = [];
    const links = sections.fr.matchAll(/^-\s+\[([^\]]+)\]\(([^)]+)\)\s+—\s+(.+)$/gm);
    const englishLinks = [...sections.en.matchAll(/^-\s+\[([^\]]+)\]\(([^)]+)\)\s+—\s+(.+)$/gm)];
    [...links].forEach((link, index) => {
      const en = englishLinks[index] || [];
      entries.push({
        id: `theme-${slug}-${index}`, kind: meta.kind || "external", url: link[2], author: "", source: meta.title_fr || slug,
        title_fr: link[1], description_fr: link[3], title_en: en[1] || link[1], description_en: en[3] || link[3],
        tags_fr: [meta.title_fr || slug], tags_en: [meta.title_en || slug]
      });
    });
    return entries;
  }

  async function loadThemeEntries() {
    const responses = await Promise.all(THEME_SLUGS.map(async (slug) => {
      try {
        const response = await fetch(`../content/blog/themes/${slug}.md`);
        return response.ok ? parseTheme(await response.text(), slug) : [];
      } catch (error) {
        console.warn(`Thématique indisponible : ${slug}`, error);
        return [];
      }
    }));
    return responses.flat();
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
    if (!state.query) return [];
    const query = state.query.toLocaleLowerCase();
    return state.entries.filter((entry) => {
      const searchable = [
        labelFor(entry, "title"), labelFor(entry, "description"), entry.author,
        entry.source, ...tagsFor(entry)
      ].join(" ").toLocaleLowerCase();
      return (state.tag === "all" || tagsFor(entry).includes(state.tag))
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

  function renderCards() {
    const entries = filteredEntries();
    const grid = $("#libraryGrid");
    const count = $("#libraryCount");
    const empty = $("#libraryEmpty");
    const countLabel = language() === "fr"
      ? `${entries.length} ressource${entries.length > 1 ? "s" : ""}`
      : `${entries.length} resource${entries.length === 1 ? "" : "s"}`;
    count.textContent = state.query ? countLabel : "";
    empty.hidden = !state.query || entries.length !== 0;

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
    const tags = $("#libraryTags");
    tags.hidden = !state.query;
    renderTags();
    renderCards();
  }

  function bindEvents() {
    $("#librarySearch").addEventListener("input", (event) => {
      state.query = event.target.value.trim();
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
    bindEvents();
    render();
    try {
      const themeEntries = await loadThemeEntries();
      state.entries = themeEntries;
      render();
    } catch (error) {
      console.error("Impossible de charger la bibliothèque du blog", error);
      $("#libraryEmpty").hidden = false;
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
