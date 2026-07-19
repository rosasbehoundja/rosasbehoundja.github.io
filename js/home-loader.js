/**
 * home-loader.js
 * ---------------------------------------------------------
 * Charge le contenu Markdown de la page d'accueil :
 *   - content/home.md   -> section "à propos / about"
 *   - content/news.md   -> liste des actualités (avec pagination)
 *
 * Même principe que news/markdown-loader.js : blocs <!--lang:fr-->
 * et <!--lang:en--> parsés avec marked.js.
 *
 * Nécessite marked.js chargé AVANT ce script (voir index.html).
 */

(function () {
  "use strict";

  const ITEMS_PER_PAGE = 5;

  // ---- Helpers (repris du même format que markdown-loader.js) ----

  function splitLangBlocks(body) {
    const frMatch = body.match(/<!--lang:fr-->([\s\S]*?)(?=<!--lang:en-->|$)/);
    const enMatch = body.match(/<!--lang:en-->([\s\S]*)/);
    return {
      fr: frMatch ? frMatch[1].trim() : "",
      en: enMatch ? enMatch[1].trim() : "",
    };
  }

  function setHTML(id, html) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  }

  // Découpe news.md en entrées, chacune démarrant par "### <header>"
  function parseNewsEntries(raw) {
    const entries = [];
    const headerRegex = /^###[ \t]+(.+?)[ \t]*$/gm;
    const matches = [...raw.matchAll(headerRegex)];

    for (let i = 0; i < matches.length; i++) {
      const header = matches[i][1].trim();
      const start = matches[i].index + matches[i][0].length;
      const end = i + 1 < matches.length ? matches[i + 1].index : raw.length;
      const block = raw.slice(start, end);
      const { fr, en } = splitLangBlocks(block);
      entries.push({ header, fr, en });
    }
    return entries;
  }

  async function loadHome() {
    try {
      const res = await fetch("content/home.md");
      if (!res.ok) throw new Error("404");
      const raw = await res.text();
      const { fr, en } = splitLangBlocks(raw);
      setHTML("about-fr", window.marked.parse(fr));
      setHTML("about-en", window.marked.parse(en));
    } catch (err) {
      console.error("Impossible de charger content/home.md", err);
    }
  }

  // ---- Chargement + pagination des news ----
  let newsItems = [];
  let currentPage = 0;

  function renderNewsPage() {
    const list = document.getElementById("news-list");
    if (!list) return;

    const start = currentPage * ITEMS_PER_PAGE;
    const pageItems = newsItems.slice(start, start + ITEMS_PER_PAGE);

    list.innerHTML = pageItems
      .map(
        (item) => `
      <div class="news-item">
        <span class="news-date">${item.header}</span>
        <span class="news-content">
          <span class="fr-text">${window.marked.parseInline(item.fr)}</span>
          <span class="en-text">${window.marked.parseInline(item.en)}</span>
        </span>
      </div>`
      )
      .join("");

    const totalPages = Math.max(1, Math.ceil(newsItems.length / ITEMS_PER_PAGE));
    const pagination = document.getElementById("newsPagination");
    const indicator = document.getElementById("newsPageIndicator");
    const prevBtn = document.getElementById("prevNews");
    const nextBtn = document.getElementById("nextNews");

    if (!pagination || !indicator || !prevBtn || !nextBtn) return;

    if (totalPages <= 1) {
      pagination.style.display = "none";
    } else {
      pagination.style.display = "";
      indicator.textContent = `${currentPage + 1} / ${totalPages}`;
      prevBtn.disabled = currentPage === 0;
      nextBtn.disabled = currentPage >= totalPages - 1;
    }
  }

  function initPaginationControls() {
    const prevBtn = document.getElementById("prevNews");
    const nextBtn = document.getElementById("nextNews");
    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        if (currentPage > 0) {
          currentPage--;
          renderNewsPage();
        }
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        const totalPages = Math.ceil(newsItems.length / ITEMS_PER_PAGE);
        if (currentPage < totalPages - 1) {
          currentPage++;
          renderNewsPage();
        }
      });
    }
  }

  async function loadNews() {
    try {
      const res = await fetch("content/news.md");
      if (!res.ok) throw new Error("404");
      const raw = await res.text();
      const entries = parseNewsEntries(raw);

      // Sépare l'entrée spéciale "MORE" (phrase de lien sous la pagination)
      const moreEntry = entries.find((e) => e.header.toUpperCase() === "MORE");
      newsItems = entries.filter((e) => e.header.toUpperCase() !== "MORE");

      initPaginationControls();
      renderNewsPage();

      if (moreEntry) {
        setHTML(
          "news-more",
          `
          <p class="fr-text" style="margin-top: 20px; font-size: 0.9rem;">
            ${window.marked.parseInline(moreEntry.fr)}
          </p>
          <p class="en-text" style="margin-top: 20px; font-size: 0.9rem;">
            ${window.marked.parseInline(moreEntry.en)}
          </p>`
        );
      }
    } catch (err) {
      console.error("Impossible de charger content/news.md", err);
    }
  }

  // ---- Chargement section "et sinon / besides that" ----
  async function loadBeyond() {
    try {
      const res = await fetch("content/beyond.md");
      if (!res.ok) throw new Error("404");
      const raw = await res.text();
      const { fr, en } = splitLangBlocks(raw);
      setHTML("beyond-fr", window.marked.parse(fr));
      setHTML("beyond-en", window.marked.parse(en));
    } catch (err) {
      console.error("Impossible de charger content/beyond.md", err);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    loadHome();
    loadNews();
    loadBeyond();
  });
})();