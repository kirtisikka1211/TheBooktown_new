// Function to fetch pending books
async function fetchPendingBooks() {
    try {
        const response = await fetch('http://localhost:3001/api/books/pending', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch books');
        }

        const data = await response.json();
        return data.books;
    } catch (error) {
        console.error('Error fetching books:', error);
        showToast('Error loading books', 'error');
        return [];
    }
}

// Function to create a book card
function createBookCard(book) {
    const card = document.createElement('div');
    card.className = 'book-card';
    card.innerHTML = `
        <div class="book-cover">
            <img src="${book.image_url || '../images/default-book.jpg'}" alt="${book.title} Cover">
            <div class="book-overlay">
                <button class="view-details-btn" onclick="openBookModal('${book.id}')">
                    <i class="fas fa-info-circle"></i> View Details
                </button>
            </div>
            </div>
            <div class="book-details">
                <h3>${book.title}</h3>
                <p class="author">${book.author}</p>
                <div class="meta">
                <span><i class="fas fa-bookmark"></i> ${book.genre}</span>
                <span><i class="fas fa-calendar"></i> ${new Date(book.created_at).toLocaleDateString()}</span>
                <span class="status ${book.status}"><i class="fas fa-clock"></i> ${book.status}</span>
                </div>
            <button class="request-btn" onclick="requestBook('${book.id}')">
                    <i class="fas fa-hand-holding-heart"></i> Request Book
                </button>
            </div>
        `;
    return card;
}

// Function to apply filters
function applyFilters(books) {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const selectedGenre = document.getElementById('genre-filter').value;
    const selectedLanguage = document.getElementById('language-filter').value;
    const selectedCondition = document.getElementById('condition-filter').value;

    return books.filter(book => {
        const matchesSearch = book.title.toLowerCase().includes(searchTerm) ||
                            book.author.toLowerCase().includes(searchTerm);
        const matchesGenre = selectedGenre === 'all' || book.genre === selectedGenre;
        const matchesLanguage = selectedLanguage === 'all' || book.language === selectedLanguage;
        const matchesCondition = selectedCondition === 'all' || book.condition === selectedCondition;

        return matchesSearch && matchesGenre && matchesLanguage && matchesCondition;
    });
}

// Function to display books
async function displayBooks() {
    const booksContainer = document.getElementById('books-container');
    booksContainer.innerHTML = '<div class="loading">Loading books...</div>';

    const books = await fetchPendingBooks();
    
    if (books.length === 0) {
        booksContainer.innerHTML = `
            <div class="no-books">
                <i class="fas fa-books" style="font-size: 3rem; color: #ddd; margin-bottom: 1rem;"></i>
                <p>No pending books available at the moment.</p>
            </div>
        `;
        return;
    }

    const filteredBooks = applyFilters(books);
    booksContainer.innerHTML = '';
    
    if (filteredBooks.length === 0) {
        booksContainer.innerHTML = `
            <div class="no-books">
                <p>No books match your filters.</p>
                <button class="reset-filters-btn" onclick="resetFilters()">
                    <i class="fas fa-undo"></i> Reset Filters
                </button>
            </div>
        `;
        return;
    }

    filteredBooks.forEach(book => {
        booksContainer.appendChild(createBookCard(book));
    });
}

// Function to reset filters
function resetFilters() {
    document.getElementById('search-input').value = '';
    document.getElementById('genre-filter').value = 'all';
    document.getElementById('language-filter').value = 'all';
    document.getElementById('condition-filter').value = 'all';
    displayBooks();
}

// Function to open book modal
async function openBookModal(bookId) {
    try {
        const response = await fetch(`http://localhost:3001/api/books/${bookId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch book details');
        }

        const data = await response.json();
        const book = data.book;

        // Update modal content
        document.getElementById('modal-book-cover').innerHTML = `
            <img src="${book.image_url || '../images/default-book.jpg'}" alt="${book.title} Cover">
        `;
        document.getElementById('modal-book-title').textContent = book.title;
        document.getElementById('modal-book-author').textContent = book.author;
        document.getElementById('modal-book-genre').querySelector('span').textContent = book.genre;
        document.getElementById('modal-book-language').querySelector('span').textContent = book.language || 'Not specified';
        document.getElementById('modal-book-condition').querySelector('span').textContent = book.condition || 'Not specified';
        document.getElementById('modal-book-summary-content').textContent = book.summary || 'No summary available.';

        // Show modal
        document.getElementById('book-modal').classList.add('active');
    } catch (error) {
        console.error('Error opening book modal:', error);
        showToast('Error loading book details', 'error');
    }
}

// Function to request a book
async function requestBook(bookId) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            showToast('Please log in to request books', 'error');
            setTimeout(() => {
                window.location.href = '/pages/login.html?redirect=' + encodeURIComponent(window.location.pathname);
            }, 2000);
            return;
        }

        const response = await fetch(`http://localhost:3001/api/books/${bookId}/request`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to request book');
        }

        showToast('Book requested successfully! We will contact you soon.', 'success');
        
        // Close modal if open
        const modal = document.getElementById('book-modal');
        if (modal.classList.contains('active')) {
            modal.classList.remove('active');
        }
        
        // Refresh the books list
        displayBooks();
    } catch (error) {
        console.error('Error requesting book:', error);
        showToast(error.message || 'Error requesting book. Please try again later.', 'error');
    }
}

// Function to show toast messages
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Display initial books
    displayBooks();

    // Add event listeners
    document.getElementById('apply-filters').addEventListener('click', displayBooks);
    document.getElementById('search-input').addEventListener('input', debounce(displayBooks, 300));
    
    // View toggle
    document.getElementById('grid-view').addEventListener('click', () => {
        document.getElementById('books-container').className = 'books-grid';
        document.querySelector('.view-option.active').classList.remove('active');
        document.getElementById('grid-view').classList.add('active');
    });
    
    document.getElementById('list-view').addEventListener('click', () => {
        document.getElementById('books-container').className = 'books-list';
        document.querySelector('.view-option.active').classList.remove('active');
        document.getElementById('list-view').classList.add('active');
    });

    // Modal close button
    document.querySelector('.close-modal').addEventListener('click', () => {
        document.getElementById('book-modal').classList.remove('active');
    });
});

// Debounce function for search input
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}