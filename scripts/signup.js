document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');

    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const username = document.getElementById('username').value;
            const fullname = document.getElementById('fullname').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const role = document.getElementById('role')?.value || 'user';
            const termsAccepted = document.getElementById('terms').checked;

            // Validation
            if (!username || !fullname || !email || !password || !confirmPassword) {
                showToast('Please fill in all fields', 'error');
                return;
            }

            if (password !== confirmPassword) {
                showToast('Passwords do not match', 'error');
                return;
            }

            if (password.length < 6) {
                showToast('Password must be at least 6 characters long', 'error');
                return;
            }

            if (!termsAccepted) {
                showToast('Please accept the terms of service', 'error');
                return;
            }

            // Show loading state
            const submitBtn = signupForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Creating Account...';
            submitBtn.disabled = true;

            try {
                const response = await fetch('http://localhost:3001/api/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username,
                        fullname,
                        email,
                        password,
                        role
                    })
                });

                const result = await response.json();

                if (response.ok) {
                    showToast('Account created successfully!', 'success');
                    
                    // Store the token and user info
                    localStorage.setItem('authToken', result.token);
                    localStorage.setItem('user', JSON.stringify(result.user));
                    
                    // Redirect based on role
                    setTimeout(() => {
                        if (result.user.role === 'admin') {
                            window.location.href = '../admin/pages/index.html';
                        } else {
                            window.location.href = 'dashboard.html';
                        }
                    }, 1000);
                } else {
                    showToast(result.error || 'Signup failed', 'error');
                }
            } catch (error) {
                console.error('Signup error:', error);
                showToast('Signup failed. Please try again.', 'error');
            } finally {
                // Reset button state
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // Redirect if already logged in
    const token = localStorage.getItem('authToken');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    
    if (token && user) {
        if (user.role === 'admin') {
            window.location.href = '../admin/pages/index.html';
        } else {
            window.location.href = 'dashboard.html';
        }
    }
});