document.addEventListener('DOMContentLoaded', () => {

    // --- 1. LOCAL STORAGE & PROGRESS TRACKER ---

    // Generate valid IDs for list items to track them
    const generateId = (text) => {
        return text.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20);
    };

    const progressTargets = document.querySelectorAll('.content-block ul li, .resource-list li, .uganda-card ul li');
    let totalItems = progressTargets.length;
    let completedItems = 0;

    // Create Progress Dashboard
    const createProgressDashboard = () => {
        const dashboard = document.createElement('div');
        dashboard.className = 'container progress-header';
        dashboard.setAttribute('role', 'region');
        dashboard.setAttribute('aria-label', 'Career Progress Tracker');
        dashboard.innerHTML = `
            <span><i class="fa-solid fa-list-check" aria-hidden="true"></i> CAREER PROGRESS</span>
            <div class="progress-bar-container" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
                <div class="progress-bar-fill" id="main-progress-bar"></div>
            </div>
            <span id="progress-text">0%</span>
            <div class="progress-controls">
                <button id="export-progress" class="btn-small" title="Export Progress JSON" aria-label="Export Progress"><i class="fa-solid fa-download"></i></button>
                <button id="import-progress" class="btn-small" title="Import Progress JSON" aria-label="Import Progress"><i class="fa-solid fa-upload"></i></button>
                <button id="reset-progress" class="btn-small btn-reset" title="Reset All Progress" aria-label="Reset Progress"><i class="fa-solid fa-trash-can"></i></button>
            </div>
        `;

        const heroSection = document.getElementById('hero');
        heroSection.parentNode.insertBefore(dashboard, heroSection.nextSibling);

        return {
            bar: document.getElementById('main-progress-bar'),
            text: document.getElementById('progress-text'),
            container: dashboard.querySelector('.progress-bar-container')
        };
    };

    const dashboardUI = createProgressDashboard();

    // Load saved state
    let savedProgress = JSON.parse(localStorage.getItem('cyberRoadmapProgress')) || {};

    const updateProgressUI = () => {
        const percentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
        dashboardUI.bar.style.width = `${percentage}%`;
        dashboardUI.text.innerText = `${percentage}%`;
        dashboardUI.container.setAttribute('aria-valuenow', percentage);

        if (percentage === 100) {
            dashboardUI.text.innerText = "100% - HACKER MODE UNLOCKED";
            dashboardUI.text.style.color = "var(--primary-color)";
        } else {
            dashboardUI.text.style.color = "";
        }
    };

    // Initialize Checkboxes
    progressTargets.forEach(li => {
        const text = li.innerText.trim();
        const id = generateId(text);

        // Ensure LI has some text to generate ID
        if (!id) return;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'tracker-checkbox';
        checkbox.dataset.id = id;
        checkbox.setAttribute('aria-label', `Mark ${text} as completed`);

        if (savedProgress[id]) {
            checkbox.checked = true;
            completedItems++;
            li.classList.add('completed');
            li.style.opacity = '0.5';
            li.style.textDecoration = 'line-through';
        }

        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                savedProgress[id] = true;
                completedItems++;
                li.classList.add('completed');
                li.style.opacity = '0.5';
                li.style.textDecoration = 'line-through';
            } else {
                delete savedProgress[id];
                completedItems--;
                li.classList.remove('completed');
                li.style.opacity = '1';
                li.style.textDecoration = 'none';
            }
            localStorage.setItem('cyberRoadmapProgress', JSON.stringify(savedProgress));
            updateProgressUI();
        });

        li.prepend(checkbox);
    });

    updateProgressUI();

    // --- 2. NEW PROGRESS CONTROLS ---

    document.getElementById('reset-progress').addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
            localStorage.removeItem('cyberRoadmapProgress');
            location.reload();
        }
    });

    document.getElementById('export-progress').addEventListener('click', () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(savedProgress));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "cyber_roadmap_progress.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    });

    document.getElementById('import-progress').addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = e => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.readAsText(file, 'UTF-8');
            reader.onload = readerEvent => {
                try {
                    const content = JSON.parse(readerEvent.target.result);
                    localStorage.setItem('cyberRoadmapProgress', JSON.stringify(content));
                    location.reload();
                } catch (err) {
                    alert('Invalid JSON file.');
                }
            }
        }
        input.click();
    });


    // --- 3. SEARCH & FILTER ---

    const searchInput = document.getElementById('resource-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const phases = document.querySelectorAll('.phase-card');

            phases.forEach(phase => {
                const items = phase.querySelectorAll('.content-block li, .tools-grid span, .uganda-card li');
                let foundMatch = false;

                items.forEach(item => {
                    const text = item.innerText.toLowerCase();
                    if (text.includes(term)) {
                        item.style.display = '';
                        item.style.color = term ? 'var(--primary-color)' : '';
                        foundMatch = true;
                    } else {
                        item.style.display = term ? 'none' : '';
                    }
                });

                // Visual feedback for search
                if (term) {
                    phase.style.opacity = foundMatch ? '1' : '0.2';
                    phase.style.transform = foundMatch ? 'scale(1)' : 'scale(0.98)';
                } else {
                    phase.style.opacity = '1';
                    phase.style.transform = 'scale(1)';
                }
            });
        });
    }


    // --- 4. NAVIGATION & BACK-TO-TOP ---

    const backToTop = document.getElementById('back-to-top');
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 500) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });

    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    const phaseLinks = document.querySelectorAll('.phase-link');
    const phaseCards = document.querySelectorAll('.phase-card');

    // Smooth scroll for nav
    const handleNavClick = (e, link) => {
        e.preventDefault();
        const targetId = link.getAttribute('data-target');
        const targetCard = document.getElementById(targetId);
        const headerOffset = 140;
        const elementPosition = targetCard.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({ top: offsetPosition, behavior: "smooth" });

        // Auto-expand
        const content = targetCard.querySelector('.phase-content');
        const icon = targetCard.querySelector('.expand-icon i');
        if (!content.classList.contains('active')) {
            content.classList.add('active');
            icon.classList.replace('fa-plus', 'fa-minus');
        }
    };

    phaseLinks.forEach(link => {
        link.addEventListener('click', (e) => handleNavClick(e, link));
    });

    // Intersection Observer for ScrollSpy
    const spyOptions = { threshold: 0.2, rootMargin: "-10% 0px -70% 0px" };
    const spyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                phaseLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('data-target') === id);
                });
            }
        });
    }, spyOptions);

    phaseCards.forEach(card => spyObserver.observe(card));


    // --- 5. CORE UI LOGIC (REFACTORED) ---

    // Mobile Menu
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('nav');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            const isActive = navMenu.classList.toggle('active');
            const icon = menuToggle.querySelector('i');
            icon.classList.toggle('fa-bars', !isActive);
            icon.classList.toggle('fa-times', isActive);
            menuToggle.setAttribute('aria-expanded', isActive);
        });
    }

    // Generic Accordion Logic
    const initAccordion = (selectors, contentClass) => {
        document.querySelectorAll(selectors).forEach(header => {
            header.addEventListener('click', () => {
                const content = header.nextElementSibling;
                const icon = header.querySelector('.expand-icon i') || header.querySelector('i');
                const isActive = content.classList.toggle('active');

                if (icon) {
                    if (icon.classList.contains('fa-plus') || icon.classList.contains('fa-minus')) {
                        icon.classList.toggle('fa-plus', !isActive);
                        icon.classList.toggle('fa-minus', isActive);
                    } else if (selectors.includes('accordion')) {
                        header.classList.toggle('active', isActive);
                    }
                }
                header.setAttribute('aria-expanded', isActive);
            });
        });
    };

    initAccordion('.phase-header', 'phase-content');
    initAccordion('.accordion-header', 'accordion-body');


    // Theme Toggle
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        const body = document.body;
        const icon = themeToggle.querySelector('i');

        const setTheme = (isLight) => {
            body.classList.toggle('light-mode', isLight);
            icon.classList.toggle('fa-sun', !isLight);
            icon.classList.toggle('fa-moon', isLight);
            localStorage.setItem('cyberMapTheme', isLight ? 'light' : 'dark');
        };

        const savedTheme = localStorage.getItem('cyberMapTheme');
        setTheme(savedTheme === 'light');

        themeToggle.addEventListener('click', () => setTheme(!body.classList.contains('light-mode')));
    }

});
