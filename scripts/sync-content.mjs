import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import markdownIt from "markdown-it";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const template = path.join(root, "templates");
const contents = path.join(root, "contents");
const markdown = markdownIt({ html: true, linkify: true });
rmSync(path.join(template, "updates", "imported"), { recursive: true, force: true });
rmSync(path.join(template, "assets", "post-media"), { recursive: true, force: true });

function splitMarkdown(file) {
  const source = readFileSync(file, "utf8");
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { data: {}, body: source };
  const data = Object.fromEntries(match[1].split(/\r?\n/).filter(Boolean).map(line => {
    const i = line.indexOf(":");
    return [line.slice(0, i), line.slice(i + 1).trim()];
  }));
  return { data, body: match[2] };
}

function localize(body, slug) {
  return body
    .replaceAll("../../assets/", "/assets/")
    .replaceAll(`../../contents/blog/posts/${slug}/imgs/`, `/assets/post-media/${slug}/`)
    .replace(/(["(])imgs\//g, `$1/assets/post-media/${slug}/`)
    .replace(/\/pages\/blog\/articles\/([^/)]+)\/?/g, "/posts/$1/")
    .replace(/\/pages\/news\/articles\/([^/)]+)\/?/g, "/news/$1/");
}

function frontmatter(data) {
  return `---\n${Object.entries(data).filter(([, value]) => value !== undefined && value !== "").map(([key, value]) => `${key}: ${JSON.stringify(value)}`).join("\n")}\n---\n\n`;
}

for (const kind of ["blog", "news"]) {
  const input = path.join(contents, kind, "posts");
  const output = path.join(template, kind === "blog" ? "posts" : "news-articles", "imported");
  const readingEditions = { en: [], fr: [] };
  rmSync(output, { recursive: true, force: true });
  for (const lang of ["en", "fr"]) mkdirSync(path.join(output, lang), { recursive: true });
  for (const slug of readdirSync(input)) {
    const postDir = path.join(input, slug);
    for (const lang of ["en", "fr"]) {
      const source = path.join(postDir, `index.${lang}.md`);
      if (!existsSync(source)) continue;
      const { data, body } = splitMarkdown(source);
      if (kind === "blog" && !data.description?.trim()) {
        throw new Error(`Blog post ${source} needs a one-sentence description in its front matter.`);
      }
      const section = kind === "blog" ? "posts" : "news";
      const url = `/${lang === "fr" ? "fr/" : ""}${section}/${slug}/`;
      const cleanBody = localize(body, slug);
      const edition = kind === "blog" && slug.match(/reading-of-the-week-(\d+)$/);
      if (edition) {
        readingEditions[lang].push({ number: Number(edition[1]), body: cleanBody });
        continue;
      }
      const excerpt = (cleanBody.split(/\n\s*\n/).map(p => p.trim()).find(p => p && !p.startsWith("<") && !p.startsWith("![") && !p.startsWith("#") && !p.startsWith("-") && !p.startsWith(">")) || "")
        .replace(/!?\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/[\*_`]/g, "").slice(0, 600);
      const summary = data.description || excerpt;
      const metadata = {
        layout: "post.njk", title: data.title, date: data.date, lang,
        description: summary,
        excerpt: summary,
        readingTime: Math.max(1, Math.ceil(cleanBody.split(/\s+/).length / 200)),
        image: localize(data.preview_image || data.image || "", slug),
        imageAlt: data.preview_image_alt || data.title,
        permalink: `${url}index.html`, articleType: section,
        translationUrl: `/${lang === "fr" ? "" : "fr/"}${section}/${slug}/`
      };
      writeFileSync(path.join(output, lang, `${slug}.md`), frontmatter(metadata) + cleanBody);
    }
    if (kind === "blog" && existsSync(path.join(postDir, "imgs"))) {
      cpSync(path.join(postDir, "imgs"), path.join(template, "assets", "post-media", slug), { recursive: true });
    }
  }
  if (kind === "blog") {
    for (const lang of ["en", "fr"]) {
      const editions = readingEditions[lang].sort((a, b) => a.number - b.number);
      if (!editions.length) continue;
      const prefix = lang === "fr" ? "/fr" : "";
      const intro = lang === "fr"
        ? `Les sept premières éditions de Reading of the week sont réunies ici. Les nouvelles éditions sont sur [Substack](https://substack.com/@perrierbehoundja).`
        : `The first seven editions of Reading of the week are collected here. New editions are on [Substack](https://substack.com/@perrierbehoundja).`;
      const sections = editions.map(({ number, body }) => `<section id="edition-${number}" class="reading-edition"><details><summary>Edition #${number}</summary><div class="reading-edition-content">${markdown.render(body)}</div></details></section>`).join("\n");
      const archive = `${intro}\n\n${sections}\n`;
      writeFileSync(path.join(output, lang, "reading-of-the-week.md"), frontmatter({
        layout: "post.njk", title: "Reading of the week", date: "2026-10-04", lang,
        description: lang === "fr" ? "Les sept premières éditions de Reading of the week sont réunies ici, et les nouvelles paraissent sur Substack." : "The first seven Reading of the week editions are collected here, with new posts continuing on Substack.",
        excerpt: lang === "fr" ? "Les sept premières éditions de Reading of the week sont réunies ici, et les nouvelles paraissent sur Substack." : "The first seven Reading of the week editions are collected here, with new posts continuing on Substack.",
        image: "/assets/media/imgs/rotw/7.jpg", imageAlt: "Reading of the week illustration", permalink: `${prefix}/posts/reading-of-the-week/index.html`,
        articleType: "posts", translationUrl: `${lang === "fr" ? "" : "/fr"}/posts/reading-of-the-week/`
      }) + archive);
    }
  }
}

// The reference site's Latest panel is a dated list of updates. Keep the
// owner's timeline as its source instead of inventing article headlines.
const timeline = readFileSync(path.join(contents, "pages", "news", "index.en.md"), "utf8");
const updateDir = path.join(template, "updates", "imported");
mkdirSync(updateDir, { recursive: true });
const monthNumbers = { jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06", jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12" };
let year = "";
let entry = null;
let order = 0;
function writeUpdate() {
  if (!entry || !entry.lines.join("").trim()) return;
  const body = entry.lines.join("\n").trim()
    .replace(/\/pages\/blog\/articles\/([^/)]+)\/?/g, "/posts/$1/")
    .replace(/\/pages\/news\/articles\/([^/)]+)\/?/g, "/news/$1/");
  const plain = body.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/[\*_]/g, "").replace(/\s+/g, " ").trim();
  const firstSentence = plain.replace(/\b(Prof|Dr)\./g, "$1\uE000").split(/(?<=[.!?])\s/)[0].replaceAll("\uE000", ".");
  const title = firstSentence.length > 110 ? `${firstSentence.slice(0, 107).trimEnd()}…` : firstSentence;
  const articleSlug = body.match(/\/news\/([^/]+)\//)?.[1];
  const articleFile = articleSlug && path.join(contents, "news", "posts", articleSlug, "index.en.md");
  const articleImage = articleFile && existsSync(articleFile) ? splitMarkdown(articleFile).data.image : "";
  const kind = /\b(public talk|presented the concept)\b/i.test(plain) ? "talk" : /\b(mentor|outreach|young girls)\b/i.test(plain) ? "teaching" : /\b(research engineer position|research fellowship|internship|professional experience)\b/i.test(plain) ? "career" : "news";
  writeFileSync(path.join(updateDir, `${String(order).padStart(2, "0")}-${entry.date}.md`), frontmatter({
    title, date: entry.date, order, kind, label: kind === "career" ? "Career" : kind === "news" ? "News" : kind === "talk" ? "Talk" : "Teaching",
    image: localize(articleImage || "", articleSlug || ""), permalink: false
  }) + body + "\n");
  order++;
}
for (const line of timeline.split(/\r?\n/)) {
  const yearMatch = line.match(/^## (\d{4})\s*$/);
  if (yearMatch) { writeUpdate(); entry = null; year = yearMatch[1]; continue; }
  const dateMatch = line.match(/^### (.+?)\s*$/);
  if (dateMatch) {
    writeUpdate();
    const heading = dateMatch[1].toLowerCase();
    const date = /^\d{4}-\d{2}-\d{2}$/.test(heading) ? heading : `${year}-${monthNumbers[heading.slice(0, 3)] || "01"}-01`;
    entry = { date, lines: [] };
    continue;
  }
  if (entry && !line.startsWith("<!--")) entry.lines.push(line);
}
writeUpdate();

console.log("Synced blog and news from contents/.");
