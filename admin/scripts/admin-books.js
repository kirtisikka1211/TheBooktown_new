// Groq API Key
const GROQ_API_KEY = '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';

// Function to fetch all books
async function fetchAllBooks() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch('https://thebooktown-new-1.onrender.com/api/books', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

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
    
    // Ensure image_url is properly formatted
    const imageUrl = book.image_url || '../../images/default-book.jpg';
    console.log('Book image URL:', imageUrl);
    
    card.innerHTML = `
        <div class="book-cover" style="background-image: url('${imageUrl}');">
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
                <button class="btn btn-sm btn-danger" onclick="showDeleteModal('${book.id}', '${book.title.replace(/'/g, "\\'")}')">
                    <i class="fas fa-trash-alt"></i>
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
function showToast(message, type = 'info') {
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

// Function to handle book editing
async function editBook(bookId) {
    try {
        console.log('Attempting to edit book with ID:', bookId);
        
        const token = localStorage.getItem('token');
        if (!token) {
            showToast('Please log in to edit books', 'error');
            return;
        }

        const response = await fetch(`https://thebooktown-new-1.onrender.com/api/books/${bookId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 404) {
            showToast('Book not found. It may have been deleted.', 'error');
            return;
        }

        if (!response.ok) {
            throw new Error('Failed to fetch book details');
        }

        const data = await response.json();
        console.log('Received book data:', data);

        if (!data.book) {
            throw new Error('Book data is missing from response');
        }

        const book = data.book;

        // Get form elements
        const editForm = document.getElementById('editBookForm');
        const editIdInput = document.getElementById('editBookId');
        const editTitleInput = document.getElementById('editTitle');
        const editAuthorInput = document.getElementById('editAuthor');
        const editGenreSelect = document.getElementById('editGenre');
        const editSummaryInput = document.getElementById('editSummary');
        const editBookImage = document.getElementById('editBookImage');

        // Check if form elements exist
        if (!editForm || !editIdInput || !editTitleInput || !editAuthorInput || !editGenreSelect || !editSummaryInput) {
            showToast('Error: Edit form elements not found', 'error');
            return;
        }

        // Populate form fields
        editIdInput.value = book.id;
        editTitleInput.value = book.title || '';
        editAuthorInput.value = book.author || '';
        editGenreSelect.value = book.genre || 'fiction';
        editSummaryInput.value = book.summary || '';
        
        // Update image preview if available
        if (editBookImage) {
            editBookImage.src = book.image_url || '../../images/default-book.jpg';
        }

        // Show the modal
        const modal = document.getElementById('editBookModal');
        if (!modal) {
            showToast('Error: Modal not found', 'error');
            return;
        }
        modal.classList.add('active');

    } catch (error) {
        console.error('Detailed error in editBook:', error);
        showToast(`Error: ${error.message}. Please try again.`, 'error');
    }
}

// Function to handle viewing book details
async function viewBookDetails(bookId) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`https://thebooktown-new-1.onrender.com/api/books/${bookId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch book details');
        }

        const data = await response.json();
        const book = data.book;

        // Ensure image_url is properly formatted
        const imageUrl = book.image_url || '../../images/default-book.jpg';
        console.log('Book details image URL:', imageUrl);

        // Populate the details modal
        document.getElementById('detailBookImage').src = imageUrl;
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
    if (modal) {
        modal.classList.remove('active');
        // Reset form if it's the add book modal
        if (modalId === 'addBookModal') {
            const form = document.getElementById('addBookForm');
            if (form) {
                form.reset();
                form.removeEventListener('submit', handleAddBook);
            }
        }
    }
}

// Function to handle form submission
async function handleEditSubmit(event) {
    event.preventDefault();
    
    const bookId = document.getElementById('editBookId').value;
    const title = document.getElementById('editTitle').value;
    const author = document.getElementById('editAuthor').value;
    const genre = document.getElementById('editGenre').value;
    const summary = document.getElementById('editSummary').value;

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }

        // Validate required fields
        if (!title || !author || !genre) {
            throw new Error('Title, author, and genre are required');
        }

        const response = await fetch(`https://thebooktown-new-1.onrender.com/api/books/${bookId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ title, author, genre, summary })
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to update book');
        }

        showToast('Book updated successfully!', 'success');
        closeModal('editBookModal');
        displayBooks(); // Refresh the book list
    } catch (error) {
        console.error('Error updating book:', error);
        showToast('Error updating book: ' + error.message, 'error');
    }
}

