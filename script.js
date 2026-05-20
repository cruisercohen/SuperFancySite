// ============================================
// SUPER FANCY SITE - Interactive Magic
// ============================================

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Stagger children animations
            const children = entry.target.querySelectorAll('.feature-card, .showcase-item, .stat-item');
            children.forEach((child, index) => {
                child.style.transitionDelay = `${index * 0.1}s`;
                child.classList.add('visible');
            });
        }
    });
}, observerOptions);

// Observe sections
document.querySelectorAll('.features, .showcase, .stats, .cta').forEach(section => {
    observer.observe(section);
});

// Add reveal styles dynamically
const style = document.createElement('style');
style.textContent = `
    .features, .showcase, .stats, .cta {
        opacity: 0;
        transform: translateY(40px);
        transition: opacity 0.8s ease, transform 0.8s ease;
    }
    .features.visible, .showcase.visible, .stats.visible, .cta.visible {
        opacity: 1;
        transform: translateY(0);
    }
    .feature-card, .showcase-item, .stat-item {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease, transform 0.6s ease, border-color 0.4s ease, background 0.4s ease;
    }
    .feature-card.visible, .showcase-item.visible, .stat-item.visible {
        opacity: 1;
        transform: translateY(0);
    }
`;
document.head.appendChild(style);

// Mouse parallax effect on hero
const hero = document.querySelector('.hero');
const orbs = document.querySelectorAll('.orb');
const floatingCards = document.querySelectorAll('.floating-card');

document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;

    orbs.forEach((orb, index) => {
        const speed = (index + 1) * 15;
        orb.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
    });

    floatingCards.forEach((card, index) => {
        const speed = (index + 1) * 8;
        card.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
    });
});

// Navbar background on scroll
const navbar = document.querySelector('.navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        navbar.style.padding = '1rem 2rem';
        navbar.style.background = 'rgba(10, 10, 15, 0.95)';
    } else {
        navbar.style.padding = '1.5rem 2rem';
        navbar.style.background = 'rgba(10, 10, 15, 0.8)';
    }

    lastScroll = currentScroll;
});

// Smooth cursor glow effect
const cursorGlow = document.createElement('div');
cursorGlow.style.cssText = `
    position: fixed;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(139, 92, 246, 0.06), transparent 70%);
    border-radius: 50%;
    pointer-events: none;
    z-index: 9999;
    transform: translate(-50%, -50%);
    transition: opacity 0.3s ease;
`;
document.body.appendChild(cursorGlow);

document.addEventListener('mousemove', (e) => {
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top = e.clientY + 'px';
});

// Feature cards tilt effect
document.querySelectorAll('.feature-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
    });
});

// Typing effect for hero badge (subtle)
const badge = document.querySelector('.hero-badge');
if (badge) {
    const text = badge.textContent;
    badge.textContent = '';
    let i = 0;
    const typeInterval = setInterval(() => {
        badge.textContent += text[i];
        i++;
        if (i >= text.length) clearInterval(typeInterval);
    }, 50);
}

// Add magnetic effect to CTA buttons
document.querySelectorAll('.btn-primary').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px) translateY(-3px)`;
    });

    btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0, 0) translateY(0)';
    });
});

console.log('%c✨ Super Fancy Site Loaded! ✨', 'font-size: 20px; color: #8b5cf6; font-weight: bold;');
console.log('%cMaking the internet prettier since 2026', 'font-size: 12px; color: #06b6d4;');
