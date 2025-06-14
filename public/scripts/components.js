// Function to load HTML components
async function loadComponent(elementId, componentPath) {
    try {
        const response = await fetch(componentPath);
        const html = await response.text();
        document.getElementById(elementId).innerHTML = html;

        // If this is the navbar, set the active link
        if (elementId === 'navbar-container') {
            setActiveNavLink();
        }
    } catch (error) {
        console.error(`Error loading component ${componentPath}:`, error);
    }
}

// Function to set the active navigation link
function setActiveNavLink() {
    // Get the current page filename
    const currentPage = window.location.pathname.split('/').pop();
    
    // Get all navigation links
    const navLinks = document.querySelectorAll('#navbar-container nav ul li a');
    
    // Remove active class from all links
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    // Add active class to the current page's link
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage) {
            link.classList.add('active');
        }
    });
}

// Load components when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Load navbar
    loadComponent('navbar-container', '../components/navbar.html');
    // Load footer
    loadComponent('footer-container', '../components/footer.html');
}); 