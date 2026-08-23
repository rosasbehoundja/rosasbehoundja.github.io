/**
 * work-loader.js
 * ---------------------------------------------------------
 * Charge le contenu Markdown de la page Work (content/pages/work/index.{fr,en}.md)
 * et injecte les versions FR et EN dans work.html.
 */

(function () {
  "use strict";

  function parseMd(text) {
    if (!text) return "";
    if (window.marked && typeof window.marked.parse === "function") return window.marked.parse(text);
    if (typeof window.marked === "function") return window.marked(text);
    return text;
  }

  function setHTML(id, html) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  }

  function warnIfFileProtocol() {
    if (window.location.protocol === "file:") {
      console.warn("⚠️ Lancez un serveur HTTP local (ex: 'python3 -m http.server 8000') pour tester le site en local.");
    }
  }

  async function loadWork() {
    try {
      const [frResponse, enResponse] = await Promise.all([
        fetch("../content/pages/work/index.fr.md"),
        fetch("../content/pages/work/index.en.md"),
      ]);
      if (!frResponse.ok || !enResponse.ok) throw new Error("404");
      const [fr, en] = await Promise.all([frResponse.text(), enResponse.text()]);

      if (fr) setHTML("work-fr", parseMd(fr));
      if (en) setHTML("work-en", parseMd(en));
    } catch (err) {
      warnIfFileProtocol();
      console.error("Impossible de charger ../content/pages/work", err);
    }
  }

  function init() {
    loadWork();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
