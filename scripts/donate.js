document.addEventListener('DOMContentLoaded', () => {
    // Get the donate button
    const donateButton = document.querySelector('.donate-content .btn');
    const donateText = document.querySelector('.donate-content p:nth-of-type(2)');

    // Check authentication status
    if (window.authManager.isAuthenticated()) {
        // User is logged in
        if (donateButton) {
            donateButton.textContent = 'Donate Now';
            donateButton.href = 'ocr.html';
        }
        if (donateText) {
            donateText.textContent = 'Ready to donate? Click the button below to start the donation process.';
        }
    } else {
        // User is not logged in
        if (donateButton) {
            donateButton.textContent = 'Login to Donate';
            donateButton.href = 'login.html';
        }
        if (donateText) {
            donateText.textContent = 'Please login to fill the donation form and schedule a pickup or drop-off.';
        }
    }
}); 