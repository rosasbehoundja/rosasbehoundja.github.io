(function () {
  "use strict";
  const param = new URLSearchParams(window.location.search).get("theme");
  const safeTheme = /^[a-z0-9-]+$/.test(param || "") ? param : "";

  function splitLanguages(body) {
    const fr = body.match(/<!--lang:fr-->([\s\S]*?)(?=<!--lang:en-->|$)/);
    const en = body.match(/<!--lang:en-->([\s\S]*)/);
    return { fr: fr ? fr[1].trim() : "", en: en ? en[1].trim() : "" };
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
  async function init() {
    if (!safeTheme) return;
    try {
      const response = await fetch(`content/blog-themes/${safeTheme}.md`);
      if (!response.ok) throw new Error("theme not found");
      const { meta, body } = parseFrontmatter(await response.text());
      const content = splitLanguages(body);
      document.title = `${meta.title_en || meta.title_fr} — Rosas Behoundja`;
      document.querySelector("#theme-title-fr").textContent = meta.title_fr || "";
      document.querySelector("#theme-title-en").textContent = meta.title_en || "";
      document.querySelector("#theme-description-fr").textContent = meta.description_fr || "";
      document.querySelector("#theme-description-en").textContent = meta.description_en || "";
      document.querySelector("#theme-content-fr").innerHTML = marked.parse(content.fr);
      document.querySelector("#theme-content-en").innerHTML = marked.parse(content.en);
    } catch (error) {
      document.querySelector("main").innerHTML = "<p>Impossible de charger cette thématique.</p>";
      console.error("Impossible de charger la thématique", error);
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
