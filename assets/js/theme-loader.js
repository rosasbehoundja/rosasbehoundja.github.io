(function () {
  "use strict";
  const param = new URLSearchParams(window.location.search).get("theme");
  const safeTheme = /^[a-z0-9-]+$/.test(param || "") ? param : "";

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
      const [frResponse, enResponse] = await Promise.all([
        fetch(`../content/blog/themes/${safeTheme}/index.fr.md`),
        fetch(`../content/blog/themes/${safeTheme}/index.en.md`),
      ]);
      if (!frResponse.ok || !enResponse.ok) throw new Error("theme not found");
      const [frTheme, enTheme] = await Promise.all([
        frResponse.text().then(parseFrontmatter),
        enResponse.text().then(parseFrontmatter),
      ]);
      document.title = `${enTheme.meta.title || frTheme.meta.title} — Rosas Behoundja`;
      document.querySelector("#theme-title-fr").textContent = frTheme.meta.title || "";
      document.querySelector("#theme-title-en").textContent = enTheme.meta.title || "";
      document.querySelector("#theme-description-fr").textContent = frTheme.meta.description || "";
      document.querySelector("#theme-description-en").textContent = enTheme.meta.description || "";
      document.querySelector("#theme-content-fr").innerHTML = marked.parse(frTheme.body);
      document.querySelector("#theme-content-en").innerHTML = marked.parse(enTheme.body);
    } catch (error) {
      document.querySelector("main").innerHTML = "<p>Impossible de charger cette thématique.</p>";
      console.error("Impossible de charger la thématique", error);
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
