import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(fileURLToPath(new URL("../..", import.meta.url)));
const template = path.join(root, "academic-template", "src");
const contents = path.join(root, "contents");
rmSync(path.join(template, "updates", "imported"), { recursive: true, force: true });

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
  rmSync(output, { recursive: true, force: true });
  for (const lang of ["en", "fr"]) mkdirSync(path.join(output, lang), { recursive: true });
  for (const slug of readdirSync(input)) {
    const postDir = path.join(input, slug);
    for (const lang of ["en", "fr"]) {
      const source = path.join(postDir, `index.${lang}.md`);
      if (!existsSync(source)) continue;
      const { data, body } = splitMarkdown(source);
      const section = kind === "blog" ? "posts" : "news";
      const url = `/${lang === "fr" ? "fr/" : ""}${section}/${slug}/`;
      const cleanBody = localize(body, slug);
      const excerpt = (cleanBody.split(/\n\s*\n/).map(p => p.trim()).find(p => p && !p.startsWith("<") && !p.startsWith("![") && !p.startsWith("#") && !p.startsWith("-") && !p.startsWith(">")) || "")
        .replace(/!?\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/[\*_`]/g, "").slice(0, 600);
      const metadata = {
        layout: "post.njk", title: data.title, date: data.date, lang,
        description: data.description || excerpt,
        excerpt: excerpt || data.description || "",
        readingTime: Math.max(1, Math.ceil(cleanBody.split(/\s+/).length / 200)),
        image: localize(data.preview_image || data.image || "", slug),
        permalink: `${url}index.html`, articleType: section,
        translationUrl: `/${lang === "fr" ? "" : "fr/"}${section}/${slug}/`
      };
      writeFileSync(path.join(output, lang, `${slug}.md`), frontmatter(metadata) + cleanBody);
    }
    if (kind === "blog" && existsSync(path.join(postDir, "imgs"))) {
      cpSync(path.join(postDir, "imgs"), path.join(template, "assets", "post-media", slug), { recursive: true });
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
  const firstSentence = plain.split(/(?<=[.!?])\s/)[0];
  const title = firstSentence.length > 110 ? `${firstSentence.slice(0, 107).trimEnd()}…` : firstSentence;
  const articleSlug = body.match(/\/news\/([^/]+)\//)?.[1];
  const articleFile = articleSlug && path.join(contents, "news", "posts", articleSlug, "index.en.md");
  const articleImage = articleFile && existsSync(articleFile) ? splitMarkdown(articleFile).data.image : "";
  const kind = /\b(public talk|presented the concept)\b/i.test(plain) ? "talk" : /\b(mentor|outreach|young girls)\b/i.test(plain) ? "teaching" : "news";
  writeFileSync(path.join(updateDir, `${String(order).padStart(2, "0")}-${entry.date}.md`), frontmatter({
    title, date: entry.date, order, kind, label: kind === "news" ? "News" : kind === "talk" ? "Talk" : "Teaching",
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

cpSync(path.join(root, "assets", "media"), path.join(template, "assets", "media"), { recursive: true });
console.log("Synced blog, news, and media from contents/.");
