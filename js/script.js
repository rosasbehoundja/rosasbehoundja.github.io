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

// Pagination de la section Récemment / News
document.addEventListener("DOMContentLoaded", () => {
  const itemsPerPage = 5;
  let currentPage = 1;

  const newsItems = document.querySelectorAll(".news-item");
  const totalItems = newsItems.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginationContainer = document.getElementById("newsPagination");
  const prevButton = document.getElementById("prevNews");
  const nextButton = document.getElementById("nextNews");
  const pageIndicator = document.getElementById("newsPageIndicator");

  // Si on a plus de 5 éléments, on affiche les contrôles de pagination
  if (totalItems > itemsPerPage) {
    paginationContainer.style.display = "flex";
  }

  function showPage(page) {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;

    newsItems.forEach((item, index) => {
      if (index >= start && index < end) {
        item.style.display = "flex";
      } else {
        item.style.display = "none";
      }
    });

    // Mise à jour de l'état des boutons et indicateur
    pageIndicator.textContent = `${page} / ${totalPages}`;
    prevButton.disabled = page === 1;
    nextButton.disabled = page === totalPages;
  }

  prevButton.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      showPage(currentPage);
    }
  });

  nextButton.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      showPage(currentPage);
    }
  });

  // Initialisation au premier chargement
  if (totalItems > 0) {
    showPage(currentPage);
  }
});