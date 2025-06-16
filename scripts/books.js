// Sample book data
const books = [
    {
        id: 1,
        title: "NCERT Science textbook for Class 9",
        author: "NCERT",
        cover: "book_images/science.png",
        genre: "Academic",
        language: "English",
        condition: "Good",
    },
    {
        id: 2,
        title: "NCERT Mathematics textbook for Class 10",
        author: "NCERT",
        cover: "book_images/maths.png",
        genre: "Academic",
        language: "English",
        condition: "Like New",
    },
    {
        id: 3,
        title: "NCERT English textbook for Class 10",
        author: "NCERT",
        cover: "book_images/english.png",
        genre: "Academic",
        language: "English",
        condition: "Like New",
    },
    {
        id: 4,
        title: "Space Encyclopedia - A Comprehensive Guide",
        author: "space_magazine",
        cover: "book_images/space.png",
        genre: "Academic",
        language: "English",
        condition: "Fair",
    }
    
];

// DOM Elements
const booksContainer = document.getElementById('books-container');
const modal = document.getElementById('book-modal');
const closeModal = document.querySelector('.close-modal');
const modalBookCover = document.getElementById('modal-book-cover');
const modalBookTitle = document.getElementById('modal-book-title');
const modalBookAuthor = document.getElementById('modal-book-author');
const modalBookGenre = document.getElementById('modal-book-genre').querySelector('span');
const modalBookLanguage = document.getElementById('modal-book-language').querySelector('span');
const modalBookCondition = document.getElementById('modal-book-condition').querySelector('span');
const modalBookSummary = document.getElementById('modal-book-summary-content');
const gridViewBtn = document.getElementById('grid-view');
const listViewBtn = document.getElementById('list-view');
const searchInput = document.getElementById('search-input');
const genreFilter = document.getElementById('genre-filter');
const languageFilter = document.getElementById('language-filter');
const conditionFilter = document.getElementById('condition-filter');
const applyFiltersBtn = document.getElementById('apply-filters');

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    displayBooks(books);
    setupEventListeners();
});

// Display books in the container
function displayBooks(booksToDisplay) {
    booksContainer.innerHTML = '';
    
    if (booksContainer.classList.contains('books-list')) {
        displayBooksAsList(booksToDisplay);
    } else {
        displayBooksAsGrid(booksToDisplay);
    }
}

// Display books in grid view
function displayBooksAsGrid(booksToDisplay) {
    booksToDisplay.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.className = 'book-card';
        bookCard.dataset.id = book.id;
        
        bookCard.innerHTML = `
            <div class="book-cover" style="background-image: url('${book.cover || `https://via.placeholder.com/300x450?text=${encodeURIComponent(book.title)}`}');">
                <span class="condition-badge ${book.condition.toLowerCase().replace(' ', '-')}">${book.condition}</span>
            </div>
            <div class="book-details">
                <h3>${book.title}</h3>
                <p class="author">${book.author}</p>
                <div class="meta">
                    <span><i class="fas fa-book-open"></i> ${book.genre}</span>
                    <span><i class="fas fa-language"></i> ${book.language}</span>
                </div>
                <button class="request-btn">
                    <i class="fas fa-hand-holding-heart"></i> Request Book
                </button>
            </div>
        `;
        
        booksContainer.appendChild(bookCard);
    });
}

// Display books in list view
function displayBooksAsList(booksToDisplay) {
    booksToDisplay.forEach(book => {
        const bookItem = document.createElement('div');
        bookItem.className = 'book-list-item';
        bookItem.dataset.id = book.id;
        
        bookItem.innerHTML = `
            <div class="book-cover" style="background-image: url('${book.cover || `https://via.placeholder.com/300x450?text=${encodeURIComponent(book.title)}`}');">
                <span class="condition-badge ${book.condition.toLowerCase().replace(' ', '-')}">${book.condition}</span>
            </div>
            <div class="book-details">
                <h3>${book.title}</h3>
                <p class="author">${book.author}</p>
                <div class="meta">
                    <span><i class="fas fa-book-open"></i> ${book.genre}</span>
                    <span><i class="fas fa-language"></i> ${book.language}</span>
                </div>
                <button class="request-btn">
                    <i class="fas fa-hand-holding-heart"></i> Request Book
                </button>
            </div>
        `;
        
        booksContainer.appendChild(bookItem);
    });
}

// Set up event listeners
function setupEventListeners() {
    // View toggle
    gridViewBtn.addEventListener('click', () => {
        listViewBtn.classList.remove('active');
        gridViewBtn.classList.add('active');
        booksContainer.classList.remove('books-list');
        booksContainer.classList.add('books-grid');
        displayBooks(filterBooks());
    });
    
    listViewBtn.addEventListener('click', () => {
        gridViewBtn.classList.remove('active');
        listViewBtn.classList.add('active');
        booksContainer.classList.remove('books-grid');
        booksContainer.classList.add('books-list');
        displayBooks(filterBooks());
    });
    
    // Book card click
    booksContainer.addEventListener('click', (e) => {
        const bookCard = e.target.closest('.book-card, .book-list-item');
        const requestBtn = e.target.closest('.request-btn');
        
        if (bookCard && !requestBtn) {
            const bookId = parseInt(bookCard.dataset.id);
            openBookModal(bookId);
        }
        
        if (requestBtn) {
            e.stopPropagation();
            alert('Book request submitted! We will contact you soon.');
        }
    });
    
    // Close modal
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Modal request button
    document.getElementById('modal-request-btn').addEventListener('click', () => {
        alert('Book request submitted! We will contact you soon.');
        modal.style.display = 'none';
    });
    
    // Search and filters
    searchInput.addEventListener('input', debounce(() => {
        displayBooks(filterBooks());
    }, 300));
    
    applyFiltersBtn.addEventListener('click', () => {
        displayBooks(filterBooks());
    });
}

// Open book modal
function openBookModal(bookId) {
    const book = books.find(b => b.id === bookId);
    
    if (!book) return;
    
    modalBookCover.style.backgroundImage = `url('${book.cover || `https://via.placeholder.com/300x450?text=${encodeURIComponent(book.title)}`}')`;
    modalBookTitle.textContent = book.title;
    modalBookAuthor.textContent = book.author;
    modalBookGenre.textContent = book.genre;
    modalBookLanguage.textContent = book.language;
    modalBookCondition.textContent = book.condition;
    
    // Display summary if available, otherwise show a simple message
    modalBookSummary.innerHTML = book.summary ? `<p>${book.summary}</p>` : '<p>No summary available for this book.</p>';
    
    modal.style.display = 'block';
}

// Filter books based on search and filter criteria
function filterBooks() {
    const searchTerm = searchInput.value.toLowerCase();
    const genreValue = genreFilter.value;
    const languageValue = languageFilter.value;
    const conditionValue = conditionFilter.value;
    
    return books.filter(book => {
        // Search filter
        const matchesSearch = 
            book.title.toLowerCase().includes(searchTerm) || 
            book.author.toLowerCase().includes(searchTerm);
        
        // Genre filter
        const matchesGenre = genreValue === 'all' || book.genre.toLowerCase() === genreValue;
        
        // Language filter
        const matchesLanguage = languageValue === 'all' || book.language.toLowerCase() === languageValue;
        
        // Condition filter
        const matchesCondition = conditionValue === 'all' || book.condition.toLowerCase().replace(' ', '-') === conditionValue;
        
        return matchesSearch && matchesGenre && matchesLanguage && matchesCondition;
    });
}

// Debounce function to limit how often a function can be called
function debounce(func, delay) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}