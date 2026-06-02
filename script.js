// ============================================
// SUPER FANCY SITE v11 - MAXIMUM INTERACTIVE MAGIC
// ============================================

// ---- PARTICLE SYSTEM (Canvas) ----
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
let mouse = { x: 0, y: 0 };

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
    constructor() {
        this.reset();
    }
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5 + 0.1;
        this.hue = Math.random() > 0.5 ? 260 : 190; // purple or cyan
        this.life = Math.random() * 200 + 100;
        this.maxLife = this.life;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life--;

        // Mouse attraction
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
            this.x += dx * 0.002;
            this.y += dy * 0.002;
            this.opacity = Math.min(this.opacity + 0.01, 0.8);
        }

        if (this.life <= 0 || this.x < -50 || this.x > canvas.width + 50 ||
            this.y < -50 || this.y > canvas.height + 50) {
            this.reset();
        }
    }
    draw() {
        const fadeRatio = this.life / this.maxLife;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, 80%, 70%, ${this.opacity * fadeRatio})`;
        ctx.fill();

        // Glow effect
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, 80%, 70%, ${this.opacity * fadeRatio * 0.15})`;
        ctx.fill();
    }
}

// Create particles
for (let i = 0; i < 80; i++) {
    particles.push(new Particle());
}

// Draw connections between nearby particles
function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
                const opacity = (1 - dist / 120) * 0.15;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.strokeStyle = `rgba(139, 92, 246, ${opacity})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        }
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    drawConnections();
    requestAnimationFrame(animateParticles);
}
animateParticles();

// Track mouse
document.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});


// ---- SCROLL REVEAL OBSERVER ----
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -80px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.features, .showcase, .testimonials, .stats, .cta').forEach(section => {
    observer.observe(section);
});

// ---- NAVBAR SCROLL EFFECT ----
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 80) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// ---- CURSOR GLOW ----
const cursorGlow = document.createElement('div');
cursorGlow.style.cssText = `
    position: fixed;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(139, 92, 246, 0.07), rgba(6, 182, 212, 0.03), transparent 70%);
    border-radius: 50%;
    pointer-events: none;
    z-index: 9999;
    transform: translate(-50%, -50%);
    transition: opacity 0.3s ease;
    mix-blend-mode: screen;
`;
document.body.appendChild(cursorGlow);

let cursorX = 0, cursorY = 0, glowX = 0, glowY = 0;

document.addEventListener('mousemove', (e) => {
    cursorX = e.clientX;
    cursorY = e.clientY;
});

// Smooth cursor following
function updateCursorGlow() {
    glowX += (cursorX - glowX) * 0.08;
    glowY += (cursorY - glowY) * 0.08;
    cursorGlow.style.left = glowX + 'px';
    cursorGlow.style.top = glowY + 'px';
    requestAnimationFrame(updateCursorGlow);
}
updateCursorGlow();

// ---- FEATURE CARD 3D TILT + SPOTLIGHT ----
document.querySelectorAll('.feature-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 15;
        const rotateY = (centerX - x) / 15;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.02)`;

        // Dynamic spotlight
        const percentX = (x / rect.width) * 100;
        const percentY = (y / rect.height) * 100;
        card.style.setProperty('--mouse-x', percentX + '%');
        card.style.setProperty('--mouse-y', percentY + '%');
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0) scale(1)';
    });
});

