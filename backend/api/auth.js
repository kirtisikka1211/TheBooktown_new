// Authentication utility functions
class AuthManager {
    constructor() {
        this.token = localStorage.getItem('authToken');
        this.user = JSON.parse(localStorage.getItem('user') || 'null');
        this.baseURL = 'https://thebooktown-new-1.onrender.com/api';
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.token && !!this.user;
    }

    // Check if user is admin
    isAdmin() {
        return this.user && this.user.role === 'admin';
    }

    // Get current user
    getCurrentUser() {
        return this.user;
    }

    // Set authentication data
    setAuth(token, user) {
        this.token = token;
        this.user = user;
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));
        this.updateNavbar();
    }

    // Clear authentication data
    clearAuth() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        this.updateNavbar();
    }

    // Get authorization headers
    getAuthHeaders() {
        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        };
    }

    // Update navbar based on auth state
    updateNavbar() {
        const authButtons = document.querySelector('.auth-buttons');
        const unauthButtons = document.querySelector('.unauth-buttons');
        const authUser = document.querySelector('.auth-user');

        if (!authButtons) return;

        if (this.isAuthenticated()) {
            // Hide unauth buttons, show user info
            if (unauthButtons) unauthButtons.style.display = 'none';
            
            if (!authUser) {
                // Create user menu
                const userMenu = document.createElement('div');
                userMenu.className = 'auth-user user-menu';
                userMenu.innerHTML = `
                    <button class="user-menu-btn">
                        <img src="https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=100" 
                             alt="User Avatar" class="user-avatar">
                        <span class="user-name">${this.user.username}</span>
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    <div class="user-dropdown">
                        <a href="#" id="dashboard-link">
                            <i class="fas fa-tachometer-alt"></i>
                            Dashboard
                        </a>
                        <a href="#" id="profile-link">
                            <i class="fas fa-user"></i>
                            Profile
                        </a>
                        ${this.isAdmin() ? `
                            <a href="#" id="admin-link">
                                <i class="fas fa-cog"></i>
                                Admin Panel
                            </a>
                        ` : ''}
                        <a href="#" id="logout-btn">
                            <i class="fas fa-sign-out-alt"></i>
                            Logout
                        </a>
                    </div>
                `;
                authButtons.appendChild(userMenu);

                // Add logout functionality
                document.getElementById('logout-btn').addEventListener('click', (e) => {
                    e.preventDefault();
                    this.logout();
                });

                // Add role indicator
                if (this.isAdmin()) {
                    const roleIndicator = document.createElement('span');
                    roleIndicator.className = 'logged-in-info';
                    roleIndicator.textContent = '(Admin)';
                    userMenu.querySelector('.user-name').appendChild(roleIndicator);
                }
            }
        } else {
            // Show unauth buttons, hide user info
            if (authUser) authUser.remove();
            
            if (!unauthButtons) {
                // Create unauth buttons
                const unauthDiv = document.createElement('div');
                unauthDiv.className = 'unauth-buttons';
                unauthDiv.innerHTML = `
                    <a href="signup.html" class="btn btn-outline">Sign Up</a>
                    <a href="login.html" class="btn btn-primary">Login</a>
                `;
                authButtons.appendChild(unauthDiv);
            } else {
                unauthButtons.style.display = 'flex';
            }
        }
    }

    // Login function
    async login(email, password) {
        try {
            const response = await fetch(`${this.baseURL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            this.setAuth(data.token, data.user);
            return { success: true, user: data.user };

        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        }
    }

    // Signup function
    async signup(username, email, password, role = 'user') {
        try {
            const response = await fetch(`${this.baseURL}/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password, role })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Signup failed');
            }

            this.setAuth(data.token, data.user);
            return { success: true, user: data.user };

        } catch (error) {
            console.error('Signup error:', error);
            return { success: false, error: error.message };
        }
    }

    // Logout function
    logout() {
        this.clearAuth();
        window.location.href = 'index.html';
    }

    // Make authenticated API request
    async apiRequest(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                ...options,
                headers: {
                    ...this.getAuthHeaders(),
                    ...options.headers
                }
            });

            if (response.status === 401) {
                this.logout();
                return null;
            }

            return await response.json();

        } catch (error) {
            console.error('API request error:', error);
            throw error;
        }
    }
}

// Create global auth manager instance
window.authManager = new AuthManager();

// Show toast notifications
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Initialize auth state on page load
document.addEventListener('DOMContentLoaded', () => {
    window.authManager.updateNavbar();
});