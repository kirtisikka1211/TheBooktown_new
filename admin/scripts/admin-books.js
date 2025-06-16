// Function to fetch all books
async function fetchAllBooks() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch('http://localhost:3001/api/books', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch books');
        }

        const data = await response.json();
        return data.books;
    } catch (error) {
        console.error('Error fetching books:', error);
        showToast('Error fetching books: ' + error.message, 'error');
        return [];
    }
}

// Function to update book statistics
function updateBookStats(books) {
    const totalBooks = books.length;
    const availableBooks = books.filter(book => book.status === 'approved').length;
    const pendingBooks = books.filter(book => book.status === 'pending').length;

    document.querySelector('.stat-card:nth-child(1) .info h3').textContent = totalBooks;
    document.querySelector('.stat-card:nth-child(2) .info h3').textContent = availableBooks;
    document.querySelector('.stat-card:nth-child(3) .info h3').textContent = pendingBooks;
}

// Function to create a book card
function createBookCard(book) {
    const card = document.createElement('div');
    card.className = 'book-card';
    
    const statusClass = book.status === 'approved' ? 'available' : 
                       book.status === 'rejected' ? 'unavailable' : 'pending';
    
    card.innerHTML = `
        <div class="book-cover" style="background-image: url('${book.image_url || '../../images/default-book.jpg'}');">
            <span class="book-status ${statusClass}">${book.status.charAt(0).toUpperCase() + book.status.slice(1)}</span>
        </div>
        <div class="book-details">
            <h3>${book.title}</h3>
            <p class="author">${book.author}</p>
            <div class="book-meta">
                <span><i class="fas fa-book-open"></i> ${book.genre || 'Not specified'}</span>
                <span><i class="fas fa-user"></i> ${book.users?.username || 'Unknown'}</span>
            </div>
            <div class="book-actions">
                <button class="btn btn-sm btn-primary" onclick="editBook('${book.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-sm btn-outline" onclick="viewBookDetails('${book.id}')">
                    <i class="fas fa-info-circle"></i> Details
                </button>
            </div>
        </div>
    `;
    
    return card;
}

// Function to display books
async function displayBooks() {
    const booksGrid = document.querySelector('.books-grid');
    booksGrid.innerHTML = '<div class="loading">Loading books...</div>';
    
    const books = await fetchAllBooks();
    updateBookStats(books);
    
    booksGrid.innerHTML = '';
    books.forEach(book => {
        booksGrid.appendChild(createBookCard(book));
    });
}

// Function to show toast notifications
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Function to handle book editing
async function editBook(bookId) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`http://localhost:3001/api/books/${bookId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch book details');
        }

        const data = await response.json();
        const book = data.book;

        // Populate the edit form
        document.getElementById('editBookId').value = book.id;
        document.getElementById('editTitle').value = book.title;
        document.getElementById('editGenre').value = book.genre || 'fiction';

        // Show the modal
        const modal = document.getElementById('editBookModal');
        modal.classList.add('active');
    } catch (error) {
        console.error('Error fetching book details:', error);
        showToast('Error fetching book details: ' + error.message, 'error');
    }
}

// Function to handle viewing book details
async function viewBookDetails(bookId) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`http://localhost:3001/api/books/${bookId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch book details');
        }

        const data = await response.json();
        const book = data.book;

        // Populate the details modal
        document.getElementById('detailBookImage').src = book.image_url || '../../images/default-book.jpg';
        document.getElementById('detailTitle').textContent = book.title;
        document.getElementById('detailAuthor').textContent = book.author;
        document.getElementById('detailGenre').textContent = book.genre || 'Not specified';
        document.getElementById('detailStatus').textContent = book.status.charAt(0).toUpperCase() + book.status.slice(1);
        document.getElementById('detailUser').textContent = book.users?.username || 'Unknown';
        document.getElementById('detailDate').textContent = new Date(book.created_at).toLocaleDateString();
        document.getElementById('detailSummary').textContent = book.summary || 'No summary available';

        // Show the modal
        const modal = document.getElementById('bookDetailsModal');
        modal.classList.add('active');
    } catch (error) {
        console.error('Error fetching book details:', error);
        showToast('Error fetching book details: ' + error.message, 'error');
    }
}

// Function to close modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
}

// Function to handle form submission
async function handleEditSubmit(event) {
    event.preventDefault();
    
    const bookId = document.getElementById('editBookId').value;
    const title = document.getElementById('editTitle').value;
    const genre = document.getElementById('editGenre').value;

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`http://localhost:3001/api/books/${bookId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ title, genre })
        });

        if (!response.ok) {
            throw new Error('Failed to update book');
        }

        showToast('Book updated successfully!', 'success');
        closeModal('editBookModal');
        displayBooks(); // Refresh the book list
    } catch (error) {
        console.error('Error updating book:', error);
        showToast('Error updating book: ' + error.message, 'error');
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    displayBooks();
    
    // Add event listeners for view toggle
    const viewToggleButtons = document.querySelectorAll('.view-toggle .btn');
    viewToggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            viewToggleButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            const booksGrid = document.querySelector('.books-grid');
            if (button.querySelector('.fa-list')) {
                booksGrid.classList.add('list-view');
            } else {
                booksGrid.classList.remove('list-view');
            }
        });
    });
    
    // Add event listeners for filters
    const filterSelects = document.querySelectorAll('.filter-select');
    filterSelects.forEach(select => {
        select.addEventListener('change', () => {
            displayBooks(); // Refresh the display with new filters
        });
    });

    // Add event listener for edit form submission
    document.getElementById('editBookForm').addEventListener('submit', handleEditSubmit);

    // Close modals when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
            event.target.classList.remove('active');
        }
    });
}); 