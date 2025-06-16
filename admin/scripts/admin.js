// Initialize admin dashboard charts
document.addEventListener('DOMContentLoaded', function() {
    // Initialize charts only if they exist
    const donationsChart = document.getElementById('donationsChart');
    if (donationsChart) {
        const donationsCtx = donationsChart.getContext('2d');
        new Chart(donationsCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Books Donated',
                    data: [120, 190, 170, 220, 240, 195],
                    borderColor: 'rgba(90, 127, 219, 1)',
                    backgroundColor: 'rgba(90, 127, 219, 0.1)',
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Monthly Donations'
                    }
                }
            }
        });
    }

    const usersChart = document.getElementById('usersChart');
    if (usersChart) {
        const usersCtx = usersChart.getContext('2d');
        new Chart(usersCtx, {
            type: 'bar',
            data: {
                labels: ['Readers', 'Donors', 'Volunteers', 'Admins'],
                datasets: [{
                    label: 'User Types',
                    data: [850, 320, 65, 13],
                    backgroundColor: [
                        'rgba(90, 127, 219, 0.7)',
                        'rgba(255, 154, 86, 0.7)',
                        'rgba(107, 189, 104, 0.7)',
                        'rgba(44, 62, 80, 0.7)'
                    ],
                    borderColor: [
                        'rgba(90, 127, 219, 1)',
                        'rgba(255, 154, 86, 1)',
                        'rgba(107, 189, 104, 1)',
                        'rgba(44, 62, 80, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'User Distribution'
                    }
                }
            }
        });
    }

    const categoriesChart = document.getElementById('categoriesChart');
    if (categoriesChart) {
        const categoriesCtx = categoriesChart.getContext('2d');
        new Chart(categoriesCtx, {
            type: 'pie',
            data: {
                labels: ['Fiction', 'Non-fiction', 'Sci-Fi', 'Biography'],
                datasets: [{
                    label: 'Book Categories',
                    data: [120, 90, 70, 40],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(75, 192, 192, 0.7)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Book Categories'
                    }
                }
            }
        });
    }

    const locationChart = document.getElementById('locationChart');
    if (locationChart) {
        const geoCtx = locationChart.getContext('2d');
        new Chart(geoCtx, {
            type: 'bar',
            data: {
                labels: ['USA', 'India', 'UK', 'Canada', 'Australia'],
                datasets: [{
                    label: 'Users by Country',
                    data: [350, 480, 120, 90, 70],
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(153, 102, 255, 0.7)'
                    ],
                    borderColor: [
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 99, 132, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Geographic Distribution of Users'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // Tab functionality for moderation page
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Remove active class from all buttons and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            this.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Load book approval data (simulated)
    if (document.querySelector('.approval-list')) {
        const approvalList = document.querySelector('.approval-list');
        
        // Simulated data - in a real app, this would come from an API
        const pendingBooks = [
            {
                title: "The Midnight Library",
                author: "Matt Haig",
                category: "Fiction",
                condition: "Good",
                donor: "user123",
                date: "2023-05-15"
            },
            // More books...
        ];
        
        pendingBooks.forEach(book => {
            const bookItem = document.createElement('div');
            bookItem.className = 'approval-item';
            bookItem.innerHTML = `
                <img src="../images/book-placeholder.jpg" alt="${book.title}">
                <div class="approval-details">
                    <h4>${book.title}</h4>
                    <p>by ${book.author}</p>
                    <div class="book-meta">
                        <span>Category: ${book.category}</span>
                        <span>Condition: ${book.condition}</span>
                        <span>Donated by: ${book.donor}</span>
                        <span>Date: ${book.date}</span>
                    </div>
                </div>
                <div class="approval-actions">
                    <button class="btn btn-primary"><i class="fas fa-check"></i> Approve</button>
                    <button class="btn btn-outline"><i class="fas fa-times"></i> Reject</button>
                </div>
            `;
            
            approvalList.appendChild(bookItem);
        });
    }
});