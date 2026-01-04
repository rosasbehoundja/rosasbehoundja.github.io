/**
 * Articles.js - JavaScript functionality for blog articles
 */

document.addEventListener('DOMContentLoaded', function() {
    initReadingProgress();
    initReadingTime();
    initTableOfContents();
    initSmoothScroll();
    initShareButtons();
    initExternalLinks();
});

/**
 * Copy Code Function (called via onclick)
 */
function copyCode(button) {
    const codeBlock = button.closest('.code-block');
    const codeElement = codeBlock.querySelector('code');

    if (codeElement) {
        const code = codeElement.textContent;
        navigator.clipboard.writeText(code).then(() => {
            const originalHTML = button.innerHTML;
            button.classList.add('copied');
            button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied!';

            setTimeout(() => {
                button.classList.remove('copied');
                button.innerHTML = originalHTML;
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy:', err);
        });
    }
}

/**
 * Reading Progress Bar
 */
function initReadingProgress() {
    const progressBar = document.querySelector('.reading-progress');
    if (!progressBar) return;

    function updateProgress() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        progressBar.style.width = Math.min(progress, 100) + '%';
    }

    window.addEventListener('scroll', updateProgress);
    updateProgress();
}

/**
 * Calculate and Display Reading Time
 */
function initReadingTime() {
    const articleContent = document.querySelector('.article-content');
    const readingTimeElement = document.querySelector('.reading-time');

    if (!articleContent || !readingTimeElement) return;

    const text = articleContent.textContent || articleContent.innerText;
    const wordCount = text.trim().split(/\s+/).length;
    const minutes = Math.ceil(wordCount / 200);

    readingTimeElement.textContent = minutes + ' min read';
}

/**
 * Generate Table of Contents
 */
function initTableOfContents() {
    const tocContainer = document.querySelector('.toc ul');
    const articleContent = document.querySelector('.article-content');

    if (!tocContainer || !articleContent) return;

    const headings = articleContent.querySelectorAll('h2, h3');

    if (headings.length === 0) {
        const tocElement = document.querySelector('.toc');
        if (tocElement) tocElement.style.display = 'none';
        return;
    }

    headings.forEach((heading, index) => {
        if (!heading.id) {
            heading.id = 'section-' + index;
        }

        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#' + heading.id;
        a.textContent = heading.textContent;

        if (heading.tagName === 'H3') {
            li.style.paddingLeft = '1rem';
            li.style.fontSize = '0.9em';
        }

        li.appendChild(a);
        tocContainer.appendChild(li);
    });
}

/**
 * Smooth Scroll for Anchor Links
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.scrollY - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Share Buttons Functionality
 */
function initShareButtons() {
    const twitterBtn = document.querySelector('.share-btn.twitter');
    if (twitterBtn) {
        twitterBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const title = document.title;
            const url = window.location.href;
            const twitterUrl = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(title) + '&url=' + encodeURIComponent(url);
            window.open(twitterUrl, '_blank', 'width=550,height=420');
        });
    }

    const linkedinBtn = document.querySelector('.share-btn.linkedin');
    if (linkedinBtn) {
        linkedinBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const url = window.location.href;
            const linkedinUrl = 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(url);
            window.open(linkedinUrl, '_blank', 'width=550,height=420');
        });
    }

    const copyLinkBtn = document.querySelector('.share-btn.copy-link');
    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', function() {
            navigator.clipboard.writeText(window.location.href).then(() => {
                const originalText = copyLinkBtn.textContent;
                copyLinkBtn.textContent = 'Link copied!';
                setTimeout(function() {
                    copyLinkBtn.textContent = originalText;
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy link:', err);
            });
        });
    }
}

/**
 * External Link Handler
 */
function initExternalLinks() {
    const articleContent = document.querySelector('.article-content');
    if (!articleContent) return;

    const links = articleContent.querySelectorAll('a[href^="http"]');
    const currentHost = window.location.host;

    links.forEach(function(link) {
        if (!link.href.includes(currentHost)) {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        }
    });
}

