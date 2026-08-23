import "@fortawesome/fontawesome-free/css/all.min.css";
import "../assets/css/style.css";

export type SiteLanguage = "fr" | "en";

const LANGUAGE_STORAGE_KEY = "rosas-site-language";

export function currentLanguage(): SiteLanguage {
  return document.documentElement.classList.contains("lang-fr") ? "fr" : "en";
}

export function applyLanguage(language: SiteLanguage, persist = true): void {
  const html = document.documentElement;
  html.classList.toggle("lang-fr", language === "fr");
  html.classList.toggle("lang-en", language === "en");
  html.lang = language;

  const button = document.getElementById("langBtn");
  if (button) button.textContent = language === "fr" ? "🇬🇧 EN" : "🇫🇷 FR";

  if (persist) {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      // Le stockage peut être indisponible en navigation privée.
    }
  }
  document.dispatchEvent(new CustomEvent<SiteLanguage>("site:language", { detail: language }));
}

function initializeLanguage(): void {
  let language: SiteLanguage = "en";
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved === "fr" || saved === "en") language = saved;
  } catch {
    // L'anglais reste la langue par défaut.
  }
  applyLanguage(language, false);
}

function toggleMobileMenu(): void {
  const menu = document.getElementById("mobileMenu");
  const icon = document.getElementById("menuIcon");
  if (!menu) return;

  const willOpen = menu.classList.contains("hidden");
  menu.classList.toggle("hidden", !willOpen);
  menu.classList.toggle("flex", willOpen);
  icon?.classList.toggle("fa-bars", !willOpen);
  icon?.classList.toggle("fa-xmark", willOpen);
}

initializeLanguage();
document.getElementById("langBtn")?.addEventListener("click", () => {
  applyLanguage(currentLanguage() === "en" ? "fr" : "en");
});
document.getElementById("menuToggleBtn")?.addEventListener("click", toggleMobileMenu);
