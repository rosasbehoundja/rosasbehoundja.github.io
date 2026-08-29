import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { marked } from "marked";

type Meta = Record<string, string>;
type Kind = "blog" | "news";

interface Document {
  meta: Meta;
  body: string;
}

const root = process.cwd();
const siteUrl = "https://rosasbehoundja.github.io";

function parse(raw: string): Document {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!match) return { meta: {}, body: raw };
  const meta: Meta = {};
  for (const line of (match[1] ?? "").split("\n")) {
    const separator = line.indexOf(":");
    if (separator < 0) continue;
    const key = line.slice(0, separator).trim();
    if (key) meta[key] = line.slice(separator + 1).trim();
  }
  return { meta, body: match[2] ?? "" };
}

function escape(value = ""): string {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  })[character] ?? character);
}

function renderBody(body: string, kind: Kind, slug: string): string {
  const rendered = marked.parse(body, { async: false }) as string;
  return rendered
    .replace(/((?:src|href)=["'])imgs\//g, `$1/contents/${kind}/posts/${slug}/imgs/`)
    .replaceAll('../../content/', '/contents/')
    .replaceAll('../../contents/', '/contents/')
    .replaceAll('../../assets/', '/assets/')
    .replace(/(?:\.\.\/)?article\.html\?post=([a-z0-9-]+)/g, "/pages/news/articles/$1/")
    .replace(/(?:\.\.\/)?post\.html\?post=([a-z0-9-]+)/g, "/pages/blog/articles/$1/");
}

function absoluteImageUrl(path: string, kind: Kind, slug: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = path
    .replace(/^\.\.\/\.\.\/content\//, "/contents/")
    .replace(/^\.\.\/\.\.\/contents\//, "/contents/")
    .replace(/^\.\.\/\.\.\/assets\//, "/assets/");
  if (normalized.startsWith("/")) return `${siteUrl}${normalized}`;
  if (normalized.startsWith("imgs/")) return `${siteUrl}/contents/${kind}/posts/${slug}/${normalized}`;
  return `${siteUrl}/contents/${kind}/posts/${slug}/${normalized.replace(/^\.\//, "")}`;
}

function previewImage(kind: Kind, slug: string, fr: Document, en: Document): { url: string; alt: string } {
  const frontmatterImage = en.meta.image || fr.meta.image;
  if (frontmatterImage) {
    return {
      url: absoluteImageUrl(frontmatterImage, kind, slug),
      alt: en.meta.image_alt || fr.meta.image_alt || en.meta.title || fr.meta.title || "Rosas Behoundja",
    };
  }

  for (const document of [en, fr]) {
    const firstImage = renderBody(document.body, kind, slug).match(/<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/i);
    if (!firstImage?.[1]) continue;
    const alt = firstImage[0].match(/\balt=["']([^"']*)["']/i)?.[1] ?? document.meta.title ?? "";
    return { url: absoluteImageUrl(firstImage[1], kind, slug), alt };
  }

  return {
    url: `${siteUrl}/assets/media/preview.jpg`,
    alt: "Two cartoon starfish learning in front of a whiteboard",
  };
}

function articleTemplate(kind: Kind, slug: string, fr: Document, en: Document): string {
  const title = en.meta.title || fr.meta.title || "Rosas Behoundja";
  const description = en.meta.description || fr.meta.description || title;
  const url = `https://rosasbehoundja.github.io/pages/${kind}/articles/${slug}/`;
  const isBlog = kind === "blog";
  const dateFr = fr.meta.date_display || fr.meta.date || "";
  const dateEn = en.meta.date_display || en.meta.date || "";
  const socialImage = previewImage(kind, slug, fr, en);
  const image = fr.meta.image || en.meta.image;
  const imagePath = image?.replace("../../assets/", "/assets/").replace("../../content/", "/contents/");
  const figure = imagePath ? `<figure class="my-6"><img src="${escape(imagePath)}" alt="${escape(fr.meta.image_alt || en.meta.image_alt)}" class="w-full sm:w-4/5 max-w-[550px] mx-auto rounded-lg"><figcaption class="mt-2 text-center italic text-neutral-500 text-xs"><span class="fr-text">${escape(fr.meta.image_caption)}</span><span class="en-text">${escape(en.meta.image_caption)}</span></figcaption></figure>` : "";
  const backHref = isBlog ? "/pages/blog.html" : "/#news";
  const backFr = isBlog ? "Retour aux articles" : "Retour aux actualités";
  const backEn = isBlog ? "Back to articles" : "Back to news";
  const draftFr = fr.meta.status === "draft" ? '<div class="blog-post-status fr-text">brouillon</div>' : "";
  const draftEn = en.meta.status === "draft" ? '<div class="blog-post-status en-text">draft</div>' : "";

  return `<!DOCTYPE html>
<html lang="en" class="lang-en" prefix="og: https://ogp.me/ns# article: https://ogp.me/ns/article#">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escape(title)} — Rosas Behoundja</title>
  <meta name="author" content="Rosas Behoundja"><meta name="robots" content="index, follow">
  <meta name="description" content="${escape(description)}"><link rel="canonical" href="${url}">
  <meta property="og:title" content="${escape(title)}"><meta property="og:type" content="article"><meta property="og:url" content="${url}"><meta property="og:description" content="${escape(description)}"><meta property="og:site_name" content="Rosas Behoundja"><meta property="og:locale" content="en_GB"><meta property="og:locale:alternate" content="fr_FR"><meta property="og:image" content="${escape(socialImage.url)}"><meta property="og:image:alt" content="${escape(socialImage.alt)}"><meta property="article:published_time" content="${escape(en.meta.date || fr.meta.date)}">
  <meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escape(title)}"><meta name="twitter:description" content="${escape(description)}"><meta name="twitter:image" content="${escape(socialImage.url)}"><meta name="twitter:image:alt" content="${escape(socialImage.alt)}">
</head>
<body class="max-w-[820px] mx-auto px-4 sm:px-6 py-6 sm:py-10">
  <nav class="site-nav border-b border-neutral-200 pb-4 mb-8"><div class="flex items-center justify-between"><div class="nav-links flex items-center gap-6 text-sm"><a href="/" class="sm:hidden">Rosas.</a><a href="/" class="hidden sm:inline">/ home</a><a href="/pages/work.html">/ work</a><a href="/pages/blog.html">/ blog</a></div><button class="lang-switch text-xs font-mono border border-neutral-200 px-2.5 py-1 rounded" id="langBtn">🇫🇷 FR</button></div></nav>
  <main class="${isBlog ? "blog-post" : "flex flex-col"}" data-article>
    <header class="mb-8">${draftFr}${draftEn}<time datetime="${escape(en.meta.date || fr.meta.date)}" class="block font-mono text-xs text-neutral-400 mb-2"><span class="fr-text">${escape(dateFr)}</span><span class="en-text">${escape(dateEn)}</span></time><h1 class="font-display text-2xl sm:text-3xl font-bold tracking-tight"><span class="fr-text">${escape(fr.meta.title)}</span><span class="en-text">${escape(en.meta.title)}</span></h1></header>
    ${figure}<article class="fr-text markdown-body">${renderBody(fr.body, kind, slug)}</article><article class="en-text markdown-body">${renderBody(en.body, kind, slug)}</article>
  </main>
  <footer class="mt-16 pt-4 text-xs text-neutral-400 border-t border-dashed border-neutral-200"><p><a href="${backHref}">← <span class="fr-text">${backFr}</span><span class="en-text">${backEn}</span></a></p><p>© Rosas Behoundja 2026</p></footer>
  <script type="module" src="/src/article.ts"></script>
</body></html>`;
}

function generateKind(kind: Kind): string[] {
  const sourceDir = resolve(root, `contents/${kind}/posts`);
  const slugs = readdirSync(sourceDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== "posts_template")
    .map((entry) => entry.name)
    .filter((slug) => /^[a-z0-9-]+$/.test(slug));

  for (const slug of slugs) {
    const bundle = join(sourceDir, slug);
    const fr = parse(readFileSync(join(bundle, "index.fr.md"), "utf8"));
    const en = parse(readFileSync(join(bundle, "index.en.md"), "utf8"));
    const output = resolve(root, `pages/${kind}/articles/${slug}/index.html`);
    mkdirSync(dirname(output), { recursive: true });
    writeFileSync(output, articleTemplate(kind, slug, fr, en));
  }
  return slugs;
}

const blogSlugs = generateKind("blog");
const newsSlugs = generateKind("news");
const blogPosts = blogSlugs.map((slug) => {
  const bundle = resolve(root, `contents/blog/posts/${slug}`);
  return {
    slug,
    fr: parse(readFileSync(join(bundle, "index.fr.md"), "utf8")).meta,
    en: parse(readFileSync(join(bundle, "index.en.md"), "utf8")).meta,
  };
}).sort((a, b) => (b.en.date ?? "").localeCompare(a.en.date ?? ""));
writeFileSync(resolve(root, "src/generated-content.ts"), `// Généré depuis contents/blog/posts — ne pas modifier.\nexport const blogPosts = ${JSON.stringify(blogPosts, null, 2)} as const;\n`);
const today = new Date().toISOString().slice(0, 10);
const urls = [
  "",
  "pages/work.html",
  "pages/blog.html",
  ...blogSlugs.map((slug) => `pages/blog/articles/${slug}/`),
  ...newsSlugs.map((slug) => `pages/news/articles/${slug}/`),
];
writeFileSync(resolve(root, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((path) => `  <url><loc>https://rosasbehoundja.github.io/${path}</loc><lastmod>${today}</lastmod></url>`).join("\n")}
</urlset>\n`);
console.log(`Pages générées : ${blogSlugs.length} billets, ${newsSlugs.length} actualités.`);
