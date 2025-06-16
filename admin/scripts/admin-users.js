// Function to fetch all users
async function fetchUsers() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch('https://thebooktown-new-1.onrender.com/api/users', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }

        const data = await response.json();
        return data.users;
    } catch (error) {
        console.error('Error fetching users:', error);
        showToast('Error fetching users: ' + error.message, 'error');
        return [];
    }
}

// Function to update user statistics
function updateUserStats(users) {
    const totalUsers = users.length;
    const activeUsers = users.filter(user => user.status === 'active').length;
    const newUsers = users.filter(user => {
        const userDate = new Date(user.created_at);
        const now = new Date();
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        return userDate >= monthAgo;
    }).length;

    document.getElementById('totalUsers').textContent = totalUsers;
    document.getElementById('activeUsers').textContent = activeUsers;
    document.getElementById('newUsers').textContent = newUsers;
}

// Function to create a user row
function createUserRow(user) {
    const row = document.createElement('tr');
    
    row.innerHTML = `
        <td>
            <div class="user-cell">
                <img src="${user.avatar_url || '../../images/default-avatar.jpg'}" alt="${user.username}">
                <span>${user.fullname || user.username}</span>
            </div>
        </td>
        <td>${user.email}</td>
        <td><span class="badge role-${user.role}">${user.role}</span></td>
        <td>${new Date(user.created_at).toLocaleDateString()}</td>
        <td><span class="badge status-active">Active</span></td>
        <td>
            <button class="btn-icon" title="View Details" onclick="viewUserDetails('${user.id}')">
                <i class="fas fa-eye"></i>
            </button>
        </td>
    `;
    
    return row;
}

// Function to display users
async function displayUsers() {
    const usersTableBody = document.getElementById('usersTableBody');
    usersTableBody.innerHTML = '<tr><td colspan="6" class="loading">Loading users...</td></tr>';
    
    const users = await fetchUsers();
    updateUserStats(users);
    
    // Apply filters
    const roleFilter = document.getElementById('roleFilter').value;
    const sortFilter = document.getElementById('sortFilter').value;
    const searchQuery = document.getElementById('userSearch').value.toLowerCase();
    
    let filteredUsers = users;
    
    // Apply role filter
    if (roleFilter !== 'all') {
        filteredUsers = filteredUsers.filter(user => user.role === roleFilter);
    }
    
    // Apply search filter
    if (searchQuery) {
        filteredUsers = filteredUsers.filter(user => 
            user.username.toLowerCase().includes(searchQuery) ||
            user.email.toLowerCase().includes(searchQuery) ||
            (user.fullname && user.fullname.toLowerCase().includes(searchQuery))
        );
    }
    
    // Apply sorting
    filteredUsers.sort((a, b) => {
        switch (sortFilter) {
            case 'newest':
                return new Date(b.created_at) - new Date(a.created_at);
            case 'oldest':
                return new Date(a.created_at) - new Date(b.created_at);
            case 'name':
                return (a.fullname || a.username).localeCompare(b.fullname || b.username);
            default:
                return 0;
        }
    });
    
    usersTableBody.innerHTML = '';
    filteredUsers.forEach(user => {
        usersTableBody.appendChild(createUserRow(user));
    });
}

// Function to view user details
async function viewUserDetails(userId) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`https://thebooktown-new-1.onrender.com/api/users/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user details');
        }

        const data = await response.json();
        const user = data.user;

        // Populate the details modal
        document.getElementById('userAvatar').src = user.avatar_url || '../../images/default-avatar.jpg';
        document.getElementById('userName').textContent = user.fullname || user.username;
        document.getElementById('userEmail').textContent = user.email;
        document.getElementById('userRole').textContent = user.role;
        document.getElementById('userJoined').textContent = new Date(user.created_at).toLocaleDateString();
        document.getElementById('userStatus').textContent = 'Active';
        document.getElementById('userBooks').textContent = user.books_count || '0';
        document.getElementById('userLastActive').textContent = new Date(user.last_active || user.created_at).toLocaleDateString();

        // Show the modal
        const modal = document.getElementById('userDetailsModal');
        modal.classList.add('active');
    } catch (error) {
        console.error('Error fetching user details:', error);
        showToast('Error fetching user details: ' + error.message, 'error');
    }
}

// Function to close modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
}

// Function to show toast notifications
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    displayUsers();
    
    // Add event listeners for filters
    document.getElementById('roleFilter').addEventListener('change', displayUsers);
    document.getElementById('sortFilter').addEventListener('change', displayUsers);
    
    // Add event listener for search
    document.getElementById('userSearch').addEventListener('input', displayUsers);

    // Close modals when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
            event.target.classList.remove('active');
        }
    });
}); 