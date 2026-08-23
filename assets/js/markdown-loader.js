/**
 * markdown-loader.js
 * ---------------------------------------------------------
 * Charge un article rédigé dans content/news/posts/xxx/index.{fr,en}.md
 * et l'injecte dans le template générique pages/news/article.html
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

  function resolvePost(requested) {
    const legacyPosts = {
      "mentoring-noai-2026": "2026-07-17-mentoring-noai",
      "deep-learning-indaba-2026": "2026-07-03-deep-learning-indaba",
      "end-internship-lrsia-2026": "2026-06-19-end-internship-lrsia",
      "world-backup-day-2026": "2026-03-31-world-backup-day",
      "start-internship-lrsia-2026": "2026-02-16-start-internship-lrsia",
      "retrospective-2025": "2026-01-26-retrospective-2025",
    };
    const resolved = legacyPosts[requested] || requested;
    return /^[a-z0-9-]+$/.test(resolved || "") ? resolved : "";
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
    const post = resolvePost(getParam("post"));
    const root = document.getElementById("article-root");

    if (!post) {
      if (root) root.innerHTML = "<p>Article introuvable (paramètre ?post= manquant).</p>";
      return;
    }

    let localized;
    try {
      const [frResponse, enResponse] = await Promise.all([
        fetch(`../../content/news/posts/${post}/index.fr.md`),
        fetch(`../../content/news/posts/${post}/index.en.md`),
      ]);
      if (!frResponse.ok || !enResponse.ok) throw new Error("404");
      const [frRaw, enRaw] = await Promise.all([frResponse.text(), enResponse.text()]);
      localized = { fr: parseFrontmatter(frRaw), en: parseFrontmatter(enRaw) };
    } catch (err) {
      warnIfFileProtocol();
      if (root) root.innerHTML = "<p>Impossible de charger cet article en protocole file://. Lancez un serveur local HTTP.</p>";
      return;
    }

    const fr = localized.fr.body;
    const en = localized.en.body;
    const frMeta = localized.fr.meta;
    const enMeta = localized.en.meta;
    const meta = { ...enMeta, ...frMeta };

    if (enMeta.title || frMeta.title) document.title = enMeta.title || frMeta.title;

    if (meta.date) {
      const timeEl = document.getElementById("article-date");
      if (timeEl) timeEl.setAttribute("datetime", meta.date);
    }
    setText("date-fr", frMeta.date_display);
    setText("date-en", enMeta.date_display);

    setText("breadcrumb-fr", frMeta.breadcrumb || frMeta.title);
    setText("breadcrumb-en", enMeta.breadcrumb || enMeta.title);

    if (meta.breadcrumb_parent_url) {
      const parentWrap = document.getElementById("breadcrumb-parent");
      const parentLink = document.getElementById("breadcrumb-parent-link");
      if (parentLink) parentLink.setAttribute("href", meta.breadcrumb_parent_url);
      setText("breadcrumb-parent-fr", frMeta.breadcrumb_parent);
      setText("breadcrumb-parent-en", enMeta.breadcrumb_parent);
      if (parentWrap) parentWrap.style.display = "";
    }

    setText("title-fr", frMeta.title);
    setText("title-en", enMeta.title);

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
      setText("caption-fr", frMeta.image_caption);
      setText("caption-en", enMeta.image_caption);
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
