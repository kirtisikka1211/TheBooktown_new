// Function to fetch pending books
async function fetchPendingBooks() {
    const booksList = document.getElementById('books-list');
    booksList.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading pending books...</div>';

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch('https://thebooktown-new-1.onrender.com/api/books?status=pending', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }

        booksList.innerHTML = ''; // Clear existing content
        
        if (data.books.length === 0) {
            booksList.innerHTML = `
                <div class="no-content">
                    <i class="fas fa-check-circle" style="font-size: 2rem; color: #28a745; margin-bottom: 1rem;"></i>
                    <p>No books pending approval!</p>
                </div>
            `;
            document.getElementById('pending-count').textContent = '0';
            return;
        }

        // Apply filters
        let filteredBooks = data.books;
        const genreFilter = document.getElementById('genre-filter').value;
        const sortFilter = document.getElementById('sort-filter').value;

        if (genreFilter !== 'all') {
            filteredBooks = filteredBooks.filter(book => book.genre.toLowerCase() === genreFilter.toLowerCase());
        }

        // Sort books
        filteredBooks.sort((a, b) => {
            const dateA = new Date(a.created_at);
            const dateB = new Date(b.created_at);
            return sortFilter === 'newest' ? dateB - dateA : dateA - dateB;
        });
        
        filteredBooks.forEach(book => {
            const bookCard = document.createElement('div');
            bookCard.className = 'book-card';
            bookCard.innerHTML = `
                <img src="${book.image_url || '../../images/default-book.jpg'}" 
                     alt="${book.title}" 
                     class="book-cover"
                     onerror="this.src='../../images/default-book.jpg'">
                <div class="book-details">
                    <h3 class="book-title">${book.title}</h3>
                    <p class="book-author">by ${book.author}</p>
                    <div class="book-meta">
                        <span><i class="fas fa-user"></i> ${book.users?.username || 'Unknown'}</span>
                        <span><i class="fas fa-clock"></i> ${new Date(book.created_at).toLocaleDateString()}</span>
                    </div>
                    <div class="book-meta" style="margin-top: 0.5rem;">
                        <span><i class="fas fa-bookmark"></i> ${book.genre}</span>
                        <span><i class="fas fa-info-circle"></i> ${book.condition || 'Not specified'}</span>
                    </div>
                    <div class="book-actions">
                        <button class="btn btn-approve" onclick="event.stopPropagation(); approveBook('${book.id}')">
                            <i class="fas fa-check"></i> Approve
                        </button>
                        <button class="btn btn-reject" onclick="event.stopPropagation(); rejectBook('${book.id}')">
                            <i class="fas fa-times"></i> Reject
                        </button>
                    </div>
                </div>
            `;

            // Add click event to show modal
            bookCard.addEventListener('click', () => showBookDetails(book));
            booksList.appendChild(bookCard);
        });

        // Update pending count with animation
        const pendingCount = document.getElementById('pending-count');
        const currentCount = parseInt(pendingCount.textContent);
        const newCount = data.books.length;
        
        if (currentCount !== newCount) {
            pendingCount.style.transform = 'scale(1.2)';
            pendingCount.textContent = newCount;
            setTimeout(() => {
                pendingCount.style.transform = 'scale(1)';
            }, 200);
        }

    } catch (error) {
        console.error('Error fetching pending books:', error);
        booksList.innerHTML = `
            <div class="no-content" style="color: #dc3545;">
                <i class="fas fa-exclamation-circle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>Error: ${error.message}</p>
                <button class="btn btn-secondary" onclick="fetchPendingBooks()" style="margin-top: 1rem;">
                    <i class="fas fa-sync-alt"></i> Try Again
                </button>
            </div>
        `;
        showToast('Failed to fetch pending books: ' + error.message, 'error');
    }
}

