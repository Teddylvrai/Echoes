// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');

if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
    });
}

// Close mobile menu on link click
document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
    });
});

// Hero Slider
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');
const prevBtn = document.getElementById('prevSlide');
const nextBtn = document.getElementById('nextSlide');
let currentSlide = 1;
const totalSlides = slides.length;

function updateSlider(slideNumber) {
    // Update slides
    slides.forEach((slide, index) => {
        slide.classList.remove('active');
        if (index + 1 === slideNumber) {
            slide.classList.add('active');
        }
    });
    
    // Update dots
    dots.forEach((dot, index) => {
        dot.classList.remove('active');
        if (index + 1 === slideNumber) {
            dot.classList.add('active');
        }
    });
    
    currentSlide = slideNumber;
}

function nextSlide() {
    let newSlide = currentSlide + 1;
    if (newSlide > totalSlides) newSlide = 1;
    updateSlider(newSlide);
}

function prevSlide() {
    let newSlide = currentSlide - 1;
    if (newSlide < 1) newSlide = totalSlides;
    updateSlider(newSlide);
}

if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', prevSlide);
    nextBtn.addEventListener('click', nextSlide);
}

// Dot click navigation
dots.forEach(dot => {
    dot.addEventListener('click', () => {
        const slideNumber = parseInt(dot.getAttribute('data-dot'));
        updateSlider(slideNumber);
    });
});

// Auto-slide every 5 seconds
let autoSlideInterval = setInterval(nextSlide, 5000);

// Pause auto-slide on hover
const slider = document.getElementById('visualSlider');
if (slider) {
    slider.addEventListener('mouseenter', () => {
        clearInterval(autoSlideInterval);
    });
    
    slider.addEventListener('mouseleave', () => {
        autoSlideInterval = setInterval(nextSlide, 5000);
    });
}

// Waitlist Form
const waitlistForm = document.getElementById('waitlistForm');
const waitlistCountSpan = document.getElementById('waitlistCount');

// Load waitlist count from localStorage (simulation)
let waitlistCount = localStorage.getItem('echoesWaitlistCount') ? 
    parseInt(localStorage.getItem('echoesWaitlistCount')) : 1247;

if (waitlistCountSpan) {
    waitlistCountSpan.textContent = waitlistCount.toLocaleString();
}

if (waitlistForm) {
    waitlistForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('waitlistEmail').value;
        
        if (email && email.includes('@')) {
            // Increment count
            waitlistCount++;
            localStorage.setItem('echoesWaitlistCount', waitlistCount);
            waitlistCountSpan.textContent = waitlistCount.toLocaleString();
            
            // Show success message
            const formContainer = waitlistForm.parentElement;
            const successMsg = document.createElement('div');
            successMsg.className = 'waitlist-success';
            successMsg.style.cssText = `
                margin-top: 1rem;
                padding: 0.75rem;
                background: rgba(16, 185, 129, 0.2);
                border: 1px solid #10b981;
                border-radius: 0.75rem;
                color: #10b981;
            `;
            successMsg.textContent = '✅ Merci ! Vous êtes inscrit sur la liste d\'attente.';
            
            // Remove any existing success message
            const existingMsg = formContainer.querySelector('.waitlist-success');
            if (existingMsg) existingMsg.remove();
            
            formContainer.appendChild(successMsg);
            waitlistForm.reset();
            
            // Remove success message after 3 seconds
            setTimeout(() => {
                successMsg.remove();
            }, 3000);
        }
    });
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Button actions
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const heroSignupBtn = document.getElementById('heroSignupBtn');
const watchDemoBtn = document.getElementById('watchDemoBtn');

if (loginBtn) {
    loginBtn.addEventListener('click', () => {
        alert('🔐 Connexion – bientôt disponible !');
    });
}

if (signupBtn) {
    signupBtn.addEventListener('click', () => {
        document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' });
    });
}

if (heroSignupBtn) {
    heroSignupBtn.addEventListener('click', () => {
        document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' });
    });
}

if (watchDemoBtn) {
    watchDemoBtn.addEventListener('click', () => {
        alert('🎥 Démo bientôt disponible – restez connectés !');
    });
}

// Animate stats on scroll
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumber = entry.target;
            const target = parseInt(statNumber.getAttribute('data-target'));
            if (target && !statNumber.classList.contains('animated')) {
                animateNumber(statNumber, target);
                statNumber.classList.add('animated');
            }
        }
    });
}, { threshold: 0.5 });

function animateNumber(element, target) {
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target.toLocaleString();
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current).toLocaleString();
        }
    }, 20);
}

// Add data-target to waitlist count if needed
if (waitlistCountSpan) {
    const currentCount = parseInt(waitlistCountSpan.textContent.replace(/,/g, ''));
    waitlistCountSpan.setAttribute('data-target', currentCount);
    statsObserver.observe(waitlistCountSpan);
}

// Parallax effect on hero (optional)
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.3}px)`;
        hero.style.opacity = 1 - scrolled * 0.002;
    }
});