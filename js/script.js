// Fonction pour changer la langue du site
function toggleLanguage() {
  const html = document.documentElement;
  const btn = document.getElementById('langBtn');
  if (html.classList.contains('lang-en')) {
    html.classList.remove('lang-en');
    html.classList.add('lang-fr');
    if (btn) btn.textContent = '🇬🇧 EN';
  } else {
    html.classList.remove('lang-fr');
    html.classList.add('lang-en');
    if (btn) btn.textContent = '🇫🇷 FR';
  }
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