// Function to fetch pending books
async function fetchPendingBooks() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch('http://localhost:3001/api/books?status=pending', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }

        const booksList = document.getElementById('books-list');
        booksList.innerHTML = ''; // Clear existing content
        
        data.books.forEach(book => {
            const bookCard = document.createElement('div');
            bookCard.className = 'moderation-item';
            bookCard.innerHTML = `
                <div class="item-preview">
                    <img src="${book.image_url || 'https://via.placeholder.com/150x200?text=No+Image'}" alt="${book.title}">
                    <div class="preview-actions">
                        <button class="btn btn-success btn-sm" onclick="approveBook('${book.id}')">
                            <i class="fas fa-check"></i> Approve
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="rejectBook('${book.id}')">
                            <i class="fas fa-times"></i> Reject
                        </button>
                    </div>
                </div>
                <div class="item-details">
                    <h3>${book.title}</h3>
                    <div class="meta">
                        <span><i class="fas fa-user"></i> Submitted by: ${book.users?.username || 'Unknown'}</span>
                        <span><i class="fas fa-clock"></i> ${new Date(book.created_at).toLocaleDateString()}</span>
                    </div>
                    <div class="item-meta">
                        <span class="badge genre">${book.genre}</span>
                        <span class="badge condition">${book.condition || 'Not specified'}</span>
                    </div>
                    <div class="moderation-notes">
                        <h4><i class="fas fa-info-circle"></i> Book Details</h4>
                        <p>${book.summary || 'No summary provided'}</p>
                    </div>
                </div>
            `;
            booksList.appendChild(bookCard);
        });

        // Update pending count
        document.getElementById('pending-count').textContent = data.books.length;
    } catch (error) {
        console.error('Error fetching pending books:', error);
        showToast('Failed to fetch pending books: ' + error.message, 'error');
    }
}

// Function to approve a book
async function approveBook(bookId) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`http://localhost:3001/api/books/${bookId}/status`, {
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
        fetchPendingBooks(); // Refresh the list
    } catch (error) {
        console.error('Error approving book:', error);
        showToast('Failed to approve book: ' + error.message, 'error');
    }
}

// Function to reject a book
async function rejectBook(bookId) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`http://localhost:3001/api/books/${bookId}/status`, {
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
        fetchPendingBooks(); // Refresh the list
    } catch (error) {
        console.error('Error rejecting book:', error);
        showToast('Failed to reject book: ' + error.message, 'error');
    }
}

// Function to show toast notifications
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Function to handle tab switching
function switchTab(tabId) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Deactivate all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab content
    document.getElementById(tabId).classList.add('active');
    
    // Activate selected tab button
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
    
    // Add event listener for refresh button
    document.getElementById('refresh-btn').addEventListener('click', fetchPendingBooks);
    
    // Add event listeners for filters
    document.getElementById('genre-filter').addEventListener('change', fetchPendingBooks);
    document.getElementById('sort-filter').addEventListener('change', fetchPendingBooks);
}); 