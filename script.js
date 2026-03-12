document.addEventListener('DOMContentLoaded', () => {

    // --- 1. DASHBOARD INITIALIZATION ---
    const body = document.body;
    const cpuVal = document.getElementById('cpu-load');
    const mainProgressText = document.getElementById('progress-text');
    const mainProgressPercent = document.getElementById('progress-percent');
    const mainProgressBar = document.getElementById('main-progress-bar');

    // Sidebar & menu toggle (declared early to avoid reference errors)
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    const closeSidebar = () => {
        if (sidebar) sidebar.classList.remove('active');
        if (menuToggle) menuToggle.classList.remove('active');
        if (sidebarOverlay) sidebarOverlay.classList.remove('active');
    };
    
    // --- 2. TERMINAL TYPEWRITER EFFECT ---
    const typeSubtitle = () => {
        const sub = document.getElementById('typing-sub');
        if (!sub) return;
        
        const lines = [
            "> INITIALIZING CYBER OPERATIONS...",
            "> LOADING PENETRATION TESTING MODULES...",
            "> SYSTEM READY. STAND BY FOR MISSION START."
        ];
        
        let lineIdx = 0;
        let charIdx = 0;
        let currentLine = "";
        
        const typeChar = () => {
            if (lineIdx < lines.length) {
                if (charIdx < lines[lineIdx].length) {
                    currentLine += lines[lineIdx][charIdx];
                    sub.innerHTML = currentLine + '<span class="cursor">_</span>';
                    charIdx++;
                    setTimeout(typeChar, 50);
                } else {
                    currentLine += "<br>";
                    lineIdx++;
                    charIdx = 0;
                    setTimeout(typeChar, 500);
                }
            }
        };
        typeChar();
    };
    typeSubtitle();

    // --- 3. LIVE SYSTEM STATS ---
    const updateStats = () => {
        if(cpuVal) {
            const load = Math.floor(Math.random() * 8) + 1;
            cpuVal.innerText = `${load.toString().padStart(2, '0')}%`;
        }
    };
    setInterval(updateStats, 3000);

    // --- 4. THEME & PERSISTENCE ---
    const themeBtn = document.getElementById('theme-btn');
    const savedTheme = localStorage.getItem('hackerCmdTheme');
    
    if (savedTheme === 'light') {
        body.classList.add('light-theme');
        if (themeBtn) themeBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
    }

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            body.classList.toggle('light-theme');
            const isLight = body.classList.contains('light-theme');
            themeBtn.innerHTML = isLight ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>';
            localStorage.setItem('hackerCmdTheme', isLight ? 'light' : 'dark');
        });
    }

    // --- 5. PROGRESS & SKILL TRACKER ---
    // Generate a stable unique ID from text + index to avoid collisions
    const generateId = (text, index) => {
        const base = text.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 30);
        return base ? `${base}_${index}` : '';
    };
    const progressTargets = document.querySelectorAll('.content-block ul li, .resource-list li');
    const skillCheckboxes = document.querySelectorAll('.skill-item input');
    
    let savedProgress = JSON.parse(localStorage.getItem('hackerCommandCenterProgress')) || {};
    let savedSkills = JSON.parse(localStorage.getItem('hackerSidebarSkills')) || {};

    const updateAllProgress = () => {
        const totalOps = progressTargets.length;
        const completedOps = Object.values(savedProgress).filter(Boolean).length;
        const percentage = totalOps > 0 ? Math.round((completedOps / totalOps) * 100) : 0;
        
        if(mainProgressBar) mainProgressBar.style.width = `${percentage}%`;
        if(mainProgressPercent) mainProgressPercent.innerText = `${percentage}%`;
        if(mainProgressText) mainProgressText.innerText = `${completedOps}/${totalOps} Operations Secure`;

        // Update per-phase progress in sidebar
        updatePhaseProgress();
    };

    // Per-phase progress badges
    const updatePhaseProgress = () => {
        document.querySelectorAll('.phase-card').forEach(card => {
            const phaseId = card.getAttribute('id');
            const items = card.querySelectorAll('.content-block ul li');
            if (!items.length) return;
            let done = 0;
            items.forEach(li => { if (li.classList.contains('strikethrough')) done++; });
            const pct = Math.round((done / items.length) * 100);
            const link = document.querySelector(`.sidebar a[href="#${phaseId}"]`);
            if (link) {
                let badge = link.querySelector('.phase-badge');
                if (!badge) {
                    badge = document.createElement('span');
                    badge.className = 'phase-badge';
                    link.appendChild(badge);
                }
                badge.textContent = `${pct}%`;
                badge.classList.toggle('complete', pct === 100);
            }
        });
    };

    // Initialize Skill Tracker
    skillCheckboxes.forEach(cb => {
        const id = cb.dataset.skill;
        cb.checked = !!savedSkills[id];
        cb.addEventListener('change', () => {
            savedSkills[id] = cb.checked;
            localStorage.setItem('hackerSidebarSkills', JSON.stringify(savedSkills));
        });
    });

    // Initialize Operational Checklist
    progressTargets.forEach((li, index) => {
        const text = li.innerText.trim();
        const id = generateId(text, index);
        if (!id) return;

        const checkbox = document.createElement('span');
        checkbox.className = 'custom-cb';
        checkbox.setAttribute('tabindex', '0');
        checkbox.setAttribute('role', 'checkbox');
        checkbox.setAttribute('aria-checked', !!savedProgress[id]);
        checkbox.innerHTML = '<i class="fa-solid fa-check"></i>';
        
        const setComplete = (isDone, save = true) => {
            checkbox.classList.toggle('checked', isDone);
            checkbox.setAttribute('aria-checked', isDone);
            li.classList.toggle('strikethrough', isDone);
            if(save) {
                if(isDone) savedProgress[id] = true;
                else delete savedProgress[id];
                localStorage.setItem('hackerCommandCenterProgress', JSON.stringify(savedProgress));
                updateAllProgress();
            }
        };

        if(savedProgress[id]) setComplete(true, false);

        checkbox.addEventListener('click', () => setComplete(!checkbox.classList.contains('checked')));
        checkbox.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setComplete(!checkbox.classList.contains('checked'));
            }
        });
        li.prepend(checkbox);
    });

    updateAllProgress();

    // --- 6. SIDEBAR NAVIGATION & SCROLL ENGINE ---
    const sidebarLinks = document.querySelectorAll('.sidebar li a');
    const sections = document.querySelectorAll('.phase-card');

    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            const cockpit = document.querySelector('.main-cockpit');
            
            if(targetElement && cockpit) {
                const targetPos = targetElement.getBoundingClientRect().top;
                const cockpitPos = cockpit.getBoundingClientRect().top;
                const offset = targetPos - cockpitPos + cockpit.scrollTop - 20;

                cockpit.scrollTo({
                    top: offset,
                    behavior: 'smooth'
                });
            }
            // Auto-close sidebar on mobile
            if (window.innerWidth <= 1024) {
                closeSidebar();
            }
        });
    });

    // Intersection Observer for Sidebar
    const obsOptions = { root: document.querySelector('.main-cockpit'), threshold: 0.3 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                sidebarLinks.forEach(link => {
                    const parent = link.parentElement;
                    const isActive = link.getAttribute('href') === `#${id}`;
                    parent.classList.toggle('active', isActive);
                });
            }
        });
    }, obsOptions);

    sections.forEach(section => observer.observe(section));

    // --- 7. SEARCH ---
    // Toolkit search
    const toolSearch = document.getElementById('tool-search');
    if (toolSearch) {
        toolSearch.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            document.querySelectorAll('.tool-item').forEach(tool => {
                const text = tool.innerText.toLowerCase();
                tool.style.display = text.includes(term) ? 'flex' : 'none';
            });
        });
    }

    // Roadmap resource search
    const resourceSearch = document.getElementById('resource-search');
    if (resourceSearch) {
        resourceSearch.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase().trim();
            document.querySelectorAll('.phase-card').forEach(card => {
                if (!term) {
                    card.style.display = '';
                    card.querySelectorAll('.content-block ul li').forEach(li => li.style.display = '');
                    return;
                }
                const items = card.querySelectorAll('.content-block ul li');
                let hasMatch = false;
                items.forEach(li => {
                    const match = li.textContent.toLowerCase().includes(term);
                    li.style.display = match ? '' : 'none';
                    if (match) hasMatch = true;
                });
                // Also match phase title
                const title = card.querySelector('.phase-title');
                if (title && title.textContent.toLowerCase().includes(term)) hasMatch = true;
                card.style.display = hasMatch ? '' : 'none';
                // Auto-expand matching cards
                if (hasMatch && term.length > 1) {
                    const content = card.querySelector('.phase-content');
                    const icon = card.querySelector('.expand-icon i');
                    if (content && !content.classList.contains('active')) {
                        content.classList.add('active');
                        if (icon) { icon.classList.remove('fa-plus'); icon.classList.add('fa-minus'); }
                    }
                }
            });
        });
    }

    // --- 8. MOBILE SIDEBAR TOGGLE ---
    if(menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            const isOpening = !sidebar.classList.contains('active');
            sidebar.classList.toggle('active');
            menuToggle.classList.toggle('active');
            if (sidebarOverlay) sidebarOverlay.classList.toggle('active', isOpening);
        });
    }

    // Close sidebar when clicking overlay
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeSidebar);
    }

    // --- 9. ACCORDION ---
    document.querySelectorAll('.phase-header').forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            const icon = header.querySelector('.expand-icon i');
            const isActive = content.classList.toggle('active');
            if(icon) { icon.classList.toggle('fa-plus', !isActive); icon.classList.toggle('fa-minus', isActive); }
        });
    });

    // --- 10. BACK TO TOP ---
    const backToTop = document.getElementById('back-to-top');
    const cockpit = document.querySelector('.main-cockpit');
    if (backToTop && cockpit) {
        cockpit.addEventListener('scroll', () => {
            backToTop.classList.toggle('show', cockpit.scrollTop > 400);
        });
        backToTop.addEventListener('click', () => {
            cockpit.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- 11. IMPORT / EXPORT PROGRESS ---
    const exportBtn = document.getElementById('export-btn');
    const importBtn = document.getElementById('import-btn');

    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const data = {
                progress: savedProgress,
                skills: savedSkills,
                exportedAt: new Date().toISOString()
            };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'cybermap-progress.json';
            a.click();
            URL.revokeObjectURL(url);
        });
    }

    if (importBtn) {
        importBtn.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                    try {
                        const data = JSON.parse(ev.target.result);
                        if (data.progress && typeof data.progress === 'object') {
                            savedProgress = data.progress;
                            localStorage.setItem('hackerCommandCenterProgress', JSON.stringify(savedProgress));
                        }
                        if (data.skills && typeof data.skills === 'object') {
                            savedSkills = data.skills;
                            localStorage.setItem('hackerSidebarSkills', JSON.stringify(savedSkills));
                            skillCheckboxes.forEach(cb => { cb.checked = !!savedSkills[cb.dataset.skill]; });
                        }
                        // Re-sync checkbox UI
                        progressTargets.forEach((li, index) => {
                            const text = li.innerText.replace(/^\s*✓?\s*/, '').trim();
                            const id = generateId(text, index);
                            if (!id) return;
                            const cb = li.querySelector('.custom-cb');
                            if (cb) {
                                const isDone = !!savedProgress[id];
                                cb.classList.toggle('checked', isDone);
                                cb.setAttribute('aria-checked', isDone);
                                li.classList.toggle('strikethrough', isDone);
                            }
                        });
                        updateAllProgress();
                    } catch {
                        // Invalid file — ignore silently
                    }
                };
                reader.readAsText(file);
            });
            input.click();
        });
    }
});
