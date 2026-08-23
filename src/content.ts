import { marked } from "marked";

export type Language = "fr" | "en";
export type Frontmatter = Record<string, string>;

export interface MarkdownDocument {
  meta: Frontmatter;
  body: string;
}

export function parseFrontmatter(raw: string): MarkdownDocument {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!match) return { meta: {}, body: raw };

  const meta: Frontmatter = {};
  for (const line of (match[1] ?? "").split("\n")) {
    const separator = line.indexOf(":");
    if (separator < 0) continue;
    const key = line.slice(0, separator).trim();
    if (key) meta[key] = line.slice(separator + 1).trim();
  }
  return { meta, body: match[2] ?? "" };
}

export function renderMarkdown(source: string): string {
  return marked.parse(source, { async: false }) as string;
}

export function renderInline(source: string): string {
  return marked.parseInline(source, { async: false }) as string;
}

export function setHTML(id: string, html: string): void {
  const element = document.getElementById(id);
  if (element) element.innerHTML = html;
}
