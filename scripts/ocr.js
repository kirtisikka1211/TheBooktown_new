document.addEventListener('DOMContentLoaded', function () {
    // Check if user is authenticated
    if (!window.authManager.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    const imageInput = document.getElementById('book-image');
    const donationForm = document.getElementById('donation-form');
    const generateSummaryBtn = document.getElementById('generate-summary');
    const titleInput = document.getElementById('title');
    const authorInput = document.getElementById('author');
    const genreInput = document.getElementById('genre');
    const summaryTextarea = document.getElementById('summary');

    let debounceTimer;

    imageInput.addEventListener('change', function (e) {
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

            donationForm.style.display = 'block';
        }
    });

    donationForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Get form values
        const title = document.getElementById('title')?.value;
        const author = document.getElementById('author')?.value;
        const genre = document.getElementById('genre')?.value;
        const summary = document.getElementById('summary')?.value;
        const imageFile = imageInput.files[0];

        // Validate all fields
        if (!title || !author || !genre || !summary || !imageFile) {
            showToast('Please fill in all fields and upload an image', 'error');
            return;
        }

        // Show loading state
        const submitBtn = donationForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Submitting...';
        submitBtn.disabled = true;

        try {
            // Create FormData to send both file and text data
            const formData = new FormData();
            formData.append('title', title);
            formData.append('author', author);
            formData.append('genre', genre);
            formData.append('summary', summary);
            formData.append('image', imageFile);

            const token = window.authManager.getToken();
            if (!token) {
                showToast('Please login to donate books', 'error');
                window.location.href = 'login.html';
                return;
            }

            const response = await fetch('https://thebooktown-new-1.onrender.com/api/donate-book', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const result = await response.json();

            if (response.ok) {
                showToast('Book donated successfully!', 'success');
                // Reset form
                donationForm.reset();
                imageInput.value = '';
                donationForm.style.display = 'none';
                // Redirect to dashboard after a short delay
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } else {
                showToast(result.error || 'Failed to donate book', 'error');
            }
        } catch (error) {
            console.error('Donation error:', error);
            showToast('Failed to donate book. Please try again.', 'error');
        } finally {
            // Reset button state
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });

    // Function to check if all required fields are filled
    function areFieldsFilled() {
        return titleInput.value.trim() && 
               authorInput.value.trim() && 
               genreInput.value.trim();
    }

    // Function to clean up the summary text
    function cleanSummaryText(text) {
        // Remove any thinking/processing parts
        return text.replace(/<think>[\s\S]*?<\/think>/g, '')
                  .replace(/^Orphaned as a baby,/, '')
                  .trim();
    }

    // Function to generate summary
    async function generateBookSummary() {
        if (!areFieldsFilled()) {
            return;
        }

        try {
            generateSummaryBtn.disabled = true;
            generateSummaryBtn.textContent = 'Generating...';
            
            const bookDetails = {
                title: titleInput.value.trim(),
                author: authorInput.value.trim(),
                genre: genreInput.value.trim()
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

    // Add input event listeners to all fields
    [titleInput, authorInput, genreInput].forEach(input => {
        input.addEventListener('input', function() {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                if (areFieldsFilled()) {
                    generateBookSummary();
                }
            }, 1000); // Wait for 1 second after the last input before generating
        });
    });

    // Keep the manual generate button as a backup
    generateSummaryBtn.addEventListener('click', generateBookSummary);
});

// Toast notification function
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
