import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { marked } from "marked";
import sharp from "sharp";
import { faEnvelope, faFileArrowDown } from "@fortawesome/free-solid-svg-icons";
import { faGithub, faLinkedinIn } from "@fortawesome/free-brands-svg-icons";
import { escape, localized, page } from "./templates.ts";
import type { Language } from "./templates.ts";
import { parseFrontmatter } from "../src/content.ts";

type Kind = "blog" | "news";
type Document = ReturnType<typeof parseFrontmatter>;
interface Post { slug: string; kind: Kind; fr: Document; en: Document }
const root = process.cwd();
const siteUrl = "https://rosasbehoundja.github.io";
const imageDimensions = new Map<string, { width: number; height: number }>();
const profileIcons = { mail: faEnvelope, resume: faFileArrowDown, github: faGithub, linkedin: faLinkedinIn };

function profileIcon(name: keyof typeof profileIcons): string {
  const [width, height, , , paths] = profileIcons[name].icon;
  const pathElements = (Array.isArray(paths) ? paths : [paths]).map(path => `<path fill="currentColor" d="${path}"></path>`).join("");
  return `<svg viewBox="0 0 ${width} ${height}" aria-hidden="true" focusable="false">${pathElements}</svg>`;
}
function imageFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? imageFiles(path) : /\.(png|jpe?g|gif|webp|avif|svg)$/i.test(path) ? [path] : [];
  });
}
await Promise.all([...imageFiles(resolve(root, "assets/media")), ...imageFiles(resolve(root, "contents"))].map(async path => {
  const { width, height } = await sharp(path).metadata();
  if (width && height) imageDimensions.set(path, { width, height });
}));

function write(path: string, content: string): void {
  const output = resolve(root, path);
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, content);
}

function source(path: string, language: Language): string {
  return readFileSync(resolve(root, `contents/${path}/index.${language}.md`), "utf8");
}

