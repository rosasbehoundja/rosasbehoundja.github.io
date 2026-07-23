/**
 * blog-loader.js
 * ---------------------------------------------------------
 * Charge le contenu de content/blog.md et l'affiche
 * sous forme de liste (date — titre/lien) dans blog.html.
 *
 * Format attendu dans blog.md :
 *   ### MM/YYYY — [Titre du post](https://url-externe.com)
 *
 * Chaque entrée ### est parsée en une ligne date + lien.
 */

(function () {
  "use strict";

  function parseMdInline(text) {
    if (!text) return "";
    if (window.marked && typeof window.marked.parseInline === "function") return window.marked.parseInline(text);
    if (window.marked && typeof window.marked.parse === "function") return window.marked.parse(text);
    return text;
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
      console.warn("⚠️ Lancez un serveur HTTP local (ex: 'python3 -m http.server 8000') pour tester le site en local.");
    }
  }

  /**
   * Parse les entrées ### en objets { date, titleHtml }
   * Format: ### MM/YYYY — [Titre](url)
   */
  function parseBlogEntries(md) {
    const entries = [];
    const headerRegex = /^###[ \t]+(.+?)[ \t]*$/gm;
    const matches = [...md.matchAll(headerRegex)];

    for (const match of matches) {
      const raw = match[1].trim();
      // Split on " — " or " - "
      const sepIdx = raw.indexOf("—");
      const sepIdx2 = sepIdx === -1 ? raw.indexOf(" - ") : -1;
      let date, title;
      if (sepIdx !== -1) {
        date = raw.slice(0, sepIdx).trim();
        title = raw.slice(sepIdx + 1).trim();
      } else if (sepIdx2 !== -1) {
        date = raw.slice(0, sepIdx2).trim();
        title = raw.slice(sepIdx2 + 3).trim();
      } else {
        date = "";
        title = raw;
      }
      entries.push({ date, titleHtml: parseMdInline(title) });
    }
    return entries;
  }

  function buildBlogHTML(entries) {
    if (!entries.length) return "<p style='color:var(--text-muted);font-size:0.9rem;'>Nothing here yet.</p>";
    return entries.map((e) =>
      `<div class="blog-entry">
        <span class="blog-date">${e.date}</span>
        <span class="blog-title">${e.titleHtml}</span>
      </div>`
    ).join("");
  }

  async function loadBlog() {
    try {
      const res = await fetch("content/blog.md");
      if (!res.ok) throw new Error("404");
      const raw = await res.text();
      const { fr, en } = splitLangBlocks(raw);

      const frEntries = parseBlogEntries(fr);
      const enEntries = parseBlogEntries(en);

      setHTML("blog-fr", buildBlogHTML(frEntries));
      setHTML("blog-en", buildBlogHTML(enEntries));
    } catch (err) {
      warnIfFileProtocol();
      console.error("Impossible de charger content/blog.md", err);
    }
  }

  function init() {
    loadBlog();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
