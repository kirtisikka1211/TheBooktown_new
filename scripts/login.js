document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            if (!email || !password) {
                showToast('Please fill in all fields', 'error');
                return;
            }

            // Show loading state
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Signing In...';
            submitBtn.disabled = true;

            try {
                const response = await fetch('https://thebooktown-new-1.onrender.com/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                const result = await response.json();

                if (response.ok) {
                    showToast('Login successful!', 'success');
                    
                    // Use auth manager to set auth data
                    window.authManager.setAuth(result.token, result.user);
                    
                    // Redirect based on role
                    setTimeout(() => {
                        if (result.user.role === 'admin') {
                            window.location.href = '../admin/pages/index.html';
                        } else {
                            window.location.href = 'dashboard.html';
                        }
                    }, 1000);
                } else {
                    showToast(result.error || 'Login failed', 'error');
                }
            } catch (error) {
                console.error('Login error:', error);
                showToast('Login failed. Please try again.', 'error');
            } finally {
                // Reset button state
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // Redirect if already logged in
    if (window.authManager.isAuthenticated()) {
        const user = window.authManager.getCurrentUser();
        if (user.role === 'admin') {
            window.location.href = '../admin/pages/index.html';
        } else {
            window.location.href = 'dashboard.html';
        }
    }
});