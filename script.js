const deck = document.getElementById('deck');
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.nav-dot');

// Smooth scroll to slide
function scrollToSlide(index) {
    slides[index].scrollIntoView({ behavior: 'smooth' });
}

// Update dots on scroll
const observerOptions = {
    threshold: 0.5
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Find index of intersecting slide
            const index = Array.from(slides).indexOf(entry.target);
            
            // Update dots
            dots.forEach(dot => dot.classList.remove('active'));
            dots[index].classList.add('active');
            
            // Trigger animation class
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

slides.forEach(slide => observer.observe(slide));

// Additional interactivity: Key presses for navigation
document.addEventListener('keydown', (e) => {
    const activeDot = document.querySelector('.nav-dot.active');
    let currentIndex = Array.from(dots).indexOf(activeDot);

    if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === ' ') {
        if (currentIndex < slides.length - 1) {
            scrollToSlide(currentIndex + 1);
        }
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        if (currentIndex > 0) {
            scrollToSlide(currentIndex - 1);
        }
    }
});

// Animate bars on the market slide when it becomes visible
const marketSlide = slides[6]; // 7th slide (0-indexed)
const marketObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
        const bars = entries[0].target.querySelectorAll('.bar');
        bars.forEach((bar, i) => {
            // Heights are predefined in HTML style but we can toggle them if needed
            // For now, let's just re-trigger the CSS transition if we had one
        });
    }
}, observerOptions);

if (marketSlide) marketObserver.observe(marketSlide);

// Dark Mode Toggle
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle.querySelector('i');

// Check for saved theme
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    themeIcon.classList.replace('fa-moon', 'fa-sun');
}

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    
    // Update icon
    if (isDark) {
        themeIcon.classList.replace('fa-moon', 'fa-sun');
        localStorage.setItem('theme', 'dark');
    } else {
        themeIcon.classList.replace('fa-sun', 'fa-moon');
        localStorage.setItem('theme', 'light');
    }
});

// Mobile Menu Logic
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const navLinks = document.getElementById('nav-links');

mobileMenuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    const icon = mobileMenuToggle.querySelector('i');
    if (navLinks.classList.contains('active')) {
        icon.classList.replace('fa-bars', 'fa-times');
    } else {
        icon.classList.replace('fa-times', 'fa-bars');
    }
});

function closeMenu() {
    navLinks.classList.remove('active');
    mobileMenuToggle.querySelector('i').classList.replace('fa-times', 'fa-bars');
}
