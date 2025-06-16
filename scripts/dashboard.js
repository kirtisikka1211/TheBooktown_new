// Function to fetch user's donated books
async function fetchUserDonations() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/pages/login.html';
            return;
        }

        const response = await fetch('http://localhost:3001/api/my-books', {
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
}); 