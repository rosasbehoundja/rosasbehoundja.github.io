/**
 * markdown-loader.js
 * ---------------------------------------------------------
 * Charge un article rédigé en Markdown (news/posts/xxx.md)
 * et l'injecte dans le template générique news/article.html
 */

(function () {
  "use strict";

  function parseMd(text) {
    if (!text) return "";
    if (window.marked && typeof window.marked.parse === "function") return window.marked.parse(text);
    if (typeof window.marked === "function") return window.marked(text);
    return text;
  }

  function getParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  function parseFrontmatter(raw) {
    const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
    if (!match) {
      return { meta: {}, body: raw };
    }
    const [, frontmatterBlock, body] = match;
    const meta = {};
    frontmatterBlock.split("\n").forEach((line) => {
      const idx = line.indexOf(":");
      if (idx === -1) return;
      const key = line.slice(0, idx).trim();
      const value = line.slice(idx + 1).trim();
      if (key) meta[key] = value;
    });
    return { meta, body };
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

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el && value) el.textContent = value;
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

  async function loadArticle() {
    const post = getParam("post");
    const root = document.getElementById("article-root");

    if (!post) {
      if (root) root.innerHTML = "<p>Article introuvable (paramètre ?post= manquant).</p>";
      return;
    }

    let raw;
    try {
      const res = await fetch(`posts/${post}.md`);
      if (!res.ok) throw new Error("404");
      raw = await res.text();
    } catch (err) {
      warnIfFileProtocol();
      if (root) root.innerHTML = "<p>Impossible de charger cet article en protocole file://. Lancez un serveur local HTTP.</p>";
      return;
    }

    const { meta, body } = parseFrontmatter(raw);
    const { fr, en } = splitLangBlocks(body);

    if (meta.title_en) document.title = meta.title_en;

    if (meta.date) {
      const timeEl = document.getElementById("article-date");
      if (timeEl) timeEl.setAttribute("datetime", meta.date);
    }
    setText("date-fr", meta.date_display_fr);
    setText("date-en", meta.date_display_en);

    setText("breadcrumb-fr", meta.breadcrumb_fr || meta.title_fr);
    setText("breadcrumb-en", meta.breadcrumb_en || meta.title_en);

    if (meta.breadcrumb_parent_url) {
      const parentWrap = document.getElementById("breadcrumb-parent");
      const parentLink = document.getElementById("breadcrumb-parent-link");
      if (parentLink) parentLink.setAttribute("href", meta.breadcrumb_parent_url);
      setText("breadcrumb-parent-fr", meta.breadcrumb_parent_fr);
      setText("breadcrumb-parent-en", meta.breadcrumb_parent_en);
      if (parentWrap) parentWrap.style.display = "";
    }

    setText("title-fr", meta.title_fr);
    setText("title-en", meta.title_en);

    if (meta.image) {
      const figure = document.getElementById("article-figure");
      const img = document.getElementById("article-image");
      if (img) {
        img.src = meta.image;
        img.alt = meta.image_alt || "";
        if (meta.image_width) {
          img.style.width = "auto";
          img.style.maxWidth = meta.image_width;
          img.style.margin = "0 auto";
        }
      }
      setText("caption-fr", meta.image_caption_fr);
      setText("caption-en", meta.image_caption_en);
      if (figure) figure.style.display = "";
    }

    setHTML("content-fr", parseMd(fr));
    setHTML("content-en", parseMd(en));
  }

  function init() {
    loadArticle();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();