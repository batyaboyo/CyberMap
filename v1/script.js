document.addEventListener('DOMContentLoaded', () => {

    // --- 1. LOCAL STORAGE & PROGRESS TRACKER ---

    // Generate valid IDs for list items to track them
    const generateId = (text) => {
        return text.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20);
    };

    // Inject Checkboxes into all roadmap lists
    const progressTargets = document.querySelectorAll('.content-block ul li, .resource-list li, .uganda-card ul li');
    let totalItems = progressTargets.length;
    let completedItems = 0;

    // Create Progress Dashboard
    const createProgressDashboard = () => {
        const dashboard = document.createElement('div');
        dashboard.className = 'container progress-header';
        dashboard.innerHTML = `
            <span><i class="fa-solid fa-list-check"></i> CAREER PROGRESS</span>
            <div class="progress-bar-container">
                <div class="progress-bar-fill" id="main-progress-bar"></div>
            </div>
            <span id="progress-text">0%</span>
        `;

        // Insert after Hero, before Roadmap
        const heroSection = document.getElementById('hero');
        heroSection.parentNode.insertBefore(dashboard, heroSection.nextSibling);

        return {
            bar: document.getElementById('main-progress-bar'),
            text: document.getElementById('progress-text')
        };
    };

    const dashboardUI = createProgressDashboard();

    // Load saved state
    const savedProgress = JSON.parse(localStorage.getItem('cyberRoadmapProgress')) || {};

    // Initialize Checkboxes
    progressTargets.forEach(li => {
        const text = li.innerText;
        const id = generateId(text);

        // Create checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'tracker-checkbox';
        checkbox.dataset.id = id;

        // Check if previously saved
        if (savedProgress[id]) {
            checkbox.checked = true;
            completedItems++;
            li.style.opacity = '0.5'; // Dim completed items
            li.style.textDecoration = 'line-through';
        }

        // Add event listener
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                savedProgress[id] = true;
                completedItems++;
                li.style.opacity = '0.5';
                li.style.textDecoration = 'line-through';
            } else {
                delete savedProgress[id];
                completedItems--;
                li.style.opacity = '1';
                li.style.textDecoration = 'none';
            }

            // Save to LocalStorage
            localStorage.setItem('cyberRoadmapProgress', JSON.stringify(savedProgress));

            // Update UI
            updateProgressUI();
        });

        // Prepend to list item
        li.prepend(checkbox);
    });

    const updateProgressUI = () => {
        const percentage = Math.round((completedItems / totalItems) * 100);
        dashboardUI.bar.style.width = `${percentage}%`;
        dashboardUI.text.innerText = `${percentage}%`;

        // Fun feedback
        if (percentage === 100) {
            dashboardUI.text.innerText = "100% - HACKER MODE UNLOCKED";
            dashboardUI.text.style.color = "var(--primary-color)";
        }
    };

    // Initial update
    updateProgressUI();


    // --- 2. EXISTING UI INTERATIONS ---

    // Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav');
    const navLinks = document.querySelectorAll('nav ul li a');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            nav.classList.toggle('active');
            const icon = menuToggle.querySelector('i');
            if (nav.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    // Close menu when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('active');
            const icon = menuToggle.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    });

    // Phase Card Expansion
    const phaseHeaders = document.querySelectorAll('.phase-header');

    phaseHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            const icon = header.querySelector('.expand-icon i');

            // Close other open phases (optional, but good for UX)
            /* 
            document.querySelectorAll('.phase-content').forEach(c => {
                if (c !== content && c.classList.contains('active')) {
                    c.classList.remove('active');
                    c.previousElementSibling.querySelector('.expand-icon i').classList.remove('fa-minus');
                    c.previousElementSibling.querySelector('.expand-icon i').classList.add('fa-plus');
                }
            });
            */

            content.classList.toggle('active');

            if (content.classList.contains('active')) {
                icon.classList.remove('fa-plus');
                icon.classList.add('fa-minus');
            } else {
                icon.classList.remove('fa-minus');
                icon.classList.add('fa-plus');
            }
        });
    });

    // FAQ Accordion
    const faqHeaders = document.querySelectorAll('.accordion-header');

    faqHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const body = header.nextElementSibling;

            // Toggle current
            header.classList.toggle('active');
            body.classList.toggle('active');

            // Close others if needed? Let's keep multiple expandable for FAQs
        });
    });

    // Scroll Animations (Simple Intersection Observer)
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Apply animation styles initially to sections
    const animatedElements = document.querySelectorAll('.section-title, .phase-card, .resource-card, .uganda-card');

    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });

    // Glitch Text Effect Randomizer
    const glitchText = document.querySelector('.glitch-text');
    if (glitchText) {
        setInterval(() => {
            const skew = Math.random() * 10 - 5;
            glitchText.style.transform = `skewX(${skew}deg)`;
            setTimeout(() => {
                glitchText.style.transform = 'skewX(0deg)';
            }, 100);
        }, 2000);
    }

    // --- 3. SECONDARY NAV LOGIC ---
    const phaseLinks = document.querySelectorAll('.phase-link');

    phaseLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('data-target');
            const targetCard = document.getElementById(targetId);

            // Smooth scroll (account for sticky header height ~100px)
            const headerOffset = 120;
            const elementPosition = targetCard.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });

            // Highlight active link immediately
            phaseLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Auto-expand the target card if closed
            const content = targetCard.querySelector('.phase-content');
            const icon = targetCard.querySelector('.expand-icon i');
            if (!content.classList.contains('active')) {
                content.classList.add('active');
                icon.classList.remove('fa-plus');
                icon.classList.add('fa-minus');
            }
        });
    });

    // ScrollSpy for Secondary Nav
    window.addEventListener('scroll', () => {
        let current = '';
        const phases = document.querySelectorAll('.phase-card');

        phases.forEach(phase => {
            const phaseTop = phase.offsetTop;
            const phaseHeight = phase.clientHeight;
            if (pageYOffset >= (phaseTop - 200)) {
                current = phase.getAttribute('id');
            }
        });

        phaseLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-target') === current) {
                link.classList.add('active');
            }
        });
    });

    // --- 4. THEME TOGGLE LOGIC ---
    const themeToggle = document.querySelector('.theme-toggle');
    const body = document.body;
    let icon = null;
    if (themeToggle) {
        icon = themeToggle.querySelector('i');
    }

    // Check for saved theme
    const savedTheme = localStorage.getItem('cyberMapTheme');
    if (savedTheme === 'light') {
        body.classList.add('light-mode');
        if (icon) {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            body.classList.toggle('light-mode');

            if (body.classList.contains('light-mode')) {
                localStorage.setItem('cyberMapTheme', 'light');
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            } else {
                localStorage.setItem('cyberMapTheme', 'dark');
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            }
        });
    }

});