function imageAttributes(html: string): string {
  return html.replace(/<img\b[^>]*>/g, tag => {
    const src = tag.match(/\bsrc="([^"]+)"/)?.[1];
    let attributes = ' decoding="async"';
    if (!/\bloading=/.test(tag)) attributes += ' loading="lazy"';
    if (src && !/^(https?:|data:)/.test(src) && !/\bwidth=/.test(tag)) {
      const file = resolve(root, src.replace(/^\//, ""));
      const dimensions = imageDimensions.get(file);
      if (dimensions) {
        const { width, height } = dimensions;
        attributes += ` width="${width}" height="${height}"`;
      }
    }
    return tag.replace(/\s*\/?>$/, `${attributes}>`);
  });
}

function markdown(body: string, post?: Post): string {
  let html = marked.parse(body, { async: false });
  html = html.replace(/<span data-profile-icon="(mail|resume|github|linkedin)"><\/span>/g, (_, name: keyof typeof profileIcons) => profileIcon(name));
  if (post) html = html.replace(/((?:src|href)=["'])imgs\//g, `$1/contents/${post.kind}/posts/${post.slug}/imgs/`);
  html = html.replaceAll('../../content/', '/contents/').replaceAll('../../contents/', '/contents/').replaceAll('../../assets/', '/assets/')
    .replace(/(?:\.\.\/)?article\.html\?post=([a-z0-9-]+)/g, "/pages/news/articles/$1/")
    .replace(/(?:\.\.\/)?post\.html\?post=([a-z0-9-]+)/g, "/pages/blog/articles/$1/");
  return imageAttributes(html).replace(/<table>/g, '<div class="table-scroll" tabindex="0" role="region" aria-label="Table"><table>').replace(/<\/table>/g, '</table></div>');
}

function bilingual(path: string): string {
  return (["fr", "en"] as const).map(lang => `<div class="${lang}-text markdown-body" lang="${lang}">${markdown(source(path, lang))}</div>`).join("");
}

function posts(kind: Kind): Post[] {
  return readdirSync(resolve(root, `contents/${kind}/posts`), { withFileTypes: true })
    .filter(entry => entry.isDirectory() && /^[a-z0-9-]+$/.test(entry.name))
    .map(entry => {
      const post = { slug: entry.name, kind, fr: parseFrontmatter(source(`${kind}/posts/${entry.name}`, "fr")), en: parseFrontmatter(source(`${kind}/posts/${entry.name}`, "en")) };
      for (const lang of ["fr", "en"] as const) {
        const meta = post[lang].meta;
        if (!meta.title || !meta.date || !/^\d{4}-\d{2}-\d{2}$/.test(meta.date) || Number.isNaN(Date.parse(meta.date))) throw new Error(`Missing title or valid date: ${kind}/${entry.name}/${lang}`);
      }
      return post;
    }).sort((a, b) => b.en.meta.date!.localeCompare(a.en.meta.date!));
}

function imageUrl(path: string, post: Post): string {
  if (/^https?:\/\//.test(path)) return path;
  const normalized = path.replace(/^\.\.\/\.\.\/(?:content|contents)\//, "/contents/").replace(/^\.\.\/\.\.\/assets\//, "/assets/");
  return normalized.startsWith("/") ? `${siteUrl}${normalized}` : `${siteUrl}/contents/${post.kind}/posts/${post.slug}/${normalized}`;
}

const blogPosts = posts("blog");
const newsPosts = posts("news");
for (const post of [...blogPosts, ...newsPosts]) {
  const { kind, slug, fr, en } = post;
  const path = `/pages/${kind}/articles/${slug}/`;
  const title = en.meta.title!;
  const preview = en.meta.preview_image || fr.meta.preview_image || en.meta.image || fr.meta.image;
  const firstImage = markdown(en.body, post).match(/<img\b[^>]*src="([^"]+)"[^>]*>/)?.[0];
  const previewPath = preview || firstImage?.match(/src="([^"]+)"/)?.[1];
  const image = previewPath ? { url: imageUrl(previewPath, post), alt: en.meta.preview_image_alt || en.meta.image_alt || firstImage?.match(/alt="([^"]*)"/)?.[1] || title } : undefined;
  const hero = fr.meta.image || en.meta.image;
  const figure = hero ? imageAttributes(`<figure class="article-figure"><img src="${escape(imageUrl(hero, post).replace(siteUrl, ""))}" loading="eager" alt="${escape(en.meta.image_alt || fr.meta.image_alt)}"><figcaption>${localized(escape(fr.meta.image_caption), escape(en.meta.image_caption))}</figcaption></figure>`) : "";
  const backUrl = kind === "blog" ? "/pages/blog.html" : "/pages/news/";
  const backLabel = localized(kind === "blog" ? "Retour aux articles" : "Retour aux actualités", kind === "blog" ? "Back to articles" : "Back to news");
  const body = `<a class="article-back" href="${backUrl}"><svg viewBox="0 0 28 20" aria-hidden="true"><path d="M11 3 4 10l7 7M5 10h11c5 0 8-2.5 8-7"/></svg>${backLabel}</a>
  <header class="page-header">
    ${localized(fr.meta.status === "draft" ? '<span class="blog-post-status">brouillon</span>' : "", en.meta.status === "draft" ? '<span class="blog-post-status">draft</span>' : "")}
    <time datetime="${en.meta.date}">${localized(escape(fr.meta.date_display || fr.meta.date), escape(en.meta.date_display || en.meta.date))}</time>
    <h1>${localized(escape(fr.meta.title), escape(en.meta.title))}</h1>
  </header>${figure}${(["fr", "en"] as const).map(lang => `<article class="${lang}-text markdown-body" lang="${lang}">${markdown(post[lang].body, post)}</article>`).join("")}`;
  write(`${path}index.html`.slice(1), page({ title: `${title} — Rosas Behoundja`, description: en.meta.description || fr.meta.description || title, path, active: kind === "blog" ? "blog" : "news", article: true, date: en.meta.date, image, body }));
}

function newsEntries(raw: string, lang: Language): Array<{ date: string; year: string; month: string; body: string }> {
  const months = Array.from({ length: 12 }, (_, index) => new Intl.DateTimeFormat(lang, { month: "long", timeZone: "UTC" }).format(new Date(Date.UTC(2026, index, 1))).toLowerCase());
  const shortMonths = lang === "en"
    ? ["jan.", "feb.", "mar.", "apr.", "may", "june", "july", "aug.", "sept.", "oct.", "nov.", "dec."]
    : ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
  const matches = [...raw.matchAll(/^(#{2,3})[ \t]+(.+?)[ \t]*$/gm)];
  let year = "";
  return matches.flatMap((match, i) => {
    const heading = match[2]!;
    if (match[1] === "##") {
      if (!/^\d{4}$/.test(heading)) throw new Error(`Invalid news year: ${heading} (${lang})`);
      year = heading;
      return [];
    }
    const body = raw.slice(match.index! + match[0].length, matches[i + 1]?.index ?? raw.length).trim();
    if (heading.toUpperCase() === "MORE") return [{ date: heading, year, month: "", body }];
    const month = months.findIndex((name, index) => name === heading.toLowerCase() || shortMonths[index] === heading.toLowerCase());
    if (!year || month === -1) throw new Error(`News entries need a ## year and a ### month name: ${heading} (${lang})`);
    return [{ date: shortMonths[month]!, year, month: String(month + 1).padStart(2, "0"), body }];
  });
}

const news = (["fr", "en"] as const).map(lang => {
  const years = new Map<string, ReturnType<typeof newsEntries>>();
  const more: string[] = [];
  for (const entry of newsEntries(source("pages/news", lang), lang)) {
    if (entry.date.toUpperCase() === "MORE") {
      more.push(`<div class="markdown-body">${markdown(entry.body)}</div>`);
      continue;
    }
    const year = entry.year;
    if (!years.has(year)) years.set(year, []);
    years.get(year)!.push(entry);
  }
  const groups = [...years.entries()].sort(([a], [b]) => Number(b) - Number(a)).map(([year, entries]) => {
    const headingId = `news-${year}-${lang}`;
    const items = entries.map(entry => `<li class="news-item"><time class="news-date" datetime="${year}-${entry.month}">${escape(entry.date)}</time><div class="news-content markdown-body">${markdown(entry.body)}</div></li>`).join("");
    return `<section class="news-year" aria-labelledby="${headingId}"><h2 id="${headingId}">${year}</h2><ul class="news-year-items" role="list">${items}</ul></section>`;
  }).join("");
  return `<div class="${lang}-text" lang="${lang}">${groups}${more.join("")}</div>`;
}).join("");

write("index.html", page({ title: "Rosas Behoundja", description: "Rosas Behoundja's personal website: research, projects, and writing on combinatorial optimisation, machine learning, and responsible AI.", path: "/", active: "home", body: `
  <section>${bilingual("pages/home")}</section>` }));

write("pages/news/index.html", page({ title: "News — Rosas Behoundja", description: "Recent activities and milestones from Rosas Behoundja.", path: "/pages/news/", active: "news", body: `<div id="news-list">${news}</div>` }));

write("pages/work.html", page({ title: "Work — Rosas Behoundja", description: "Research, projects, and writing on combinatorial optimisation, machine learning, and responsible AI.", path: "/pages/work.html", active: "work", body: `<h1 class="sr-only">${localized("Travaux", "Work")}</h1><section id="view-work">${bilingual("pages/work").replace(/<h3>/g, "<h2>").replace(/<\/h3>/g, "</h2>")}</section>` }));

const blog = (["fr", "en"] as const).map(lang => `<div class="${lang}-text" lang="${lang}">${blogPosts.map(post => {
  const meta = post[lang].meta;
  const date = new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "en-GB", { year: "numeric", month: "short", day: "2-digit", timeZone: "UTC" }).format(new Date(meta.date!));
  return `<article class="blog-entry"><time class="blog-date" datetime="${meta.date}">${escape(date)}</time><h2 class="blog-title"><a href="/pages/blog/articles/${post.slug}/">${escape(meta.title)}</a>${meta.status === "draft" ? `<span class="blog-draft">${lang === "fr" ? "brouillon" : "draft"}</span>` : ""}</h2></article>`;
}).join("")}</div>`).join("");
write("pages/blog.html", page({ title: "Blog — Rosas Behoundja", description: "Articles by Rosas Behoundja on combinatorial optimisation, constraint programming, machine learning, research, and life.", path: "/pages/blog.html", active: "blog", body: `<h1 class="sr-only">Blog</h1><div id="blog-list">${blog}</div>` }));

// Preserve old incoming links; the client resolves historical query-string aliases.
for (const kind of ["blog", "news"] as const) {
  const path = `/pages/${kind}/${kind === "blog" ? "post" : "article"}.html`;
  write(path.slice(1), page({ title: `${kind === "blog" ? "Blog" : "News"} — Rosas Behoundja`, description: "Research, projects, and writing on combinatorial optimisation, machine learning, and responsible AI.", path, active: kind, script: "legacy-article", body: `<h1>${kind === "blog" ? "Blog" : "News"}</h1><p><a href="${kind === "blog" ? "/pages/blog.html" : "/pages/news/"}">← ${localized(kind === "blog" ? "Retour aux articles" : "Retour aux actualités", kind === "blog" ? "Back to articles" : "Back to news")}</a></p>` }));
}
write("pages/theme.html", page({ title: "Theme — Rosas Behoundja", description: "Articles by Rosas Behoundja on combinatorial optimisation, constraint programming, machine learning, research, and life.", path: "/pages/theme.html", active: "blog", body: `<h1>${localized("Thématiques", "Themes")}</h1><p><a href="/pages/blog.html">← ${localized("Retour au blog", "Back to blog")}</a></p>` }));

const urls = ["/", "/pages/work.html", "/pages/blog.html", "/pages/news/", ...[...blogPosts, ...newsPosts].map(post => `/pages/${post.kind}/articles/${post.slug}/`)];
write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(path => `  <url><loc>${siteUrl}${path}</loc></url>`).join("\n")}\n</urlset>\n`);
console.log(`Generated all pages: ${blogPosts.length} blog posts, ${newsPosts.length} news articles.`);
