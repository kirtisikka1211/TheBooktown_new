// Auth utility functions
class AuthManager {
    constructor() {
        this.token = localStorage.getItem('token');
        this.user = JSON.parse(localStorage.getItem('user') || 'null');
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.token && !!this.user;
    }

    // Get current user
    getCurrentUser() {
        return this.user;
    }

    // Get token
    getToken() {
        return this.token;
    }

    // Set auth data
    setAuth(token, user) {
        this.token = token;
        this.user = user;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        this.updateNavbar();
    }

    // Clear auth data
    clearAuth() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.updateNavbar();
        window.location.href = '/pages/login.html';
    }

    // Update navbar based on auth state
    updateNavbar() {
        const unauthButtons = document.querySelector('.unauth-buttons');
        const authUser = document.querySelector('.auth-user');
        const authRequired = document.querySelectorAll('.auth-required');
        const userMenu = document.querySelector('.user-menu');
        
        if (!unauthButtons || !authUser) return;
        
        if (this.isAuthenticated()) {
            // User is logged in
            unauthButtons.style.display = 'none';
            authUser.style.display = 'block';
            
            const userName = authUser.querySelector('.user-name');
            if (userName) {
                userName.textContent = this.user.username || 'User';
            }
            
            if (authRequired) {
                authRequired.forEach(el => {
                    if (el) el.style.display = 'block';
                });
            }
            
            if (userMenu) {
                const adminLink = userMenu.querySelector('#admin-link');
                if (adminLink) {
                    adminLink.style.display = this.user.role === 'admin' ? 'block' : 'none';
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

    // Check auth status and update UI
    checkAuthStatus() {
        this.updateNavbar();
        return this.isAuthenticated();
    }
}

// Create global auth manager instance
window.authManager = new AuthManager();

// Initialize auth check when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authManager.checkAuthStatus();
}); 