// Calcul dynamique de l'âge
const ageElements = document.querySelectorAll(".age");
const calculatedAge = new Date().getFullYear() - 2007;
ageElements.forEach(element => {
  element.textContent = calculatedAge;
});

// Fonction pour changer la langue du site
function toggleLanguage() {
  const html = document.documentElement;
  const btn = document.getElementById('langBtn');
  
  if (html.classList.contains('lang-en')) {
    html.classList.remove('lang-en');
    html.classList.add('lang-fr');
    btn.textContent = '🇬🇧 EN';
  } else {
    html.classList.remove('lang-fr');
    html.classList.add('lang-en');
    btn.textContent = '🇫🇷 FR';
  }
}