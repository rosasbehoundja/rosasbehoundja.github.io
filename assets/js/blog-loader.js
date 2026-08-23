/** Affiche les billets locaux, du plus récent au plus ancien. */
(function () {
  "use strict";

  const POST_SLUGS = [
    "2026-08-23-dli-return",
    "2026-08-23-reading-of-the-week-1",
    "2026-08-10-minizinc-modeling",
  ];
  const list = document.querySelector("#blog-list");

  function parseFrontmatter(raw) {
    const match = raw.match(/^---\s*\n([\s\S]*?)\n---/);
    if (!match) return {};
    const meta = {};
    match[1].split("\n").forEach((line) => {
      const separator = line.indexOf(":");
      if (separator !== -1) meta[line.slice(0, separator).trim()] = line.slice(separator + 1).trim();
    });
    return meta;
  }

  function language() {
    return document.documentElement.classList.contains("lang-fr") ? "fr" : "en";
  }

  function formatDate(date) {
    return new Intl.DateTimeFormat(language() === "fr" ? "fr-FR" : "en-GB", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(new Date(`${date}T00:00:00`));
  }

  function escapeHTML(value) {
    return String(value || "").replace(/[&<>'"]/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
    }[character]));
  }

  let posts = [];

  function render() {
    if (!list) return;
    const currentLanguage = language();
    list.innerHTML = posts.map((post) => {
      const meta = post[currentLanguage];
      const draft = meta.status === "draft"
        ? ` <span class="blog-draft">${currentLanguage === "fr" ? "brouillon" : "draft"}</span>`
        : "";
      return `<article class="blog-entry">
        <time class="blog-date" datetime="${escapeHTML(meta.date)}">${escapeHTML(formatDate(meta.date))}</time>
        <h2 class="blog-title"><a href="blog/post.html?post=${encodeURIComponent(post.slug)}">${escapeHTML(meta.title)}</a>${draft}</h2>
      </article>`;
    }).join("");
  }

  async function init() {
    try {
      posts = (await Promise.all(POST_SLUGS.map(async (slug) => {
        try {
          const [frResponse, enResponse] = await Promise.all([
            fetch(`../content/blog/posts/${slug}/index.fr.md`),
            fetch(`../content/blog/posts/${slug}/index.en.md`),
          ]);
          if (!frResponse.ok || !enResponse.ok) throw new Error(`Billet introuvable : ${slug}`);
          const [fr, en] = await Promise.all([frResponse.text(), enResponse.text()]);
          return { slug, fr: parseFrontmatter(fr), en: parseFrontmatter(en) };
        } catch (error) {
          console.warn(`Billet ignoré : ${slug}`, error);
          return null;
        }
      }))).filter(Boolean);
      if (!posts.length) throw new Error("Aucun billet disponible");
      posts.sort((a, b) => b.en.date.localeCompare(a.en.date));
      render();
      new MutationObserver(render).observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });
    } catch (error) {
      list.innerHTML = `<p>${language() === "fr" ? "Impossible de charger les articles." : "Unable to load the articles."}</p>`;
      console.error("Impossible de charger les articles du blog", error);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
