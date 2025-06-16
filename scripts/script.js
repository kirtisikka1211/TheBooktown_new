// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('nav');
    
    if (mobileMenuBtn && nav) {
        mobileMenuBtn.addEventListener('click', function() {
            nav.classList.toggle('active');
        });
    }

    // Testimonial Slider
    const testimonials = document.querySelectorAll('.testimonial');
    if (testimonials.length > 0) {
        let currentTestimonial = 0;
        
        function showTestimonial(index) {
            testimonials.forEach(testimonial => {
                testimonial.classList.remove('active');
            });
            testimonials[index].classList.add('active');
        }
        
        // Auto-rotate testimonials every 5 seconds
        setInterval(() => {
            currentTestimonial = (currentTestimonial + 1) % testimonials.length;
            showTestimonial(currentTestimonial);
        }, 5000);
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Active link highlighting based on scroll position
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('nav ul li a');
    
    window.addEventListener('scroll', function() {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (pageYOffset >= (sectionTop - 100)) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    // Dashboard Navigation
    const dashboardLinks = document.querySelectorAll('.dashboard-nav a');
    const dashboardSections = document.querySelectorAll('.dashboard-section');
    
    function switchSection(sectionId) {
        // Hide all sections
        dashboardSections.forEach(section => {
            section.classList.remove('active');
        });
        
        // Remove active class from all links
        dashboardLinks.forEach(link => {
            link.classList.remove('active');
        });
        
        // Show selected section and activate corresponding link
        const targetSection = document.getElementById(sectionId);
        const targetLink = document.querySelector(`.dashboard-nav a[href="#${sectionId}"]`);
        
        if (targetSection) {
            targetSection.classList.add('active');
        }
        if (targetLink) {
            targetLink.classList.add('active');
        }
    }
    
    // Add click event listeners to navigation links
    dashboardLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('href').substring(1);
            switchSection(sectionId);
        });
    });
    
    // Handle initial section based on URL hash
    const initialSection = window.location.hash.substring(1) || 'donations';
    switchSection(initialSection);
});

// Form Validation for Contact Page
function validateContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = form.querySelector('input[name="name"]').value.trim();
        const email = form.querySelector('input[name="email"]').value.trim();
        const message = form.querySelector('textarea[name="message"]').value.trim();
        
        if (!name || !email || !message) {
            alert('Please fill in all fields');
            return;
        }
        
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            alert('Please enter a valid email address');
            return;
        }
        
        // Form is valid - in a real app, you would send this data to your server
        alert('Thank you for your message! We will get back to you soon.');
        form.reset();
    });
}

// Initialize form validation when DOM is loaded
document.addEventListener('DOMContentLoaded', validateContactForm);

// Form Validation for Signup Page
function validateSignupForm() {
    const form = document.getElementById('signup-form');
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const fullName = form.querySelector('input[name="fullname"]').value;
        const email = form.querySelector('input[name="email"]').value;
        const username = form.querySelector('input[name="username"]').value;
        const password = form.querySelector('input[name="password"]').value;
        const confirmPassword = form.querySelector('input[name="confirm-password"]').value;
        
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        
        if (!form.querySelector('input[name="terms"]').checked) {
            alert('You must agree to the terms and conditions');
            return;
        }
        
        try {
            const response = await fetch('http://localhost:3000/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password,
                    fullName,
                    username
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                alert('Registration successful! Please check your email to verify your account.');
                window.location.href = 'login.html';
            } else {
                alert(data.error || 'Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('An error occurred during registration. Please try again.');
        }
    });
}

// Login Form Handling
function handleLoginForm() {
    const form = document.getElementById('login-form');
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = form.querySelector('input[name="email"]').value;
        const password = form.querySelector('input[name="password"]').value;
        
        try {
            const response = await fetch('/api/auth/signin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Update UI to show authenticated state
                updateAuthUI(true, data.user);
                // Redirect to dashboard
                window.location.href = 'dashboard.html';
            } else {
                alert(data.error || 'Login failed. Please try again.');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('An error occurred during login. Please try again.');
        }
    });
}

// Initialize all form validations when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    validateContactForm();
    validateSignupForm();
    handleLoginForm();
    
    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('nav');
    
    if (mobileMenuBtn && nav) {
        mobileMenuBtn.addEventListener('click', function() {
            nav.classList.toggle('active');
        });
    }
});

// Authentication State Management
function updateAuthUI(isAuthenticated, userData = null) {
    const unauthButtons = document.querySelector('.unauth-buttons');
    const authUser = document.querySelector('.auth-user');
    const authRequired = document.querySelectorAll('.auth-required');
    const userMenu = document.querySelector('.user-menu');
    
    if (!unauthButtons || !authUser) return; // Exit if elements don't exist
    
    if (isAuthenticated && userData) {
        // User is logged in
        unauthButtons.style.display = 'none';
        authUser.style.display = 'block';
        
        const userName = authUser.querySelector('.user-name');
        if (userName) {
            userName.textContent = userData.username || 'User';
        }
        
        if (authRequired) {
            authRequired.forEach(el => {
                if (el) el.style.display = 'block';
            });
        }
        
        if (userMenu) {
            const adminLink = userMenu.querySelector('#admin-link');
            if (adminLink) {
                adminLink.style.display = userData.role === 'admin' ? 'block' : 'none';
            }
        }
    } else {
        // User is not logged in
        unauthButtons.style.display = 'flex';
        authUser.style.display = 'none';
        
        if (authRequired) {
            authRequired.forEach(el => {
                if (el) el.style.display = 'none';
            });
        }
    }
}

async function checkAuthStatus() {
    try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        
        if (token && user) {
            updateAuthUI(true, user);
        } else {
            updateAuthUI(false);
        }
    } catch (error) {
        console.error('Error checking auth status:', error);
        updateAuthUI(false);
    }
}

// Initialize auth check when DOM is loaded
document.addEventListener('DOMContentLoaded', checkAuthStatus);

// Handle logout
document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            try {
                const response = await fetch('/api/auth/logout', {
                    method: 'POST',
                    credentials: 'include'
                });
                
                if (response.ok) {
                    updateAuthUI(false);
                    window.location.href = '/index.html';
                }
            } catch (error) {
                console.error('Error logging out:', error);
            }
        });
    }

    // Mobile menu for user dropdown
    const userMenuBtn = document.querySelector('.user-menu-btn');
    if (userMenuBtn) {
        userMenuBtn.addEventListener('click', function() {
            const userMenu = this.closest('.user-menu');
            userMenu.classList.toggle('active');
        });
    }
});