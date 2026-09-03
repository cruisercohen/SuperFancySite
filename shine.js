// ============================================
// SUPER FANCY SITE - EXTRA SHINE LAYER ✨
// Additive interactivity layered on top of script.js.
// Injects DOM used by shine.css and adds sparkle bursts.
// ============================================

(function () {
    const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
    ).matches;

    // ---- GLOBAL TWINKLING STAR FIELD ----
    // Scatter a set of twinkling stars behind the content.
    function buildStarField() {
        const field = document.createElement('div');
        field.className = 'shine-field';

        const STAR_COUNT = prefersReducedMotion ? 24 : 70;
        for (let i = 0; i < STAR_COUNT; i++) {
            const star = document.createElement('span');
            star.className = 'shine-star';
            star.style.left = Math.random() * 100 + 'vw';
            star.style.top = Math.random() * 100 + 'vh';
            const size = Math.random() * 2 + 1;
            star.style.width = size + 'px';
            star.style.height = size + 'px';
            star.style.setProperty('--tw-dur', (Math.random() * 4 + 3).toFixed(2) + 's');
            star.style.setProperty('--tw-delay', (Math.random() * 5).toFixed(2) + 's');
            field.appendChild(star);
        }
        document.body.appendChild(field);
    }

    // ---- SHIMMER RING BORDERS ----
    // Add a .shine-ring child to each card so shine.css can
    // paint a rotating conic-gradient light around it on hover.
    function addShineRings() {
        const selectors = '.feature-card, .testimonial-card, .showcase-item';
        document.querySelectorAll(selectors).forEach((card) => {
            if (card.querySelector(':scope > .shine-ring')) return;
            const ring = document.createElement('div');
            ring.className = 'shine-ring';
            card.appendChild(ring);
        });
    }

    // ---- CLICK SPARKLE BURST ----
    // Emit a small burst of sparkles wherever the user clicks.
    function initClickSparkles() {
        if (prefersReducedMotion) return;

        document.addEventListener('click', (e) => {
            const count = 8;
            for (let i = 0; i < count; i++) {
                const sparkle = document.createElement('div');
                sparkle.className = 'click-sparkle';
                sparkle.style.left = e.clientX + 'px';
                sparkle.style.top = e.clientY + 'px';

                const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
                const distance = Math.random() * 40 + 30;
                sparkle.style.setProperty('--dx', Math.cos(angle) * distance + 'px');
                sparkle.style.setProperty('--dy', Math.sin(angle) * distance + 'px');

                document.body.appendChild(sparkle);
                sparkle.addEventListener('animationend', () => sparkle.remove());
            }
        });
    }

    function init() {
        buildStarField();
        addShineRings();
        initClickSparkles();

        console.log(
            '%c✨ SHINE LAYER ONLINE — sparkle levels nominal',
            'font-size: 14px; color: #ffe89e; font-weight: bold; text-shadow: 0 0 8px #ffe89e;'
        );
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
