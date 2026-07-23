/**
 * home-loader.js
 * ---------------------------------------------------------
 * Charge le contenu Markdown de la page d'accueil :
 *   - content/home.md   -> section "à propos / about"
 *   - content/news.md   -> liste des actualités (avec pagination)
 *   - content/beyond.md -> section "et sinon / besides that"
 */

(function () {
  "use strict";

  const ITEMS_PER_PAGE = 5;

  function parseMd(text) {
    if (!text) return "";
    if (window.marked && typeof window.marked.parse === "function") return window.marked.parse(text);
    if (typeof window.marked === "function") return window.marked(text);
    return text;
  }

  function parseMdInline(text) {
    if (!text) return "";
    if (window.marked && typeof window.marked.parseInline === "function") return window.marked.parseInline(text);
    return parseMd(text);
  }

  function splitLangBlocks(body) {
    if (!body) return { fr: "", en: "" };
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

  function warnIfFileProtocol() {
    if (window.location.protocol === "file:") {
      console.warn("⚠️ Les navigateurs bloquent fetch() en protocole file:// (CORS). Lancez un serveur HTTP local (ex: 'python3 -m http.server 8000') pour tester le site en local.");
    }
  }

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
      setHTML("about-fr", parseMd(fr));
      setHTML("about-en", parseMd(en));
    } catch (err) {
      warnIfFileProtocol();
      console.error("Impossible de charger content/home.md", err);
    }
  }

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
      <div class="news-item flex flex-col sm:flex-row gap-1 sm:gap-6 items-start text-sm">
        <span class="news-date font-mono text-neutral-500 whitespace-nowrap min-w-[100px]">${item.header}</span>
        <span class="news-content text-neutral-700">
          <span class="fr-text">${parseMdInline(item.fr)}</span>
          <span class="en-text">${parseMdInline(item.en)}</span>
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

      const moreEntry = entries.find((e) => e.header.toUpperCase() === "MORE");
      newsItems = entries.filter((e) => e.header.toUpperCase() !== "MORE");

      initPaginationControls();
      renderNewsPage();

      if (moreEntry) {
        setHTML(
          "news-more",
          `
          <p class="fr-text mt-5 text-sm text-neutral-600">
            ${parseMdInline(moreEntry.fr)}
          </p>
          <p class="en-text mt-5 text-sm text-neutral-600">
            ${parseMdInline(moreEntry.en)}
          </p>`
        );
      }
    } catch (err) {
      warnIfFileProtocol();
      console.error("Impossible de charger content/news.md", err);
    }
  }

  async function loadBeyond() {
    try {
      const res = await fetch("content/beyond.md");
      if (!res.ok) throw new Error("404");
      const raw = await res.text();
      const { fr, en } = splitLangBlocks(raw);
      setHTML("beyond-fr", parseMd(fr));
      setHTML("beyond-en", parseMd(en));
    } catch (err) {
      warnIfFileProtocol();
      console.error("Impossible de charger content/beyond.md", err);
    }
  }

  function init() {
    loadHome();
    loadNews();
    loadBeyond();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();