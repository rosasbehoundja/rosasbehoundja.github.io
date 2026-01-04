const translations = {
    fr: {
        bio1: "Salut ! Je suis Rosas, actuellement étudiant en troisième année de licence en Informatique avec une spécialisation en Intelligence Artificielle à l'Institut de Formation et de Recherche en Informatique (IFRI) de l'Université d'Abomey-Calavi au Bénin. Je m'intéresse à la recherche en optimisation et en apprentissage automatique. J'aime créer des outils et participer à des projets technologiques capables de résoudre des problèmes concrets au Bénin et à travers l'Afrique, quelque soit le domaine.",
        bio2: "Mon ambition est de mener des recherches scientifiques et de pouvoir proposer des solutions aux défis auxquels nous sommes confrontés.",
        cv: "Voir mon CV",
        toggleBtn: "EN",
        toggleLabel: "Translate to English"
    },
    en: {
        bio1: "Hi ! I'm Rosas, currently a third-year undergraduate student in Computer Science with a specialization in Artificial Intelligence studying at the Institut de Formation et de Recherche en Informatique (IFRI) at the University of Abomey-Calavi in Benin. My interests lie in research in optimization and machine learning. I enjoy building tools and participating in tech projects capable of solving real-world problems in Benin and across Africa, regardless of the field.",
        bio2: "My ambition is to conduct scientific research and to be able to propose solutions to the challenges we face.",
        cv: "View my CV",
        toggleBtn: "FR",
        toggleLabel: "Translate to French"
    }
};

let currentLang = 'en';
const langToggle = document.getElementById('langToggle');
const bioP = document.querySelectorAll('.bio p');
const cvLink = document.getElementById('cvLink');

langToggle.addEventListener('click', () => {
    currentLang = currentLang === 'fr' ? 'en' : 'fr';
    const t = translations[currentLang];

    bioP[0].textContent = t.bio1;
    bioP[1].textContent = t.bio2;
    cvLink.textContent = t.cv;
    langToggle.textContent = t.toggleBtn;
    langToggle.setAttribute('aria-label', t.toggleLabel);
    document.documentElement.lang = currentLang;
});