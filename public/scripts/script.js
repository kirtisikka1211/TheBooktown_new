// Mobile Menu Toggle
// Login form handling
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
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
            // Store user data in localStorage
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Show success message with role
            const role = data.user.role;
            const successMessage = role === 'admin' 
                ? `Successfully logged in as Administrator` 
                : `Successfully logged in as User`;
            
            // Create a toast notification
            const toast = document.createElement('div');
            toast.className = 'toast success';
            toast.textContent = successMessage;
            document.body.appendChild(toast);
            
            // Remove toast after 3 seconds
            setTimeout(() => {
                toast.remove();
            }, 3000);
            
            // Redirect based on role
            const redirectTo = role === 'admin' 
                ? '/admin/dashboard.html' 
                : '/user/dashboard.html';
            
            // Update user interface
            updateAuthUI(true, data.user);
            
            // Redirect after a short delay to ensure UI updates
            setTimeout(() => {
                window.location.href = redirectTo;
            }, 1000);
        } else {
            // Create error toast
            const toast = document.createElement('div');
            toast.className = 'toast error';
            toast.textContent = data.error || 'Login failed';
            document.body.appendChild(toast);
            
            // Remove toast after 3 seconds
            setTimeout(() => {
                toast.remove();
            }, 3000);
        }
    } catch (error) {
        console.error('Login error:', error);
        // Create error toast
        const toast = document.createElement('div');
        toast.className = 'toast error';
        toast.textContent = 'An error occurred during login';
        document.body.appendChild(toast);
        
        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Add event listener to login form
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
}

document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('nav');
    
    mobileMenuBtn.addEventListener('click', function() {
        nav.classList.toggle('active');
    });

    // Testimonial Slider
    const testimonials = document.querySelectorAll('.testimonial');
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
        const role = form.querySelector('select[name="role"]').value;
        
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
                    username,
                    role // Now this variable is defined
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
                // window.location.href = 'dashboard.html'; // Removed manual redirect
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
    const userName = document.querySelector('.user-name');
    const loggedInInfo = document.querySelector('.logged-in-info');
    const dashboardLink = document.querySelector('.dashboard-link');

    if (isAuthenticated && userData) {
        // Update UI elements
        if (unauthButtons) unauthButtons.style.display = 'none';
        if (authUser) authUser.style.display = 'flex';
        
        // Show user name and role
        if (userName) userName.textContent = userData.fullName || userData.username || userData.email || 'User';
        if (loggedInInfo) loggedInInfo.textContent = userData.role === 'admin' ? '(Admin)' : '(User)';
        if (dashboardLink) dashboardLink.href = userData.role === 'admin' ? '/admin/pages/index.html' : '/pages/dashboard.html';

        // If on login or signup page, redirect to correct dashboard
        if (window.location.pathname.includes('login.html') || 
            window.location.pathname.includes('signup.html')) {
            window.location.href = userData.role === 'admin' 
                ? '/admin/pages/index.html' 
                : '/pages/dashboard.html';
        }
    } else {
        if (unauthButtons) unauthButtons.style.display = 'flex';
        if (authUser) authUser.style.display = 'none';
        if (userName) userName.textContent = '';
        if (loggedInInfo) loggedInInfo.textContent = '';
    }
    // Always update dashboard link for role
    if (dashboardLink && userData && userData.role) {
        dashboardLink.href = userData.role === 'admin' ? '/admin/pages/index.html' : '/pages/dashboard.html';
    }
}

// Check authentication status and redirect if needed
async function checkAuthStatus() {
    try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();
        
        if (data.authenticated) {
            // Redirect if user is on wrong dashboard
            const isAdminPath = window.location.pathname.includes('/admin');
            const isUserPath = window.location.pathname.includes('/dashboard');
            
            if (isAdminPath && data.user.role !== 'admin') {
                window.location.href = '/pages/dashboard.html';
            } else if (isUserPath && data.user.role === 'admin') {
                window.location.href = '/admin/pages/index.html';
            }
            
            updateAuthUI(true, data.user);
        } else {
            updateAuthUI(false);
        }
    } catch (error) {
        console.error('Error checking auth status:', error);
        updateAuthUI(false);
    }
}

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

    // User menu toggle (if you have a user menu button)
    const userMenuBtn = document.querySelector('.user-menu-btn');
    if (userMenuBtn) {
        userMenuBtn.addEventListener('click', function() {
            const userMenu = this.closest('.user-menu');
            if (userMenu) {
                userMenu.classList.toggle('active');
            }
        });
    }

    // Check auth status when page loads
    checkAuthStatus();
});