// ---- MAGNETIC BUTTONS ----
document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px) scale(1.03)`;
    });

    btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0, 0) scale(1)';
    });
});


// ---- PARALLAX ON HERO ELEMENTS ----
const orbs = document.querySelectorAll('.orb');
const floatingCards = document.querySelectorAll('.floating-card');

document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;

    orbs.forEach((orb, index) => {
        const speed = (index + 1) * 20;
        orb.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
    });

    floatingCards.forEach((card, index) => {
        const speed = (index + 1) * 10;
        const rotate = x * 3;
        card.style.transform = `translate(${x * speed}px, ${y * speed}px) rotate(${rotate}deg)`;
    });
});

// ---- ANIMATED COUNTER FOR STATS ----
function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = start + (target - start) * eased;

        if (target % 1 !== 0) {
            element.textContent = current.toFixed(1);
        } else {
            element.textContent = Math.round(current);
        }

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    requestAnimationFrame(update);
}

// Observe stat numbers
const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const target = parseFloat(entry.target.dataset.target);
            if (!isNaN(target)) {
                animateCounter(entry.target, target);
            }
            statObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-number[data-target]').forEach(el => {
    statObserver.observe(el);
});

// ---- SMOOTH SCROLL FOR NAV LINKS ----
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ---- SHOWCASE CARD HOVER PARALLAX ----
document.querySelectorAll('.showcase-item').forEach(item => {
    item.addEventListener('mousemove', (e) => {
        const rect = item.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        const bg = item.querySelector('.showcase-bg');
        if (bg) {
            bg.style.transform = `translate(${x * 20}px, ${y * 20}px) scale(1.1)`;
        }
    });

    item.addEventListener('mouseleave', (e) => {
        const bg = item.querySelector('.showcase-bg');
        if (bg) {
            bg.style.transform = 'translate(0, 0) scale(1)';
        }
    });
});

// ---- TESTIMONIAL CARD TILT ----
document.querySelectorAll('.testimonial-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(800px) rotateX(${y * -5}deg) rotateY(${x * 5}deg) translateY(-5px)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)';
    });
});

// ---- TYPING EFFECT FOR HERO BADGE ----
const badge = document.querySelector('.hero-badge');
if (badge) {
    const originalHTML = badge.innerHTML;
    const textContent = badge.textContent.trim();
    badge.innerHTML = '<span class="badge-dot"></span>';
    let i = 0;
    const typeInterval = setInterval(() => {
        if (i < textContent.length) {
            badge.innerHTML = '<span class="badge-dot"></span> ' + textContent.substring(0, i + 1);
            i++;
        } else {
            clearInterval(typeInterval);
        }
    }, 40);
}

// ---- CONSOLE EASTER EGG ----
console.log('%c✨ SUPER FANCY SITE v11 ✨', 'font-size: 24px; color: #8b5cf6; font-weight: bold; text-shadow: 0 0 10px #8b5cf6;');
console.log('%c🎨 Fanciness Level: MAXIMUM', 'font-size: 14px; color: #06b6d4;');
console.log('%c🚀 Performance Mode: LUDICROUS', 'font-size: 14px; color: #f472b6;');
console.log('%c💎 Boring Pixels Found: 0', 'font-size: 14px; color: #34d399;');



// ============================================
// PAGE ELEMENT PERSISTENCE - Element_Store
// ============================================

const ElementStore = (() => {
    const STORAGE_KEY = 'superfancy_page_elements';

    /**
     * Check if localStorage is accessible.
     * @returns {boolean}
     */
    function isAvailable() {
        try {
            const testKey = '__storage_test__';
            localStorage.setItem(testKey, '1');
            localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Validate a single Element_Descriptor against the expected schema.
     * @param {*} descriptor - The object to validate
     * @returns {boolean}
     */
    function isValidDescriptor(descriptor) {
        if (!descriptor || typeof descriptor !== 'object') return false;
        if (typeof descriptor.id !== 'string' || descriptor.id.length === 0) return false;
        if (!['text', 'image', 'separator'].includes(descriptor.type)) return false;
        if (typeof descriptor.content !== 'string') return false;
        if (!descriptor.position || typeof descriptor.position !== 'object') return false;
        if (typeof descriptor.position.x !== 'number' || typeof descriptor.position.y !== 'number') return false;
        if (!descriptor.style || typeof descriptor.style !== 'object') return false;
        if (typeof descriptor.createdAt !== 'string' || !isValidISO8601(descriptor.createdAt)) return false;
        if (typeof descriptor.updatedAt !== 'string' || !isValidISO8601(descriptor.updatedAt)) return false;
        return true;
    }

    /**
     * Check if a string is a valid ISO 8601 date string.
     * @param {string} str
     * @returns {boolean}
     */
    function isValidISO8601(str) {
        const date = new Date(str);
        return !isNaN(date.getTime());
    }

    /**
     * Serialize and save descriptors to localStorage.
     * @param {Array} descriptors - Array of Element_Descriptors
     * @returns {boolean} - true if save succeeded, false otherwise
     */
    function save(descriptors) {
        if (!isAvailable()) return false;
        try {
            const json = JSON.stringify(descriptors);
            localStorage.setItem(STORAGE_KEY, json);
            return true;
        } catch (e) {
            console.warn('[ElementStore] Save failed:', e.message);
            return false;
        }
    }

    /**
     * Read, parse, and validate stored descriptors from localStorage.
     * @returns {Array} - Array of valid Element_Descriptors (empty array on failure)
     */
    function load() {
        if (!isAvailable()) return [];
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) {
                console.warn('[ElementStore] Stored data is not an array. Discarding.');
                return [];
            }
            const valid = [];
            for (const descriptor of parsed) {
                if (isValidDescriptor(descriptor)) {
                    valid.push(descriptor);
                } else {
                    console.warn('[ElementStore] Skipping invalid descriptor:', descriptor);
                }
            }
            return valid;
        } catch (e) {
            console.warn('[ElementStore] Failed to parse stored data:', e.message);
            return [];
        }
    }

    /**
     * Remove all stored element data from localStorage.
     */
    function clear() {
        if (!isAvailable()) return;
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (e) {
            console.warn('[ElementStore] Clear failed:', e.message);
        }
    }

    return {
        isAvailable,
        save,
        load,
        clear,
        isValidDescriptor,
        STORAGE_KEY
    };
})();



// ============================================
// PAGE ELEMENT PERSISTENCE - Element_Manager
// ============================================

const ElementManager = (() => {
    let descriptors = [];
    let container = null;

    /**
     * Generate a unique ID.
     * Uses crypto.randomUUID() with fallback.
     * @returns {string}
     */
    function generateId() {
        if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
            return crypto.randomUUID();
        }
        // Fallback for older browsers
        return Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Initialize the Element_Manager.
     * Loads descriptors from store and restores elements.
     */
    function init() {
        container = document.getElementById('pageElementsContainer');
        if (!container) return;

        if (!ElementStore.isAvailable()) {
            showStorageWarning('Local storage is unavailable. Your customizations will not be saved.');
            return;
        }

        descriptors = ElementStore.load();
        restoreElements(descriptors);
    }

    /**
     * Create a new element of the given type.
     * @param {string} type - 'text', 'image', or 'separator'
     * @returns {object} - The created Element_Descriptor
     */
    function createElement(type) {
        const now = new Date().toISOString();
        const descriptor = {
            id: generateId(),
            type: type,
            content: type === 'text' ? 'Double-click to edit' : '',
            position: {
                x: Math.min(200 + Math.random() * 200, window.innerWidth - 250),
                y: Math.min(200 + Math.random() * 200, window.innerHeight - 200)
            },
            style: { width: null, height: null },
            createdAt: now,
            updatedAt: now
        };

        descriptors.push(descriptor);
        const saved = ElementStore.save(descriptors);
        if (!saved && ElementStore.isAvailable()) {
            showStorageWarning('Changes cannot be saved — storage is full.');
        }
        renderElement(descriptor);
        return descriptor;
    }

    /**
     * Update an element descriptor by ID.
     * @param {string} id - Element ID
     * @param {object} changes - Partial descriptor changes
     */
    function updateElement(id, changes) {
        const index = descriptors.findIndex(d => d.id === id);
        if (index === -1) return;

        Object.assign(descriptors[index], changes);
        descriptors[index].updatedAt = new Date().toISOString();
        const saved = ElementStore.save(descriptors);
        if (!saved && ElementStore.isAvailable()) {
            showStorageWarning('Changes cannot be saved — storage is full.');
        }
    }

    /**
     * Delete an element by ID.
     * @param {string} id - Element ID
     */
    function deleteElement(id) {
        descriptors = descriptors.filter(d => d.id !== id);
        ElementStore.save(descriptors);
    }

    /**
     * Get all current descriptors.
     * @returns {Array}
     */
    function getAllDescriptors() {
        return descriptors;
    }

    /**
     * Restore elements from descriptor array to DOM.
     * @param {Array} descs - Array of Element_Descriptors
     */
    function restoreElements(descs) {
        if (!container) return;
        descs.forEach(descriptor => renderElement(descriptor));
    }

    /**
     * Render a single element to the DOM.
     * @param {object} descriptor - Element_Descriptor
     */
    function renderElement(descriptor) {
        if (!container) return;

        const el = document.createElement('div');
        el.className = 'page-element';
        el.dataset.elementId = descriptor.id;
        el.dataset.elementType = descriptor.type;
        el.style.left = descriptor.position.x + 'px';
        el.style.top = descriptor.position.y + 'px';

        // Controls (delete button)
        const controls = document.createElement('div');
        controls.className = 'page-element-controls';
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'page-element-delete';
        deleteBtn.setAttribute('aria-label', 'Delete element');
        deleteBtn.textContent = '\u00D7';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteElement(descriptor.id);
            el.remove();
        });
        controls.appendChild(deleteBtn);
        el.appendChild(controls);

        // Content area
        const content = document.createElement('div');
        content.className = 'page-element-content';

        switch (descriptor.type) {
            case 'text':
                content.textContent = descriptor.content || 'Double-click to edit';
                // Double-click to edit
                el.addEventListener('dblclick', (e) => {
                    e.stopPropagation();
                    activateTextEdit(el, content, descriptor.id);
                });
                break;

            case 'image':
                if (descriptor.content) {
                    const img = document.createElement('img');
                    img.src = descriptor.content;
                    img.alt = 'User image';
                    img.addEventListener('error', () => {
                        img.style.display = 'none';
                        const placeholder = document.createElement('div');
                        placeholder.className = 'image-placeholder';
                        placeholder.textContent = 'Image not found';
                        content.appendChild(placeholder);
                    });
                    content.appendChild(img);
                } else {
                    const placeholder = document.createElement('div');
                    placeholder.className = 'image-placeholder';
                    placeholder.textContent = 'Double-click to set image URL';
                    content.appendChild(placeholder);
                }
                // Double-click to edit URL
                el.addEventListener('dblclick', (e) => {
                    e.stopPropagation();
                    activateImageEdit(el, content, descriptor.id);
                });
                break;

            case 'separator':
                const hr = document.createElement('hr');
                content.appendChild(hr);
                break;
        }

        el.appendChild(content);

        // Drag-and-drop via pointer events
        setupDrag(el, descriptor.id);

        container.appendChild(el);
    }

    /**
     * Activate inline text editing.
     */
    function activateTextEdit(el, contentDiv, id) {
        if (contentDiv.getAttribute('contenteditable') === 'true') return;

        contentDiv.setAttribute('contenteditable', 'true');
        contentDiv.focus();
        el.style.cursor = 'text';

        // Select all text
        const range = document.createRange();
        range.selectNodeContents(contentDiv);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);

        function finishEdit() {
            contentDiv.setAttribute('contenteditable', 'false');
            el.style.cursor = 'grab';
            const newContent = contentDiv.textContent.trim() || 'Double-click to edit';
            contentDiv.textContent = newContent;
            updateElement(id, { content: newContent });
            contentDiv.removeEventListener('blur', finishEdit);
            contentDiv.removeEventListener('keydown', handleKey);
        }

        function handleKey(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                contentDiv.blur();
            }
        }

        contentDiv.addEventListener('blur', finishEdit);
        contentDiv.addEventListener('keydown', handleKey);
    }

    /**
     * Activate image URL editing.
     */
    function activateImageEdit(el, contentDiv, id) {
        // Don't open another input if one already exists
        if (el.querySelector('.page-element-url-input')) return;

        const inputContainer = document.createElement('div');
        inputContainer.className = 'page-element-url-input';

        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Enter image URL...';
        const currentDescriptor = descriptors.find(d => d.id === id);
        if (currentDescriptor && currentDescriptor.content) {
            input.value = currentDescriptor.content;
        }

        const confirmBtn = document.createElement('button');
        confirmBtn.textContent = 'Set';

        function applyUrl() {
            const url = input.value.trim();
            if (url) {
                updateElement(id, { content: url });
                // Re-render content
                contentDiv.innerHTML = '';
                const img = document.createElement('img');
                img.src = url;
                img.alt = 'User image';
                img.addEventListener('error', () => {
                    img.style.display = 'none';
                    const placeholder = document.createElement('div');
                    placeholder.className = 'image-placeholder';
                    placeholder.textContent = 'Image not found';
                    contentDiv.appendChild(placeholder);
                });
                contentDiv.appendChild(img);
            }
            inputContainer.remove();
        }

        confirmBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            applyUrl();
        });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                applyUrl();
            }
        });

        inputContainer.appendChild(input);
        inputContainer.appendChild(confirmBtn);
        el.appendChild(inputContainer);
        input.focus();
    }

    /**
     * Setup drag-and-drop via pointer events.
     */
    function setupDrag(el, id) {
        let isDragging = false;
        let offsetX = 0;
        let offsetY = 0;

        el.addEventListener('pointerdown', (e) => {
            // Don't drag if interacting with controls, editing, or input
            if (e.target.closest('.page-element-delete') ||
                e.target.closest('.page-element-url-input') ||
                e.target.getAttribute('contenteditable') === 'true') {
                return;
            }

            isDragging = true;
            offsetX = e.clientX - el.offsetLeft;
            offsetY = e.clientY - el.offsetTop;
            el.classList.add('dragging');
            el.setPointerCapture(e.pointerId);
            e.preventDefault();
        });

        el.addEventListener('pointermove', (e) => {
            if (!isDragging) return;

            let newX = e.clientX - offsetX;
            let newY = e.clientY - offsetY;

            // Clamp to viewport boundaries
            newX = Math.max(0, Math.min(newX, window.innerWidth - el.offsetWidth));
            newY = Math.max(0, Math.min(newY, window.innerHeight - el.offsetHeight));

            el.style.left = newX + 'px';
            el.style.top = newY + 'px';
        });

        el.addEventListener('pointerup', (e) => {
            if (!isDragging) return;
            isDragging = false;
            el.classList.remove('dragging');
            el.releasePointerCapture(e.pointerId);

            const newX = parseInt(el.style.left, 10);
            const newY = parseInt(el.style.top, 10);
            updateElement(id, { position: { x: newX, y: newY } });
        });
    }

    /**
     * Show storage warning banner.
     * @param {string} message
     */
    function showStorageWarning(message) {
        let banner = document.querySelector('.storage-warning');
        if (!banner) {
            banner = document.createElement('div');
            banner.className = 'storage-warning';
            document.body.prepend(banner);
        }
        banner.textContent = message;
        requestAnimationFrame(() => banner.classList.add('visible'));

        // Auto-hide after 5 seconds
        setTimeout(() => {
            banner.classList.remove('visible');
        }, 5000);
    }

    return {
        init,
        createElement,
        updateElement,
        deleteElement,
        getAllDescriptors,
        restoreElements,
        generateId
    };
})();

// ============================================
// PAGE ELEMENT PERSISTENCE - Element_Toolbar
// ============================================

const ElementToolbar = (() => {
    /**
     * Initialize toolbar with click handlers.
     * @param {string} containerSelector - CSS selector for toolbar container
     */
    function init(containerSelector) {
        const toolbar = document.querySelector(containerSelector || '#elementToolbar');
        if (!toolbar) return;

        const buttons = toolbar.querySelectorAll('.toolbar-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.dataset.elementType;
                if (type) {
                    ElementManager.createElement(type);
                }
            });
        });
    }

    /**
     * Get available element types.
     * @returns {string[]}
     */
    function getAvailableTypes() {
        return ['text', 'image', 'separator'];
    }

    return {
        init,
        getAvailableTypes
    };
})();

// ============================================
// PAGE ELEMENT PERSISTENCE - Page Load Init
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    ElementToolbar.init('#elementToolbar');
    ElementManager.init();
});
