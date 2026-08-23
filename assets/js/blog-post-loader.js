(function () {
  "use strict";

  function getPostName() {
    const requested = new URLSearchParams(window.location.search).get("post");
    if (requested === "minizinc-modeling") return "2026-08-10-minizinc-modeling";
    if (requested === "2026-08-27-dli-return") return "2026-08-23-dli-return";
    return /^[a-z0-9-]+$/.test(requested || "") ? requested : "";
  }

  function parseFrontmatter(raw) {
    const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
    if (!match) return { meta: {}, body: raw };
    const meta = {};
    match[1].split("\n").forEach((line) => {
      const index = line.indexOf(":");
      if (index !== -1) meta[line.slice(0, index).trim()] = line.slice(index + 1).trim();
    });
    return { meta, body: match[2] };
  }

  function setMeta(selector, content) {
    const element = document.head.querySelector(selector);
    if (element) element.setAttribute("content", content || "");
  }

  function setPublishedTime(date) {
    if (!date) return;
    let element = document.head.querySelector('meta[property="article:published_time"]');
    if (!element) {
      element = document.createElement("meta");
      element.setAttribute("property", "article:published_time");
      document.head.appendChild(element);
    }
    element.setAttribute("content", date);
  }

  function updateMetadata(frPost, enPost) {
    const isFrench = document.documentElement.classList.contains("lang-fr");
    const post = isFrench ? frPost : enPost;
    const title = post.meta.title || enPost.meta.title || "Blog post";
    const description = post.meta.description || enPost.meta.description || "";
    const canonicalURL = new URL(window.location.href);
    canonicalURL.hash = "";

    document.title = `${title} — Rosas Behoundja`;
    document.querySelector('link[rel="canonical"]').href = canonicalURL.href;
    setMeta('meta[name="description"]', description);
    setMeta('meta[property="og:title"]', title);
    setMeta('meta[property="og:url"]', canonicalURL.href);
    setMeta('meta[property="og:description"]', description);
    setMeta('meta[property="og:locale"]', isFrench ? "fr_FR" : "en_GB");
    setPublishedTime(post.meta.date || enPost.meta.date);
    setMeta('meta[name="twitter:title"]', title);
    setMeta('meta[name="twitter:description"]', description);
  }

  function renderMath(root, attempts = 0) {
    if (window.renderMathInElement) {
      renderMathInElement(root, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false }
        ],
        throwOnError: false
      });
      return;
    }
    if (attempts < 100) setTimeout(() => renderMath(root, attempts + 1), 50);
  }

  async function init() {
    const post = getPostName();
    if (!post) return;
    try {
      const [frResponse, enResponse] = await Promise.all([
        fetch(`../../content/blog/posts/${post}/index.fr.md`),
        fetch(`../../content/blog/posts/${post}/index.en.md`),
      ]);
      if (!frResponse.ok || !enResponse.ok) throw new Error("post not found");
      const [frPost, enPost] = await Promise.all([
        frResponse.text().then(parseFrontmatter),
        enResponse.text().then(parseFrontmatter),
      ]);
      document.querySelector("#post-title-fr").textContent = frPost.meta.title || "";
      document.querySelector("#post-title-en").textContent = enPost.meta.title || "";
      document.querySelector("#post-date").textContent = frPost.meta.date || enPost.meta.date || "";
      document.querySelector("#post-status-fr").style.display = frPost.meta.status === "draft" ? "" : "none";
      document.querySelector("#post-status-en").style.display = enPost.meta.status === "draft" ? "" : "none";
      document.querySelector("#post-content-fr").innerHTML = marked.parse(frPost.body);
      document.querySelector("#post-content-en").innerHTML = marked.parse(enPost.body);
      updateMetadata(frPost, enPost);
      new MutationObserver(() => updateMetadata(frPost, enPost)).observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });
      if (window.Prism) {
        Prism.languages.minizinc = Prism.languages.extend("clike", {
          keyword: /\b(?:array|annotation|bool|constraint|enum|float|function|include|int|maximize|minimize|of|output|predicate|set|solve|string|var)\b/,
          builtin: /\b(?:alldifferent|show|sum)\b/
        });
        Prism.highlightAllUnder(document.querySelector("#blog-post-root"));
      }
      document.querySelectorAll("#blog-post-root pre").forEach((pre) => {
        pre.classList.add("code-block");
        const button = document.createElement("button");
        button.className = "copy-code";
        button.type = "button";
        button.textContent = document.documentElement.classList.contains("lang-fr") ? "Copier" : "Copy";
        button.addEventListener("click", async () => {
          const code = pre.querySelector("code").textContent;
          try {
            await navigator.clipboard.writeText(code);
          } catch (clipboardError) {
            const textarea = document.createElement("textarea");
            textarea.value = code;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            textarea.remove();
          }
          button.textContent = document.documentElement.classList.contains("lang-fr") ? "Copié !" : "Copied!";
          setTimeout(() => { button.textContent = document.documentElement.classList.contains("lang-fr") ? "Copier" : "Copy"; }, 1600);
        });
        pre.appendChild(button);
      });
      renderMath(document.querySelector("#blog-post-root"));
    } catch (error) {
      document.querySelector("#blog-post-root").innerHTML = "<p>Unable to load this blog post.</p>";
      console.error("Impossible de charger le billet de blog", error);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