// Function to show book details in modal
function showBookDetails(book) {
    // Create modal if it doesn't exist
    let modal = document.querySelector('.modal-overlay');
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'modal-overlay';
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${book.title}</h2>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div style="display: flex; gap: 1.5rem; margin-bottom: 1.5rem;">
                    <img src="${book.image_url || '../../images/default-book.jpg'}" 
                         alt="${book.title}"
                         style="width: 150px; height: 200px; object-fit: cover; border-radius: 8px;"
                         onerror="this.src='../../images/default-book.jpg'">
                    <div>
                        <h3 style="margin: 0 0 0.5rem; color: #212529;">About the Book</h3>
                        <p class="book-summary">${book.summary || 'No summary provided'}</p>
                    </div>
                </div>
                <div class="book-meta-full">
                    <div class="meta-item">
                        <i class="fas fa-user"></i>
                        <div>
                            <strong>Submitted by</strong><br>
                            ${book.users?.username || 'Unknown'}
                        </div>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-clock"></i>
                        <div>
                            <strong>Submission Date</strong><br>
                            ${new Date(book.created_at).toLocaleDateString()}
                        </div>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-bookmark"></i>
                        <div>
                            <strong>Genre</strong><br>
                            ${book.genre}
                        </div>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-info-circle"></i>
                        <div>
                            <strong>Condition</strong><br>
                            ${book.condition || 'Not specified'}
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-approve" onclick="approveBook('${book.id}')">
                    <i class="fas fa-check"></i> Approve
                </button>
                <button class="btn btn-reject" onclick="rejectBook('${book.id}')">
                    <i class="fas fa-times"></i> Reject
                </button>
            </div>
        </div>
    `;

    // Show modal with animation
    requestAnimationFrame(() => {
        modal.classList.add('show');
    });

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

// Function to close modal
function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

// Function to approve a book
async function approveBook(bookId) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const button = event.target.closest('.btn');
        const originalContent = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Approving...';
        button.disabled = true;

        const response = await fetch(`https://thebooktown-new-1.onrender.com/api/books/${bookId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
                status: 'approved',
                app_rej: true 
            })
        });

        if (!response.ok) {
            throw new Error('Failed to approve book');
        }

        showToast('Book approved successfully!', 'success');
        
        // Animate the card removal
        const card = button.closest('.book-card');
        card.style.transform = 'translateX(100%)';
        card.style.opacity = '0';
        setTimeout(() => {
            fetchPendingBooks(); // Refresh the list
        }, 300);

    } catch (error) {
        console.error('Error approving book:', error);
        showToast('Failed to approve book: ' + error.message, 'error');
        
        // Reset button state
        const button = event.target.closest('.btn');
        button.innerHTML = originalContent;
        button.disabled = false;
    }
}

// Function to reject a book
async function rejectBook(bookId) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const button = event.target.closest('.btn');
        const originalContent = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Rejecting...';
        button.disabled = true;

        const response = await fetch(`https://thebooktown-new-1.onrender.com/api/books/${bookId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
                status: 'rejected',
                app_rej: false 
            })
        });

        if (!response.ok) {
            throw new Error('Failed to reject book');
        }

        showToast('Book rejected successfully!', 'success');
        
        // Animate the card removal
        const card = button.closest('.book-card');
        card.style.transform = 'translateX(-100%)';
        card.style.opacity = '0';
        setTimeout(() => {
            fetchPendingBooks(); // Refresh the list
        }, 300);

    } catch (error) {
        console.error('Error rejecting book:', error);
        showToast('Failed to reject book: ' + error.message, 'error');
        
        // Reset button state
        const button = event.target.closest('.btn');
        button.innerHTML = originalContent;
        button.disabled = false;
    }
}

// Function to show toast notifications
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Function to handle tab switching
function switchTab(tabId) {
    // Hide all tab contents with animation
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.opacity = '0';
        setTimeout(() => {
            tab.classList.remove('active');
            if (tab.id === tabId) {
                tab.classList.add('active');
                setTimeout(() => {
                    tab.style.opacity = '1';
                }, 50);
            }
        }, 200);
    });
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Fetch pending books
    fetchPendingBooks();
    
    // Add event listeners for tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            switchTab(btn.dataset.tab);
        });
    });
    
    // Add event listener for refresh button with animation
    const refreshBtn = document.getElementById('refresh-btn');
    refreshBtn.addEventListener('click', () => {
        const icon = refreshBtn.querySelector('i');
        icon.style.transform = 'rotate(360deg)';
        fetchPendingBooks();
        setTimeout(() => {
            icon.style.transform = 'rotate(0)';
        }, 500);
    });
    
    // Add event listeners for filters with debounce
    let filterTimeout;
    const filters = ['genre-filter', 'sort-filter'];
    
    filters.forEach(filterId => {
        document.getElementById(filterId).addEventListener('change', () => {
            clearTimeout(filterTimeout);
            filterTimeout = setTimeout(() => {
                fetchPendingBooks();
            }, 300);
        });
    });
}); 