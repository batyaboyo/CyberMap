// JavaScript for Cybersecurity Career Roadmap

document.addEventListener('DOMContentLoaded', function () {
    // Initialize all interactive elements
    initThemeToggle();
    initPhaseCards();
    initAccordions();
    initSmoothScrolling();
    initTimelineHighlight();
});

/**
 * Theme Toggle Functionality
 * Switches between dark and light modes with localStorage persistence
 */
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle.querySelector('.theme-icon');

    // Check for saved theme preference or default to dark
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);

    themeToggle.addEventListener('click', function () {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    });

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        themeIcon.textContent = theme === 'dark' ? '🌙' : '☀️';
        themeToggle.setAttribute('aria-label',
            theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
        );
    }
}

/**
 * Phase Cards Expand/Collapse
 * Main accordion for the four career phases
 */
function initPhaseCards() {
    const phaseHeaders = document.querySelectorAll('.phase-header');

    phaseHeaders.forEach(header => {
        header.addEventListener('click', function () {
            const phaseCard = this.closest('.phase-card');
            const isActive = phaseCard.classList.contains('active');

            // Optional: Close other phase cards when opening a new one
            // Uncomment the following lines if you want only one phase open at a time
            // const allPhaseCards = document.querySelectorAll('.phase-card');
            // allPhaseCards.forEach(card => card.classList.remove('active'));

            // Toggle current phase card
            if (isActive) {
                phaseCard.classList.remove('active');
            } else {
                phaseCard.classList.add('active');

                // Smooth scroll to the card if it's partially out of view
                setTimeout(() => {
                    const rect = phaseCard.getBoundingClientRect();
                    const navHeight = document.querySelector('.timeline-nav').offsetHeight;

                    if (rect.top < navHeight + 20) {
                        phaseCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }, 300);
            }
        });

        // Keyboard accessibility
        header.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });

        // Make focusable
        header.setAttribute('tabindex', '0');
        header.setAttribute('role', 'button');
        header.setAttribute('aria-expanded', 'false');
    });
}

/**
 * Sub-Accordions within Phase Cards
 * For learning paths, certifications, resources, etc.
 */
function initAccordions() {
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', function (e) {
            e.stopPropagation(); // Prevent triggering parent phase card click

            const accordionSection = this.closest('.accordion-section');
            const isOpen = accordionSection.classList.contains('open');

            // Toggle current accordion
            if (isOpen) {
                accordionSection.classList.remove('open');
                this.setAttribute('aria-expanded', 'false');
            } else {
                accordionSection.classList.add('open');
                this.setAttribute('aria-expanded', 'true');
            }
        });

        // Keyboard accessibility
        header.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });

        // Set ARIA attributes
        header.setAttribute('aria-expanded', 'false');
    });
}

/**
 * Smooth Scrolling for Timeline Navigation
 */
function initSmoothScrolling() {
    const timelineLinks = document.querySelectorAll('.timeline-step[href^="#"]');

    timelineLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                // First, expand the target phase card if it's not already
                const phaseCard = targetElement;
                if (!phaseCard.classList.contains('active')) {
                    phaseCard.classList.add('active');
                }

                // Then scroll to it
                setTimeout(() => {
                    const navHeight = document.querySelector('.timeline-nav').offsetHeight;
                    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight - 20;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }, 100);
            }
        });
    });
}

/**
 * Timeline Highlight on Scroll
 * Highlights the current phase in the navigation as user scrolls
 */
