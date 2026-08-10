const LANGUAGE_STORAGE_KEY = 'rosas-site-language';

function applyLanguage(language, persist = true) {
  const html = document.documentElement;
  const btn = document.getElementById('langBtn');
  if (language === 'fr') {
    html.classList.remove('lang-en');
    html.classList.add('lang-fr');
    if (btn) btn.textContent = '🇬🇧 EN';
  } else {
    html.classList.remove('lang-fr');
    html.classList.add('lang-en');
    if (btn) btn.textContent = '🇫🇷 FR';
  }
  if (persist) {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch (error) {
      // Certains contextes privés peuvent bloquer localStorage.
    }
  }
}

// Fonction pour changer la langue du site
function toggleLanguage() {
  const nextLanguage = document.documentElement.classList.contains('lang-en') ? 'fr' : 'en';
  applyLanguage(nextLanguage);
}

function initializeLanguage() {
  let savedLanguage = 'en';
  try {
    const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (storedLanguage === 'fr' || storedLanguage === 'en') savedLanguage = storedLanguage;
  } catch (error) {
    // La langue anglaise reste le comportement par défaut.
  }
  applyLanguage(savedLanguage, false);
}

// Fonction pour ouvrir/fermer le menu mobile (hamburger)
function toggleMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  const icon = document.getElementById('menuIcon');
  if (!menu) return;
  
  if (menu.classList.contains('hidden')) {
    menu.classList.remove('hidden');
    menu.classList.add('flex');
    if (icon) {
      icon.classList.remove('fa-bars');
      icon.classList.add('fa-xmark');
    }
  } else {
    menu.classList.remove('flex');
    menu.classList.add('hidden');
    if (icon) {
      icon.classList.remove('fa-xmark');
      icon.classList.add('fa-bars');
    }
  }
}

initializeLanguage();
