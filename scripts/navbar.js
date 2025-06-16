document.addEventListener('DOMContentLoaded', () => {
    // Load navbar
    const navbarContainer = document.getElementById('navbar-container');
    if (navbarContainer) {
        fetch('/components/navbar.html')
            .then(response => response.text())
            .then(html => {
                navbarContainer.innerHTML = html;
                updateAuthState();
            })
            .catch(error => console.error('Error loading navbar:', error));
    }

    // Handle logout
    document.addEventListener('click', (e) => {
        if (e.target.closest('#logout-btn')) {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/pages/login.html';
        }
    });
});

function updateAuthState() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    
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
} 