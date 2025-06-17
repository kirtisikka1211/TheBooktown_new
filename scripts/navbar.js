document.addEventListener('DOMContentLoaded', () => {
    // Load navbar
    const navbarContainer = document.getElementById('navbar-container');
    if (navbarContainer) {
        fetch('/components/navbar.html')
            .then(response => response.text())
            .then(html => {
                navbarContainer.innerHTML = html;
                updateAuthState();
                initializeMobileMenu();
            })
            .catch(error => console.error('Error loading navbar:', error));
    }

    // Handle logout
    document.addEventListener('click', (e) => {
        if (e.target.closest('#logout-btn') || e.target.closest('#mobile-logout-btn')) {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/pages/login.html';
        }
    });
});

function initializeMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('nav');
    
    if (mobileMenuBtn && nav) {
        const navUl = nav.querySelector('ul');
        
        // Add auth buttons to mobile menu
        if (!navUl.querySelector('.mobile-auth-buttons')) {
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user') || 'null');

            if (token && user) {
                // User is logged in
                navUl.insertAdjacentHTML('beforeend', `
                    <li><hr class="mobile-divider"></li>
                    <li><a href="dashboard.html" class="mobile-nav-link">
                        <i class="fas fa-tachometer-alt"></i> Dashboard
                    </a></li>
                    ${user.role === 'admin' ? `
                        <li><a href="../admin/pages/index.html" class="mobile-nav-link">
                            <i class="fas fa-cog"></i> Admin Panel
                        </a></li>
                    ` : ''}
                    <li><a href="#" class="mobile-nav-link mobile-logout" id="mobile-logout-btn">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </a></li>
                `);
            } else {
                // User is not logged in
                navUl.insertAdjacentHTML('beforeend', `
                    <li><hr class="mobile-divider"></li>
                    <li><a href="signup.html" class="mobile-nav-link">
                        <i class="fas fa-user-plus"></i> Sign Up
                    </a></li>
                    <li><a href="login.html" class="mobile-nav-link">
                        <i class="fas fa-sign-in-alt"></i> Login
                    </a></li>
                `);
            }
        }

        mobileMenuBtn.addEventListener('click', () => {
            nav.classList.toggle('active');
            
            // Toggle icon between bars and times
            const icon = mobileMenuBtn.querySelector('i');
            if (icon) {
                if (icon.classList.contains('fa-bars')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                } else {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('nav') && !e.target.closest('.mobile-menu-btn')) {
                nav.classList.remove('active');
                const icon = mobileMenuBtn.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });
    }
}

function updateAuthState() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    
    // Update desktop auth buttons
    const unauthButtons = document.querySelector('.unauth-buttons');
    const authUser = document.querySelector('.auth-user');
    const authRequired = document.querySelectorAll('.auth-required');
    const userMenu = document.querySelector('.user-menu');
    
    if (token && user) {
        // User is logged in
        if (unauthButtons) unauthButtons.style.display = 'none';
        if (authUser) {
            authUser.style.display = 'block';
            const userName = authUser.querySelector('.user-name');
            if (userName) userName.textContent = user.username;
        }
        if (authRequired) {
            authRequired.forEach(el => el.style.display = 'block');
        }
        if (userMenu) {
            const adminLink = userMenu.querySelector('#admin-link');
            if (adminLink) {
                adminLink.style.display = user.role === 'admin' ? 'block' : 'none';
            }
        }
    } else {
        // User is not logged in
        if (unauthButtons) unauthButtons.style.display = 'flex';
        if (authUser) authUser.style.display = 'none';
        if (authRequired) {
            authRequired.forEach(el => el.style.display = 'none');
        }
    }

    // Update mobile menu
    const nav = document.querySelector('nav');
    if (nav) {
        const navUl = nav.querySelector('ul');
        // Remove existing mobile auth buttons
        const existingButtons = navUl.querySelectorAll('.mobile-nav-link, .mobile-divider');
        existingButtons.forEach(button => button.parentElement.remove());
        // Re-add mobile auth buttons
        initializeMobileMenu();
    }
} 