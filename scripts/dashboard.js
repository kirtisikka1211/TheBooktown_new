// Function to fetch user's donated books
async function fetchUserDonations() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/pages/login.html';
            return;
        }

        const response = await fetch('https://thebooktown-new-1.onrender.com/api/my-books', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch donations');
        }

        const data = await response.json();
        return data.books;
    } catch (error) {
        console.error('Error fetching donations:', error);
        showToast('Error fetching your donations', 'error');
        return [];
    }
}

// Function to update dashboard statistics
function updateDashboardStats(books) {
    const totalDonated = books.length;
    const currentlyListed = books.filter(book => book.status === 'pending' || book.status === 'available').length;
    const givenAway = books.filter(book => book.status === 'approved').length;

    document.querySelector('.stat-card:nth-child(1) .number').textContent = totalDonated;
    document.querySelector('.stat-card:nth-child(2) .number').textContent = currentlyListed;
    document.querySelector('.stat-card:nth-child(3) .number').textContent = givenAway;
}

// Function to create a book card
function createBookCard(book) {
    const statusColors = {
        'pending': '#ffc107',
        'approved': '#28a745',
        'rejected': '#dc3545',
        'available': '#17a2b8'
    };

    const card = document.createElement('div');
    card.className = 'book-card';
    card.innerHTML = `
        <div class="book-cover">
            <img src="${book.image_url || '../images/default-book.jpg'}" alt="${book.title} Cover">
            <span class="status-badge" style="background-color: ${statusColors[book.status] || '#6c757d'}">
                ${book.status}
            </span>
        </div>
        <div class="book-details">
            <h3>${book.title}</h3>
            <p class="author">${book.author}</p>
            <div class="meta">
                <span><i class="fas fa-calendar"></i> ${new Date(book.created_at).toLocaleDateString()}</span>
                <span><i class="fas fa-bookmark"></i> ${book.genre}</span>
            </div>
        </div>
    `;
    return card;
}

// Function to display user's donated books
async function displayUserDonations() {
    const books = await fetchUserDonations();
    const booksGrid = document.querySelector('.books-grid');
    booksGrid.innerHTML = ''; // Clear existing content

    if (books.length === 0) {
        booksGrid.innerHTML = `
            <div class="no-books">
                <i class="fas fa-book-open" style="font-size: 3rem; color: #ddd; margin-bottom: 1rem;"></i>
                <p>You haven't donated any books yet.</p>
                <button class="btn-primary" onclick="handleNewDonation()">
                    <i class="fas fa-plus"></i> Make Your First Donation
                </button>
            </div>
        `;
        return;
    }

    updateDashboardStats(books);
    books.forEach(book => {
        booksGrid.appendChild(createBookCard(book));
    });
}

// Function to handle new donation button click
function handleNewDonation() {
    window.location.href = '/pages/donate.html';
}

// Function to show toast messages
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Show toast
    setTimeout(() => toast.classList.add('show'), 100);

    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/pages/login.html';
        return;
    }

    // Load user data and display donations
    displayUserDonations();
    loadUserRequests();
});

// Function to load user's donations
async function loadUserDonations() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/pages/login.html';
            return;
        }

        const response = await fetch('/api/books/user-donations', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Failed to fetch donations');

        const donations = await response.json();
        displayDonations(donations);
        updateStats(donations);
    } catch (error) {
        console.error('Error loading donations:', error);
        // Handle error appropriately
    }
}

// Function to load user's requests
async function loadUserRequests() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/pages/login.html';
            return;
        }

        const response = await fetch('/api/books/user-requests', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Failed to fetch requests');

        const requests = await response.json();
        displayRequests(requests);
    } catch (error) {
        console.error('Error loading requests:', error);
        // Handle error appropriately
    }
}

// Function to display donations in the grid
function displayDonations(donations) {
    const booksGrid = document.querySelector('.books-grid');
    if (!booksGrid) return;

    if (donations.length === 0) {
        booksGrid.innerHTML = `
            <div class="no-books">
                <i class="fas fa-book-open" style="font-size: 3rem; color: #ddd; margin-bottom: 1rem;"></i>
                <p>You haven't donated any books yet.</p>
                <button class="btn-primary" onclick="handleNewDonation()">
                    <i class="fas fa-plus"></i> Donate Now
                </button>
            </div>`;
        return;
    }

    booksGrid.innerHTML = donations.map(book => `
        <div class="book-card">
            <div class="book-cover">
                <img src="${book.coverImage || '../images/default-book.png'}" alt="${book.title}">
                <span class="status-badge ${getStatusClass(book.status)}">${book.status}</span>
            </div>
            <div class="book-details">
                <h3>${book.title}</h3>
                <p class="author">${book.author}</p>
                <div class="meta">
                    <span><i class="fas fa-calendar"></i> ${new Date(book.donatedAt).toLocaleDateString()}</span>
                    <span><i class="fas fa-bookmark"></i> ${book.condition}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Function to display requests
function displayRequests(requests) {
    const requestsList = document.querySelector('.requests-list');
    if (!requestsList) return;

    if (requests.length === 0) {
        requestsList.innerHTML = `
            <div class="no-books">
                <i class="fas fa-hand-holding" style="font-size: 3rem; color: #ddd; margin-bottom: 1rem;"></i>
                <p>You haven't requested any books yet.</p>
                <a href="books.html" class="btn-primary">
                    <i class="fas fa-search"></i> Browse Books
                </a>
            </div>`;
        return;
    }

    requestsList.innerHTML = requests.map(request => `
        <div class="request-card">
            <div class="request-book-cover">
                <img src="${request.book.coverImage || '../images/default-book.png'}" alt="${request.book.title}">
            </div>
            <div class="request-details">
                <h3>${request.book.title}</h3>
                <p class="author">${request.book.author}</p>
                <div class="request-meta">
                    <span><i class="fas fa-calendar"></i> Requested on ${new Date(request.requestedAt).toLocaleDateString()}</span>
                    <span><i class="fas fa-user"></i> Donor: ${request.book.donorName}</span>
                    <span class="request-status status-${request.status.toLowerCase()}">${request.status}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Function to update stats
function updateStats(donations) {
    const totalDonated = donations.length;
    const currentlyListed = donations.filter(book => book.status === 'Available').length;
    const givenAway = donations.filter(book => book.status === 'Given').length;

    document.querySelector('.stat-card:nth-child(1) .number').textContent = totalDonated;
    document.querySelector('.stat-card:nth-child(2) .number').textContent = currentlyListed;
    document.querySelector('.stat-card:nth-child(3) .number').textContent = givenAway;
}

// Helper function to get status class
function getStatusClass(status) {
    switch (status.toLowerCase()) {
        case 'available':
            return 'status-available';
        case 'pending':
            return 'status-pending';
        case 'given':
            return 'status-given';
        default:
            return '';
    }
} 