document.addEventListener('DOMContentLoaded', () => {

    // --- 1. LOCAL STORAGE & PROGRESS TRACKER ---

    // Generate valid IDs for list items to track them consistently
    const generateId = (text) => {
        return text.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 30);
    };

    // Target specific list items for tracking
    const progressTargets = document.querySelectorAll('.content-block ul li, .resource-list li');
    let totalItems = progressTargets.length;
    let completedItems = 0;

    // Create Progress Dashboard
    const createProgressDashboard = () => {
        const dashboard = document.createElement('div');
        dashboard.className = 'container progress-header';
        dashboard.style.cssText = 'background: rgba(0, 255, 136, 0.05); border: 1px solid rgba(0,255,136,0.2); padding: 15px 20px; border-radius: 4px; margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center; font-family: var(--font-mono); font-size: 0.9rem;';
        
        dashboard.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px; flex: 1;">
                <span style="color: var(--primary-color); font-weight: bold;"><i class="fa-solid fa-terminal"></i> OP STATUS</span>
                <div style="flex: 1; height: 10px; background: rgba(255,255,255,0.1); border-radius: 5px; overflow: hidden;">
                    <div id="main-progress-bar" style="height: 100%; width: 0%; background: var(--primary-color); transition: width 0.3s ease; box-shadow: var(--neon-glow);"></div>
                </div>
                <span id="progress-text" style="color: var(--primary-color); min-width: 45px; text-align: right;">0%</span>
            </div>
        `;

        const roadmapSection = document.getElementById('roadmap');
        const container = roadmapSection.querySelector('.container');
        container.insertBefore(dashboard, container.querySelector('.search-container'));

        return {
            bar: document.getElementById('main-progress-bar'),
            text: document.getElementById('progress-text')
        };
    };

    const dashboardUI = createProgressDashboard();

    // Load saved state
    let savedProgress = JSON.parse(localStorage.getItem('hackerCommandCenterProgress')) || {};

    const updateProgressUI = () => {
        const percentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
        if(dashboardUI.bar) dashboardUI.bar.style.width = `${percentage}%`;
        if(dashboardUI.text) dashboardUI.text.innerText = `${percentage}%`;

        if (percentage === 100 && dashboardUI.text) {
            dashboardUI.text.innerText = "100% - MASTER OPERATOR";
            dashboardUI.text.style.color = "var(--secondary-color)";
            if(dashboardUI.bar) dashboardUI.bar.style.background = "var(--secondary-color)";
        }
    };

    // Initialize Checkboxes
    progressTargets.forEach(li => {
        const text = li.innerText.trim();
        const id = generateId(text);

        if (!id) return;

        // Create custom checkbox UI
        const checkboxWrapper = document.createElement('span');
        checkboxWrapper.style.cssText = 'display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; border: 1px solid var(--primary-color); margin-right: 10px; cursor: pointer; border-radius: 3px; background: rgba(0,0,0,0.5); vertical-align: middle; transition: all 0.2s;';
        
        const checkIcon = document.createElement('i');
        checkIcon.className = 'fa-solid fa-check';
        checkIcon.style.cssText = 'color: #000; font-size: 12px; opacity: 0; transition: opacity 0.2s;';
        checkboxWrapper.appendChild(checkIcon);

        // State function
        const setCompleted = (isComplete, save = true) => {
            if (isComplete) {
                checkIcon.style.opacity = '1';
                checkboxWrapper.style.background = 'var(--primary-color)';
                li.style.opacity = '0.5';
                li.style.textDecoration = 'line-through';
                if(save && !savedProgress[id]) {
                    savedProgress[id] = true;
                    completedItems++;
                }
            } else {
                checkIcon.style.opacity = '0';
                checkboxWrapper.style.background = 'rgba(0,0,0,0.5)';
                li.style.opacity = '1';
                li.style.textDecoration = 'none';
                if(save && savedProgress[id]) {
                    delete savedProgress[id];
                    completedItems--;
                }
            }
            if(save) {
                localStorage.setItem('hackerCommandCenterProgress', JSON.stringify(savedProgress));
                updateProgressUI();
            }
        };

        // Initial Load
        if (savedProgress[id]) {
            completedItems++;
            setCompleted(true, false);
        }

        // Click Event
        checkboxWrapper.addEventListener('click', () => {
            const isCurrentlyChecked = !!savedProgress[id];
            setCompleted(!isCurrentlyChecked);
        });

        li.prepend(checkboxWrapper);
        // Remove the existing `>` pseudo element text equivalent by styling
        li.style.paddingLeft = '0';
    });

    updateProgressUI();

    // --- 2. NEW PROGRESS CONTROLS (Header Buttons) ---

    const resetBtn = document.getElementById('reset-btn');
    if(resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (confirm('WARNING: Initialize full data wipe? This will permanently delete your operational progress.')) {
                localStorage.removeItem('hackerCommandCenterProgress');
                location.reload();
            }
        });
    }

    const exportBtn = document.getElementById('export-btn');
    if(exportBtn) {
        exportBtn.addEventListener('click', () => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(savedProgress));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", "operator_progress.json");
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
        });
    }

    const importBtn = document.getElementById('import-btn');
    if(importBtn) {
        importBtn.addEventListener('click', () => {
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
                        localStorage.setItem('hackerCommandCenterProgress', JSON.stringify(content));
                        location.reload();
                    } catch (err) {
                        alert('ERROR: Invalid data format detected.');
                    }
                }
            }
            input.click();
        });
    }

    // --- 3. SEARCH & FILTER ---

    // Directive Search
    const resourceSearch = document.getElementById('resource-search');
    if (resourceSearch) {
        resourceSearch.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const phases = document.querySelectorAll('.phase-card');

            phases.forEach(phase => {
                const items = phase.querySelectorAll('.content-block li');
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

                if (term) {
                    phase.style.display = foundMatch ? 'block' : 'none';
                    if (foundMatch) {
                        const content = phase.querySelector('.phase-content');
                        if(content) content.classList.add('active');
                    }
                } else {
                    phase.style.display = 'block';
                    // Reset text color
                    items.forEach(item => item.style.color = '');
                }
            });
        });
    }

    // Tools Arsenal Search
    const toolSearch = document.getElementById('tool-search');
    if (toolSearch) {
        toolSearch.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const tools = document.querySelectorAll('.tool-item');
            
            tools.forEach(tool => {
                const text = tool.innerText.toLowerCase();
                if(text.includes(term)) {
                    tool.style.display = 'block';
                } else {
                    tool.style.display = 'none';
                }
            });
        });
    }


    // --- 4. NAVIGATION & BACK-TO-TOP ---

    const backToTop = document.getElementById('back-to-top');
    if(backToTop) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 500) {
                backToTop.classList.add('show');
            } else {
                backToTop.classList.remove('show');
            }
        });

        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    const phaseLinks = document.querySelectorAll('.phase-link');
    const phaseCards = document.querySelectorAll('.phase-card');

    // Smooth scroll for nav
    const handleNavClick = (e, link) => {
        e.preventDefault();
        const targetId = link.getAttribute('data-target');
        const targetCard = document.getElementById(targetId);
        
        if(!targetCard) return;

        const headerOffset = 140;
        const elementPosition = targetCard.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({ top: offsetPosition, behavior: "smooth" });

        // Auto-expand
        const content = targetCard.querySelector('.phase-content');
        const icon = targetCard.querySelector('.expand-icon i');
        if (content && !content.classList.contains('active')) {
            content.classList.add('active');
            if(icon) icon.classList.replace('fa-plus', 'fa-minus');
        }
    };

    phaseLinks.forEach(link => {
        link.addEventListener('click', (e) => handleNavClick(e, link));
    });

    // Intersection Observer for ScrollSpy
    if('IntersectionObserver' in window && phaseCards.length > 0) {
        const spyOptions = { threshold: 0.2, rootMargin: "-20% 0px -60% 0px" };
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
    }


    // --- 5. CORE UI LOGIC ---

    // Mobile Menu
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('nav');
    const body = document.body;

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isActive = navMenu.classList.toggle('active');
            const icon = menuToggle.querySelector('i');
            
            if(icon) {
                icon.classList.toggle('fa-bars', !isActive);
                icon.classList.toggle('fa-xmark', isActive);
            }
            menuToggle.setAttribute('aria-expanded', isActive);
            body.style.overflow = isActive ? 'hidden' : '';
        });

        // Close menu when clicking a link
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                const icon = menuToggle.querySelector('i');
                if(icon) icon.classList.replace('fa-xmark', 'fa-bars');
                body.style.overflow = '';
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (navMenu.classList.contains('active') && !navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                navMenu.classList.remove('active');
                const icon = menuToggle.querySelector('i');
                if(icon) icon.classList.replace('fa-xmark', 'fa-bars');
                body.style.overflow = '';
            }
        });
    }

    // Accordion Logic
    const initAccordion = (selectors) => {
        document.querySelectorAll(selectors).forEach(header => {
            header.addEventListener('click', () => {
                const content = header.nextElementSibling;
                if(!content) return;

                const icon = header.querySelector('.expand-icon i') || header.querySelector('i');
                const isActive = content.classList.toggle('active');

                if (icon) {
                    if (icon.classList.contains('fa-plus') || icon.classList.contains('fa-minus')) {
                        icon.classList.toggle('fa-plus', !isActive);
                        icon.classList.toggle('fa-minus', isActive);
                    } else {
                        header.classList.toggle('active', isActive);
                    }
                }
            });
        });
    };

    initAccordion('.phase-header');
});
