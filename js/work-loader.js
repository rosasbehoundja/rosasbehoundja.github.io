/**
 * work-loader.js
 * ---------------------------------------------------------
 * Charge le contenu Markdown de la page Work (content/work.md)
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

  function splitLangBlocks(body) {
    if (!body) return { fr: "", en: "" };
    const frMatch = body.match(/<!--lang:fr-->([\s\S]*?)(?=<!--lang:en-->|$)/);
    const enMatch = body.match(/<!--lang:en-->([\s\S]*)/);
    return {
      fr: frMatch ? frMatch[1].trim() : "",
      en: enMatch ? enMatch[1].trim() : "",
    };
  }

  function setHTML(id, html) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  }

  function warnIfFileProtocol() {
    if (window.location.protocol === "file:") {
      console.warn("⚠️ Les navigateurs bloquent fetch() en protocole file:// (CORS). Lancez un serveur HTTP local (ex: 'python3 -m http.server 8000') pour tester le site en local.");
    }
  }

  async function loadWork() {
    try {
      const res = await fetch("content/work.md");
      if (!res.ok) throw new Error("404");
      const raw = await res.text();
      const { fr, en } = splitLangBlocks(raw);

      if (fr) setHTML("work-fr", parseMd(fr));
      if (en) setHTML("work-en", parseMd(en));
    } catch (err) {
      warnIfFileProtocol();
      console.error("Impossible de charger content/work.md", err);
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
