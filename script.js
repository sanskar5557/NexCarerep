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

// Switch tabs in the interactive dashboard simulator preview
function switchSimTab(type) {
    document.querySelectorAll('.sim-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.sim-screen').forEach(screen => screen.classList.remove('active'));

    if (type === 'patient') {
        const patientTab = document.querySelector('.sim-tab[onclick*="patient"]');
        if (patientTab) patientTab.classList.add('active');
        const patientScreen = document.getElementById('sim-patient');
        if (patientScreen) patientScreen.classList.add('active');
    } else {
        const doctorTab = document.querySelector('.sim-tab[onclick*="doctor"]');
        if (doctorTab) doctorTab.classList.add('active');
        const doctorScreen = document.getElementById('sim-doctor');
        if (doctorScreen) doctorScreen.classList.add('active');
    }
}

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

// ===== Auth State Management =====
function getInitials(first, last) {
    return ((first?.[0] || '') + (last?.[0] || '')).toUpperCase() || 'U';
}

function loadAuthState() {
    const loggedIn = localStorage.getItem('nexcare_logged_in') === 'true';
    const loginBtn  = document.getElementById('nav-login-btn');
    const profileBtn = document.getElementById('nav-profile-btn');

    if (loggedIn) {
        const user = JSON.parse(localStorage.getItem('nexcare_user') || '{}');
        const initials = getInitials(user.firstName, user.lastName);
        const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');

        // Show profile avatar, hide login button
        loginBtn.style.display = 'none';
        profileBtn.style.display = 'block';

        // Populate avatar initials
        document.getElementById('nav-initials').textContent = initials;

        // Populate dropdown
        document.getElementById('pd-avatar-lg').textContent = initials;
        document.getElementById('pd-name').textContent     = fullName || 'User';
        document.getElementById('pd-role').textContent     = user.role || 'Patient';
        document.getElementById('pd-email').textContent    = user.email || '—';
        document.getElementById('pd-phone').textContent    = user.phone || '—';
        document.getElementById('pd-joined').textContent   = user.joined ? 'Joined ' + user.joined : '—';

        // Point "My Dashboard" to the right page
        const dashLink = document.getElementById('pd-dashboard-link');
        if (dashLink) {
            dashLink.href = (user.role||'').toLowerCase() === 'doctor' ? 'doctor-dashboard.html' : 'patient-dashboard.html';
        }
    } else {
        loginBtn.style.display = '';
        profileBtn.style.display = 'none';
    }
}

function toggleProfileDropdown() {
    const dropdown = document.getElementById('profile-dropdown');
    dropdown.classList.toggle('open');
}

function logoutUser() {
    localStorage.removeItem('nexcare_logged_in');
    localStorage.removeItem('nexcare_user');
    // Close dropdown, swap back to login
    document.getElementById('profile-dropdown').classList.remove('open');
    loadAuthState();
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    const profileBtn = document.getElementById('nav-profile-btn');
    const dropdown   = document.getElementById('profile-dropdown');
    if (profileBtn && dropdown && !profileBtn.contains(e.target)) {
        dropdown.classList.remove('open');
    }
});

// Run on page load
loadAuthState();
