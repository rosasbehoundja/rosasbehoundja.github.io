import "./main";
import { currentLanguage } from "./main";
import { blogPosts as summaries } from "./generated-content";

interface PostSummary {
  slug: string;
  fr: Record<string, string>;
  en: Record<string, string>;
}

function escapeHTML(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  })[character] ?? character);
}

function formatDate(date: string, language: "fr" | "en"): string {
  return new Intl.DateTimeFormat(language === "fr" ? "fr-FR" : "en-GB", {
    year: "numeric", month: "short", day: "2-digit",
  }).format(new Date(`${date}T00:00:00`));
}

function render(): void {
  const list = document.getElementById("blog-list");
  if (!list) return;
  const language = currentLanguage();
  list.innerHTML = summaries.map((post) => {
    const meta = post[language];
    const status = "status" in meta ? meta.status : undefined;
    const draft = status === "draft" ? ` <span class="blog-draft">${language === "fr" ? "brouillon" : "draft"}</span>` : "";
    return `<article class="blog-entry">
      <time class="blog-date" datetime="${escapeHTML(meta.date ?? "")}">${escapeHTML(formatDate(meta.date ?? "", language))}</time>
      <h2 class="blog-title"><a href="/pages/blog/articles/${encodeURIComponent(post.slug)}/">${escapeHTML(meta.title ?? "")}</a>${draft}</h2>
    </article>`;
  }).join("");
}

render();
document.addEventListener("site:language", render);
