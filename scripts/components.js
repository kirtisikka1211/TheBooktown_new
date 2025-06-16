// Navbar component
function loadNavbar() {
    const navbarContainer = document.getElementById('navbar-container');
    if (!navbarContainer) return;

    navbarContainer.innerHTML = `
        <header>
            <div class="container">
                <a href="index.html" class="logo">
                    <i class="fas fa-book-open" style="color: var(--primary); font-size: 2rem;"></i>
                    <span style="margin-left: 10px;">Booktown Foundation</span>
                </a>
                <nav>
                    <ul>
                        <li><a href="index.html">Home</a></li>
                        <li><a href="dashboard.html">Dashboard</a></li>
                        <li><a href="about.html">About</a></li>
                        <li><a href="ocr.html">Donate</a></li>
                        <li><a href="books.html">Books</a></li>
                        <li><a href="contact.html">Contact</a></li>
                    </ul>
                </nav>
                <div class="auth-buttons">
                    <!-- Auth buttons will be dynamically updated -->
                </div>
                <button class="mobile-menu-btn">
                    <i class="fas fa-bars"></i>
                </button>
            </div>
        </header>
    `;

    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('nav');
    
    if (mobileMenuBtn && nav) {
        mobileMenuBtn.addEventListener('click', () => {
            nav.classList.toggle('active');
        });
    }
}

// Footer component
function loadFooter() {
    const footerContainer = document.getElementById('footer-container');
    if (!footerContainer) return;

    footerContainer.innerHTML = `
        <footer>
            <div class="container">
                <div class="footer-grid">
                    <div class="footer-about">
                        <div class="logo">
                            <i class="fas fa-book-open" style="color: var(--secondary); font-size: 2rem;"></i>
                            <span style="margin-left: 10px;">Booktown Foundation</span>
                        </div>
                        <p>Connecting book lovers with those in need. Together, we're building a world where everyone has access to the joy of reading.</p>
                        <div class="social-links">
                            <a href="#"><i class="fab fa-facebook"></i></a>
                            <a href="#"><i class="fab fa-twitter"></i></a>
                            <a href="#"><i class="fab fa-instagram"></i></a>
                            <a href="#"><i class="fab fa-linkedin"></i></a>
                        </div>
                    </div>
                    <div class="footer-links">
                        <h3>Quick Links</h3>
                        <ul>
                            <li><a href="index.html">Home</a></li>
                            <li><a href="about.html">About Us</a></li>
                            <li><a href="ocr.html">Donate Books</a></li>
                            <li><a href="books.html">Browse Books</a></li>
                            <li><a href="contact.html">Contact</a></li>
                        </ul>
                    </div>
                    <div class="footer-links">
                        <h3>Support</h3>
                        <ul>
                            <li><a href="#">Help Center</a></li>
                            <li><a href="#">Privacy Policy</a></li>
                            <li><a href="#">Terms of Service</a></li>
                            <li><a href="#">FAQ</a></li>
                        </ul>
                    </div>
                    <div class="footer-contact">
                        <h3>Contact Info</h3>
                        <p><i class="fas fa-envelope"></i> info@booktownfoundation.org</p>
                        <p><i class="fas fa-phone"></i> +1 (555) 123-4567</p>
                        <p><i class="fas fa-map-marker-alt"></i> 123 Book Street, Reading City, RC 12345</p>
                    </div>
                </div>
                <div class="footer-bottom">
                    <p>&copy; 2024 The Booktown Foundation. All rights reserved.</p>
                </div>
            </div>
        </footer>
    `;
}

// Load components when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    loadNavbar();
    loadFooter();

    const navbarContainer = document.getElementById('navbar-container');
    if (navbarContainer) {
        try {
            const response = await fetch('/components/navbar.html');
            const html = await response.text();
            navbarContainer.innerHTML = html;
            
            // Initialize auth state after navbar is loaded
            if (window.authManager) {
                window.authManager.checkAuthStatus();
            }
        } catch (error) {
            console.error('Error loading navbar:', error);
        }
    }
});