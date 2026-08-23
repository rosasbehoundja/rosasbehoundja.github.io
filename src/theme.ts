import "./main";
import { parseFrontmatter, renderMarkdown, setHTML } from "./content";

const themes = import.meta.glob<string>("/contents/blog/themes/*/index.*.md", {
  eager: true,
  import: "default",
  query: "?raw",
});

const theme = new URLSearchParams(location.search).get("theme") ?? "";
if (/^[a-z0-9-]+$/.test(theme)) {
  try {
    const frSource = themes[`/contents/blog/themes/${theme}/index.fr.md`];
    const enSource = themes[`/contents/blog/themes/${theme}/index.en.md`];
    if (!frSource || !enSource) throw new Error(`Thématique introuvable : ${theme}`);
    const localized = { fr: frSource.trim(), en: enSource.trim() };
    const fr = parseFrontmatter(localized.fr);
    const en = parseFrontmatter(localized.en);
    document.title = `${en.meta.title || fr.meta.title || "Theme"} — Rosas Behoundja`;
    document.getElementById("theme-title-fr")!.textContent = fr.meta.title ?? "";
    document.getElementById("theme-title-en")!.textContent = en.meta.title ?? "";
    document.getElementById("theme-description-fr")!.textContent = fr.meta.description ?? "";
    document.getElementById("theme-description-en")!.textContent = en.meta.description ?? "";
    setHTML("theme-content-fr", renderMarkdown(fr.body));
    setHTML("theme-content-en", renderMarkdown(en.body));
  } catch (error) {
    console.error(error);
    document.querySelector("main")!.innerHTML = "<p>Impossible de charger cette thématique.</p>";
  }
}