function initTimelineHighlight() {
    const phaseCards = document.querySelectorAll('.phase-card');
    const timelineSteps = document.querySelectorAll('.timeline-step');

    // Scroll event listener with debounce
    let isScrolling;

    window.addEventListener('scroll', function () {
        window.clearTimeout(isScrolling);

        isScrolling = setTimeout(function () {
            updateActiveTimelineStep();
        }, 50);
    });

    function updateActiveTimelineStep() {
        const navHeight = document.querySelector('.timeline-nav').offsetHeight;
        const scrollPosition = window.pageYOffset + navHeight + 100;

        // Find which phase is currently in view
        let currentPhase = null;

        phaseCards.forEach((card, index) => {
            const rect = card.getBoundingClientRect();
            const cardTop = rect.top + window.pageYOffset;
            const cardBottom = cardTop + rect.height;

            if (scrollPosition >= cardTop && scrollPosition < cardBottom) {
                currentPhase = index + 1;
            }
        });

        // Update timeline step highlighting
        timelineSteps.forEach(step => {
            const stepPhase = parseInt(step.getAttribute('data-phase'));

            if (stepPhase === currentPhase) {
                step.classList.add('active');
                step.querySelector('.step-number').style.background = getPhaseColor(stepPhase);
                step.querySelector('.step-number').style.borderColor = getPhaseColor(stepPhase);
                step.querySelector('.step-number').style.color = '#000';
            } else {
                step.classList.remove('active');
                step.querySelector('.step-number').style.background = '';
                step.querySelector('.step-number').style.borderColor = '';
                step.querySelector('.step-number').style.color = '';
            }
        });
    }

    function getPhaseColor(phase) {
        const colors = {
            1: '#00d4aa',
            2: '#ff6b6b',
            3: '#feca57',
            4: '#a29bfe'
        };
        return colors[phase] || '#00d4aa';
    }

    // Initial check
    updateActiveTimelineStep();
}

/**
 * Utility: Check if element is in viewport
 */
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * Optional: Expand All / Collapse All functionality
 * Can be triggered programmatically if needed
 */
function expandAllPhases() {
    document.querySelectorAll('.phase-card').forEach(card => {
        card.classList.add('active');
    });
}

function collapseAllPhases() {
    document.querySelectorAll('.phase-card').forEach(card => {
        card.classList.remove('active');
    });
}

function expandAllAccordions() {
    document.querySelectorAll('.accordion-section').forEach(section => {
        section.classList.add('open');
        section.querySelector('.accordion-header').setAttribute('aria-expanded', 'true');
    });
}

function collapseAllAccordions() {
    document.querySelectorAll('.accordion-section').forEach(section => {
        section.classList.remove('open');
        section.querySelector('.accordion-header').setAttribute('aria-expanded', 'false');
    });
}

/**
 * Optional: Print-friendly mode
 * Expands all sections for printing
 */
window.addEventListener('beforeprint', function () {
    expandAllPhases();
    expandAllAccordions();
});

/**
 * Optional: Add subtle entrance animations on scroll
 */
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.phase-card').forEach(card => {
        observer.observe(card);
    });
}

// Add keyboard navigation for the entire page
document.addEventListener('keydown', function (e) {
    // Press 'E' to expand all, 'C' to collapse all (when not in input)
    if (document.activeElement.tagName !== 'INPUT' &&
        document.activeElement.tagName !== 'TEXTAREA') {

        if (e.key === 'e' && e.ctrlKey) {
            e.preventDefault();
            expandAllPhases();
            expandAllAccordions();
        }

        if (e.key === 'c' && e.ctrlKey && e.shiftKey) {
            e.preventDefault();
            collapseAllPhases();
            collapseAllAccordions();
        }
    }
});

// Console welcome message
console.log('%c🔐 Cybersecurity Career Roadmap', 'font-size: 24px; font-weight: bold; color: #00d4aa;');
console.log('%cBuilt by Batya Boyo - Uganda, 2026', 'font-size: 14px; color: #8b949e;');
console.log('%c\nKeyboard shortcuts:', 'font-size: 12px; color: #feca57;');
console.log('%c  Ctrl+E: Expand all sections', 'font-size: 11px; color: #a29bfe;');
console.log('%c  Ctrl+Shift+C: Collapse all sections', 'font-size: 11px; color: #a29bfe;');
