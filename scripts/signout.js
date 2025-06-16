// signout.js - handles sign out for admin sidebar
function signOut() {
    // Remove tokens or any session info (localStorage/sessionStorage)
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    // Redirect to index.html
    window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', function() {
    const signoutBtn = document.getElementById('sidebar-signout-btn');
    if (signoutBtn) {
        signoutBtn.addEventListener('click', signOut);
    }
});