// Function to handle book addition
async function handleAddBook(e) {
    e.preventDefault();

    // Get form values
    const title = document.getElementById('addTitle')?.value;
    const author = document.getElementById('addAuthor')?.value;
    const genre = document.getElementById('addGenre')?.value;
    const summary = document.getElementById('addSummary')?.value;
    const imageFile = document.getElementById('addImage')?.files[0];

    console.log('Form values:', { title, author, genre, summary, imageFile });

    // Validate all fields
    if (!title || !author || !genre || !summary || !imageFile) {
        showToast('Please fill in all fields and upload an image', 'error');
        return;
    }

    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Adding Book...';
    submitBtn.disabled = true;

    try {
        // Create FormData to send both file and text data
        const formData = new FormData();
        formData.append('title', title);
        formData.append('author', author);
        formData.append('genre', genre);
        formData.append('summary', summary);
        formData.append('image', imageFile);

        const token = localStorage.getItem('token');
        if (!token) {
            showToast('Please login to add books', 'error');
            window.location.href = '/pages/login.html';
            return;
        }

        console.log('Sending request to add book...');
        const response = await fetch('https://thebooktown-new-1.onrender.com/api/admin/add-book', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        console.log('Response status:', response.status);
        const result = await response.json();
        console.log('Response data:', result);

        if (!response.ok) {
            throw new Error(result.error || result.details || 'Failed to add book');
        }

        showToast(result.message || 'Book added successfully!', 'success');
        // Reset form
        e.target.reset();
        // Close modal
        closeModal('addBookModal');
        // Refresh book list
        displayBooks();
    } catch (error) {
        console.error('Add book error:', error);
        showToast(error.message || 'Failed to add book. Please try again.', 'error');
    } finally {
        // Reset button state
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Function to open the add book modal
function openAddBookModal() {
    const modal = document.getElementById('addBookModal');
    if (modal) {
        modal.classList.add('active');
        // Add form submit event listener
        const form = document.getElementById('addBookForm');
        if (form) {
            form.addEventListener('submit', handleAddBook);
        }
    }
}

// Function to check if all required fields are filled
function areFieldsFilled() {
    const titleInput = document.getElementById('addTitle');
    const authorInput = document.getElementById('addAuthor');
    const genreInput = document.getElementById('addGenre');
    
    return titleInput?.value.trim() && 
           authorInput?.value.trim() && 
           genreInput?.value.trim();
}

// Function to clean up the summary text
function cleanSummaryText(text) {
    return text.replace(/<think>[\s\S]*?<\/think>/g, '')
              .replace(/^Orphaned as a baby,/, '')
              .trim();
}

// Function to generate summary using Groq API
async function generateSummary(bookDetails) {
    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "deepseek-r1-distill-llama-70b",
                messages: [
                    {
                        role: "user",
                        content: `Generate a concise book summary based on these details:\nTitle: ${bookDetails.title}\nAuthor: ${bookDetails.author}\nGenre: ${bookDetails.genre}\n\nPlease provide a brief, engaging summary that captures the essence of the book.`
                    }
                ],
                temperature: 0.6,
                max_tokens: 4096,
                top_p: 0.95,
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error('Failed to generate summary');
        }

        const data = await response.json();
        return data.choices[0].message.content.trim();
    } catch (error) {
        console.error('Error generating summary:', error);
        throw error;
    }
}

// Function to generate book summary
async function generateBookSummary() {
    if (!areFieldsFilled()) {
        showToast('Please fill in title, author, and genre first', 'error');
        return;
    }

    const generateSummaryBtn = document.getElementById('generate-summary');
    const summaryTextarea = document.getElementById('addSummary');

    try {
        generateSummaryBtn.disabled = true;
        generateSummaryBtn.textContent = 'Generating...';
        
        const bookDetails = {
            title: document.getElementById('addTitle').value.trim(),
            author: document.getElementById('addAuthor').value.trim(),
            genre: document.getElementById('addGenre').value.trim()
        };

        const summary = await generateSummary(bookDetails);
        const cleanedSummary = cleanSummaryText(summary);
        summaryTextarea.value = cleanedSummary;
        showToast('Summary generated successfully!', 'success');
    } catch (error) {
        showToast('Failed to generate summary. Please try again.', 'error');
    } finally {
        generateSummaryBtn.disabled = false;
        generateSummaryBtn.textContent = 'Generate Summary';
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
    
    // Add event listener for add book form submission
    document.getElementById('addBookForm').addEventListener('submit', handleAddBook);

    // Close modals when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
            const modalId = event.target.id;
            closeModal(modalId);
        }
    });

    // Add event listeners for close buttons
    document.querySelectorAll('.modal .close-btn, .modal .cancel-btn').forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            if (modal) {
                closeModal(modal.id);
            }
        });
    });

    // Add input event listeners for summary generation
    const titleInput = document.getElementById('addTitle');
    const authorInput = document.getElementById('addAuthor');
    const genreInput = document.getElementById('addGenre');
    const generateSummaryBtn = document.getElementById('generate-summary');
    
    let debounceTimer;

    [titleInput, authorInput, genreInput].forEach(input => {
        if (input) {
            input.addEventListener('input', function() {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    if (areFieldsFilled()) {
                        generateBookSummary();
                    }
                }, 1000); // Wait for 1 second after the last input before generating
            });
        }
    });

    // Add click event listener for generate summary button
    if (generateSummaryBtn) {
        generateSummaryBtn.addEventListener('click', generateBookSummary);
    }

    // Add file input validation
    const imageInput = document.getElementById('addImage');
    if (imageInput) {
        imageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const fileSizeMB = file.size / (1024 * 1024);
                const validTypes = ['image/jpeg', 'image/png'];

                if (!validTypes.includes(file.type)) {
                    showToast('Please upload a JPG or PNG image.', 'error');
                    imageInput.value = '';
                    return;
                }

                if (fileSizeMB > 5) {
                    showToast('File size must be under 5MB.', 'error');
                    imageInput.value = '';
                    return;
                }
            }
        });
    }
}); 