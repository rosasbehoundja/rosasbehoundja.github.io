/**
 * markdown-loader.js
 * ---------------------------------------------------------
 * Charge un article rédigé en Markdown (news/posts/xxx.md)
 * et l'injecte dans le template générique news/article.html
 *
 * Format attendu d'un fichier .md :
 *
 * ---
 * title_fr: Titre en français
 * title_en: Title in English
 * date: 2026-02-16
 * date_display_fr: Février 2026
 * date_display_en: February 2026
 * breadcrumb_fr: Nom court FR
 * breadcrumb_en: Short name EN
 * image: ../media/news/exemple.png
 * image_alt: Texte alternatif
 * image_caption_fr: Légende FR
 * image_caption_en: Légende EN
 * ---
 *
 * <!--lang:fr-->
 * Contenu en français, en Markdown classique...
 *
 * <!--lang:en-->
 * Content in English, plain Markdown...
 *
 * Les deux marqueurs <!--lang:fr--> et <!--lang:en--> sont obligatoires
 * et délimitent chaque version. Tout le reste (titres ##, listes,
 * liens, gras, images, citations, tableaux...) est du Markdown standard.
 */

(function () {
  "use strict";

  function getParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  // Parse un frontmatter simple "clé: valeur" (une paire par ligne)
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

  // Sépare le corps en deux blocs Markdown (fr / en)
  function splitLangBlocks(body) {
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
      if (root) root.innerHTML = "<p>Impossible de charger cet article.</p>";
      return;
    }

    const { meta, body } = parseFrontmatter(raw);
    const { fr, en } = splitLangBlocks(body);

    // Titre de l'onglet
    if (meta.title_en) document.title = meta.title_en;

    // Date
    if (meta.date) {
      const timeEl = document.getElementById("article-date");
      if (timeEl) timeEl.setAttribute("datetime", meta.date);
    }
    setText("date-fr", meta.date_display_fr);
    setText("date-en", meta.date_display_en);

    // Fil d'ariane
    setText("breadcrumb-fr", meta.breadcrumb_fr || meta.title_fr);
    setText("breadcrumb-en", meta.breadcrumb_en || meta.title_en);

    // Fil d'ariane : lien intermédiaire optionnel (ex: Home / Stage LRSIA / Conclusion)
    if (meta.breadcrumb_parent_url) {
      const parentWrap = document.getElementById("breadcrumb-parent");
      const parentLink = document.getElementById("breadcrumb-parent-link");
      parentLink.setAttribute("href", meta.breadcrumb_parent_url);
      setText("breadcrumb-parent-fr", meta.breadcrumb_parent_fr);
      setText("breadcrumb-parent-en", meta.breadcrumb_parent_en);
      parentWrap.style.display = "";
    }

    // Titre principal
    setText("title-fr", meta.title_fr);
    setText("title-en", meta.title_en);

    // Image optionnelle
    if (meta.image) {
      const figure = document.getElementById("article-figure");
      const img = document.getElementById("article-image");
      img.src = meta.image;
      img.alt = meta.image_alt || "";
      if (meta.image_width) {
        img.style.width = "auto";
        img.style.maxWidth = meta.image_width;
        img.style.margin = "0 auto";
      }
      setText("caption-fr", meta.image_caption_fr);
      setText("caption-en", meta.image_caption_en);
      figure.style.display = "";
    }

    // Contenu Markdown -> HTML
    setHTML("content-fr", window.marked.parse(fr));
    setHTML("content-en", window.marked.parse(en));
  }

  document.addEventListener("DOMContentLoaded", loadArticle);
})();