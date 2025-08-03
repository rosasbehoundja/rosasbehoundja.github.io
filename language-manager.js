// Language switching functionality for Rosas Behoundja's website

class LanguageManager {
    constructor() {
        this.currentLang = localStorage.getItem('preferred-language') || 'fr';
        this.translations = translations; // From translations.js
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateLanguage(this.currentLang);
    }

    setupEventListeners() {
        // Desktop language toggle
        const desktopToggle = document.getElementById('language-toggle');
        if (desktopToggle) {
            desktopToggle.addEventListener('click', () => this.toggleLanguage());
        }

        // Mobile language toggle
        const mobileToggle = document.getElementById('mobile-language-toggle');
        if (mobileToggle) {
            mobileToggle.addEventListener('click', () => this.toggleLanguage());
        }

        // Mobile menu functionality
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        if (mobileMenuButton) {
            mobileMenuButton.addEventListener('click', () => {
                const mobileMenu = document.getElementById('mobile-menu');
                if (mobileMenu) {
                    mobileMenu.classList.toggle('hidden');
                }
            });
        }

        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    // Close mobile menu if open
                    const mobileMenu = document.getElementById('mobile-menu');
                    if (mobileMenu) {
                        mobileMenu.classList.add('hidden');
                    }
                }
            });
        });
    }

    toggleLanguage() {
        const newLang = this.currentLang === 'fr' ? 'en' : 'fr';
        this.updateLanguage(newLang);
    }

    updateLanguage(lang) {
        this.currentLang = lang;
        localStorage.setItem('preferred-language', lang);
        
        // Update language indicators
        const currentLangElements = document.querySelectorAll('#current-lang, #mobile-current-lang');
        currentLangElements.forEach(element => {
            element.textContent = lang.toUpperCase();
        });
        
        // Update document language attribute
        document.documentElement.lang = lang;
        
        // Update page title and meta description
        this.updateMetaTags(lang);
        
        // Update all translatable elements
        this.translateElements(lang);
        
        // Add visual feedback
        this.showLanguageChangeAnimation();
    }

    updateMetaTags(lang) {
        // Update page title
        if (this.translations[lang] && this.translations[lang]['page-title']) {
            document.title = this.translations[lang]['page-title'];
        }
        
        // Update meta description
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription && this.translations[lang] && this.translations[lang]['page-description']) {
            metaDescription.setAttribute('content', this.translations[lang]['page-description']);
        }
        
        // Update Open Graph title
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle && this.translations[lang] && this.translations[lang]['page-title']) {
            ogTitle.setAttribute('content', this.translations[lang]['page-title']);
        }
        
        // Update Open Graph description
        const ogDescription = document.querySelector('meta[property="og:description"]');
        if (ogDescription && this.translations[lang] && this.translations[lang]['page-description']) {
            ogDescription.setAttribute('content', this.translations[lang]['page-description']);
        }
        
        // Update Twitter title
        const twitterTitle = document.querySelector('meta[property="twitter:title"]');
        if (twitterTitle && this.translations[lang] && this.translations[lang]['page-title']) {
            twitterTitle.setAttribute('content', this.translations[lang]['page-title']);
        }
        
        // Update Twitter description
        const twitterDescription = document.querySelector('meta[property="twitter:description"]');
        if (twitterDescription && this.translations[lang] && this.translations[lang]['page-description']) {
            twitterDescription.setAttribute('content', this.translations[lang]['page-description']);
        }
    }

    translateElements(lang) {
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            if (this.translations[lang] && this.translations[lang][key]) {
                // Use a smooth transition for text changes
                element.style.opacity = '0.7';
                setTimeout(() => {
                    element.innerHTML = this.translations[lang][key];
                    element.style.opacity = '1';
                }, 150);
            }
        });
    }

    showLanguageChangeAnimation() {
        // Add a subtle animation to indicate language change
        const languageButtons = document.querySelectorAll('#language-toggle, #mobile-language-toggle');
        languageButtons.forEach(button => {
            button.style.transform = 'scale(1.1)';
            setTimeout(() => {
                button.style.transform = 'scale(1)';
            }, 200);
        });
    }

    // Method to get current language
    getCurrentLanguage() {
        return this.currentLang;
    }

    // Method to set language programmatically
    setLanguage(lang) {
        if (lang === 'fr' || lang === 'en') {
            this.updateLanguage(lang);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add smooth transitions to all translatable elements
    const style = document.createElement('style');
    style.textContent = `
        [data-translate] {
            transition: opacity 0.3s ease-in-out;
        }
        
        #language-toggle, #mobile-language-toggle {
            transition: transform 0.2s ease-in-out;
        }
        
        #language-toggle:hover, #mobile-language-toggle:hover {
            transform: scale(1.05);
        }
    `;
    document.head.appendChild(style);

    // Initialize language manager
    window.languageManager = new LanguageManager();
});

// Export for potential external use
if (typeof window !== 'undefined') {
    window.LanguageManager = LanguageManager;
}
