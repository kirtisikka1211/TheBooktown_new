// Function to get user info from token
function getUserInfo() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error parsing token:', error);
        return null;
    }
}

// Function to update sidebar user info
function updateSidebarUserInfo() {
    const userInfo = getUserInfo();
    if (!userInfo) return;

    // Update all instances of admin info in the sidebar
    const adminInfos = document.querySelectorAll('.admin-info');
    adminInfos.forEach(info => {
        const usernameElement = info.querySelector('strong');
        const roleElement = info.querySelector('small');
        if (usernameElement) usernameElement.textContent = userInfo.username;
        if (roleElement) roleElement.textContent = userInfo.role;
    });

    // Update profile images
    const profileImages = document.querySelectorAll('.admin-profile img');
    profileImages.forEach(img => {
        // Use a default profile image if none is provided
        img.src = userInfo.profileImage || '../../assets/images/default-profile.png';
        img.alt = userInfo.username;
    });
}

// Function to check authentication
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/pages/login.html';
        return;
    }
    updateSidebarUserInfo();
}

// Function to handle sign out
function signOut() {
    localStorage.removeItem('token');
    window.location.href = '/pages/index.html';
}

// Add event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    checkAuth();

    // Add click event to logout button
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            signOut();
        });
    }
}); 