// Function to fetch books
async function fetchBooks() {
    try {
        const response = await fetch('https://thebooktown-new-1.onrender.com/api/public/books');
        
        if (!response.ok) {
            throw new Error('Failed to fetch books');
        }

        const data = await response.json();
        
        // If user is logged in, fetch their requests to mark requested books
        const token = localStorage.getItem('token');
        if (token) {
            const requestsResponse = await fetch('https://thebooktown-new-1.onrender.com/api/my-requests', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (requestsResponse.ok) {
                const requestsData = await requestsResponse.json();
                const requestedBookIds = new Set(requestsData.requests.map(req => req.book_id));
                
                // Mark requested books
                data.books = data.books.map(book => ({
                    ...book,
                    isRequested: requestedBookIds.has(book.id)
                }));
            }
        }

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
    
    const requestBtnHtml = book.isRequested 
        ? `<button class="btn-primary request-btn requested" disabled>
            <i class="fas fa-check"></i> Requested
           </button>`
        : `<button class="btn-primary request-btn" onclick="requestBook(${JSON.stringify(book).replace(/"/g, '&quot;')})">
            <i class="fas fa-hand-holding-heart"></i> Request Book
           </button>`;

    card.innerHTML = `
        <div class="book-cover">
            <img src="${book.image_url || '../images/default-book.jpg'}" alt="${book.title} Cover">
            <div class="book-overlay">
                <button class="view-details-btn" onclick="viewBookDetails(${JSON.stringify(book).replace(/"/g, '&quot;')})">
                    <i class="fas fa-info-circle"></i> View Details
                </button>
            </div>
            </div>
            <div class="book-details">
                <h3>${book.title}</h3>
                <p class="author">${book.author}</p>
                <div class="meta">
                <span><i class="fas fa-bookmark"></i> ${book.genre || 'General'}</span>
                <span><i class="fas fa-calendar"></i> ${new Date(book.created_at).toLocaleDateString()}</span>
                </div>
            <div class="card-actions">
                ${requestBtnHtml}
            </div>
            </div>
        `;
    return card;
}

let currentBookId = null;
let currentBook = null;

// Function to view book details
function viewBookDetails(book) {
    currentBook = book;
    currentBookId = book.id;
    
    // Populate the modal with book details
    document.getElementById('detailBookImage').src = book.image_url || '../images/default-book.jpg';
    document.getElementById('detailTitle').textContent = book.title;
    document.getElementById('detailAuthor').textContent = book.author;
    document.getElementById('detailGenre').textContent = book.genre || 'General';
    document.getElementById('detailUser').textContent = book.users?.username || 'Anonymous';
    document.getElementById('detailDate').textContent = new Date(book.created_at).toLocaleDateString();
    document.getElementById('detailSummary').textContent = book.summary || 'No summary available';

    // Show the modal
    const modal = document.getElementById('bookDetailsModal');
    modal.classList.add('active');
}

// Function to close modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
    
    // Only clear the book data if closing the details modal
    if (modalId === 'bookDetailsModal') {
        currentBook = null;
    }
    // Clear form data if closing request modal
    if (modalId === 'requestBookModal') {
        document.getElementById('requestBookForm').reset();
    }
}

// Close modal when clicking outside
window.addEventListener('click', (event) => {
    if (event.target.classList.contains('modal')) {
        closeModal(event.target.id);
    }
});

// Function to apply filters
function applyFilters(books) {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const selectedGenre = document.getElementById('genre-filter').value;

    return books.filter(book => {
        const matchesSearch = book.title.toLowerCase().includes(searchTerm) ||
                            book.author.toLowerCase().includes(searchTerm);
        const matchesGenre = selectedGenre === 'all' || book.genre === selectedGenre;

        return matchesSearch && matchesGenre;
    });
}

// Function to display books
async function displayBooks() {
    const booksContainer = document.querySelector('.books-grid');
    booksContainer.innerHTML = '<div class="loading">Loading books...</div>';

    const books = await fetchBooks();
    
    if (books.length === 0) {
        booksContainer.innerHTML = `
            <div class="no-books">
                <i class="fas fa-books" style="font-size: 3rem; color: #ddd; margin-bottom: 1rem;"></i>
                <p>No approved books available at the moment.</p>
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
    displayBooks();
}

// Function to request a book
async function requestBook(book) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            showToast('Please log in to request books', 'error');
            setTimeout(() => {
                window.location.href = '/pages/login.html?redirect=' + encodeURIComponent(window.location.pathname);
            }, 2000);
            return;
        }

        // Store the book data
        currentBook = book;
        currentBookId = book.id;

        // Get user's email from token
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        document.getElementById('requestEmail').value = tokenData.email;

        // Populate book details in the request modal
        document.getElementById('requestBookTitle').textContent = book.title;
        document.getElementById('requestBookAuthor').textContent = book.author;

        // Close the details modal if it's open
        closeModal('bookDetailsModal');
        
        // Show the request modal
        const modal = document.getElementById('requestBookModal');
        modal.classList.add('active');
    } catch (error) {
        console.error('Error preparing request:', error);
        showToast('Error preparing request form. Please try again later.', 'error');
    }
}

// Function to update book card after successful request
function updateBookCardAfterRequest(bookId) {
    const bookCards = document.querySelectorAll('.book-card');
    bookCards.forEach(card => {
        const requestBtn = card.querySelector('.request-btn');
        if (requestBtn && requestBtn.onclick) {
            const onclickStr = requestBtn.getAttribute('onclick');
            if (onclickStr.includes(`"id":"${bookId}"`)) {
                const btnContainer = requestBtn.parentElement;
                btnContainer.innerHTML = `
                    <button class="btn-primary request-btn requested" disabled>
                        <i class="fas fa-check"></i> Requested
                    </button>
                `;
            }
        }
    });
}

// Function to submit book request
async function submitBookRequest(event) {
    event.preventDefault();

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            showToast('Please log in to request books', 'error');
            return;
        }

        // Get the book title from the modal to verify we have the correct book
        const bookTitle = document.getElementById('requestBookTitle').textContent;
        if (!bookTitle) {
            showToast('Please select a book to request', 'error');
            closeModal('requestBookModal');
            return;
        }

        const address = document.getElementById('requestAddress').value.trim();
        const contactNumber = document.getElementById('requestContact').value.trim();

        // Validate contact number
        if (!/^\d{10}$/.test(contactNumber)) {
            showToast('Please enter a valid 10-digit contact number', 'error');
            return;
        }

        // Double check we have the book ID
        if (!currentBookId) {
            console.error('Missing book ID for request');
            showToast('Error processing request. Please try again.', 'error');
            return;
        }

        const response = await fetch(`https://thebooktown-new-1.onrender.com/api/books/${currentBookId}/request`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                address,
                contact_number: contactNumber
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to submit request');
        }

        showToast('Book request submitted successfully! We will contact you soon.', 'success');
        
        // Update the UI to show the book as requested
        updateBookCardAfterRequest(currentBookId);
        
        // Only clear book data after successful submission
        currentBook = null;
        currentBookId = null;
        
        // Close modal and reset form
        closeModal('requestBookModal');
        document.getElementById('requestBookForm').reset();
    } catch (error) {
        console.error('Error submitting request:', error);
        showToast(error.message || 'Error submitting request. Please try again later.', 'error');
    }
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

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Add event listeners for filters
    document.getElementById('search-input').addEventListener('input', debounce(displayBooks, 300));
    document.getElementById('genre-filter').addEventListener('change', displayBooks);
    
    // Initial display
    displayBooks();
});

// Utility function for debouncing
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
};