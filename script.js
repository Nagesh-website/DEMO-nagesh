const API_URL = 'https://jsonplaceholder.typicode.com/users';
const userTableBody = document.getElementById('userTableBody');
const userFormModal = document.getElementById('userFormModal');
const userForm = document.getElementById('userForm');
const closeModal = document.querySelector('.close');
const addUserBtn = document.getElementById('addUserBtn');
const formTitle = document.getElementById('formTitle');
const messageBox = document.createElement('div'); // Success message container
document.body.appendChild(messageBox);
messageBox.classList.add('message-box');

let users = []; // Local copy of users
let editingUserId = null;

// Fetch users and store locally
async function fetchUsers() {
    try {
        const response = await fetch(API_URL);
        users = await response.json(); // Store in local array
        renderUsers(); // Display users from local copy
    } catch (error) {
        alert('Failed to fetch users');
    }
}

// Render users from local array
function renderUsers() {
    userTableBody.innerHTML = '';
    users.forEach(user => addUserRow(user));
}

// Add user row to table
function addUserRow(user) {
    const row = document.createElement('tr');
    row.setAttribute('data-id', user.id);
    row.innerHTML = `
        <td>${user.id}</td>
        <td>${user.name.split(' ')[0]}</td>
        <td>${user.name.split(' ')[1] || ''}</td>
        <td>${user.email}</td>
        <td>${user.company.name}</td>
        <td>
            <button onclick="editUser(${user.id})">Edit</button>
            <button onclick="deleteUser(${user.id})">Delete</button>
        </td>
    `;
    userTableBody.appendChild(row);
}

// Show modal form
function showUserForm(edit = false, user = null) {
    userFormModal.style.display = 'flex';
    if (edit) {
        editingUserId = user.id;
        formTitle.textContent = 'Edit User';
        document.getElementById('userId').value = user.id;
        document.getElementById('firstName').value = user.name.split(' ')[0];
        document.getElementById('lastName').value = user.name.split(' ')[1] || '';
        document.getElementById('email').value = user.email;
        document.getElementById('department').value = user.company.name;
    } else {
        formTitle.textContent = 'Add User';
        userForm.reset();
        editingUserId = null;
    }
}

// Hide modal
closeModal.onclick = () => (userFormModal.style.display = 'none');

// Show success message
function showMessage(message) {
    messageBox.textContent = message;
    messageBox.style.display = 'block';
    setTimeout(() => (messageBox.style.display = 'none'), 3000);
}

// Add or Edit user
userForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const user = {
        id: editingUserId || Date.now(), // Use Date.now() for fake ID if adding new user
        name: `${document.getElementById('firstName').value} ${document.getElementById('lastName').value}`,
        email: document.getElementById('email').value,
        company: { name: document.getElementById('department').value }
    };

    try {
        if (editingUserId) {
            // Update user in API
            const response = await fetch(`${API_URL}/${editingUserId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user)
            });

            // if (response.ok) {
                // Update user in local array
                users = users.map(u => (u.id === editingUserId ? user : u));
                renderUsers();
                showMessage('User updated successfully!');
            // }
        } else {
            // Add user to API
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user)
            });

            if (response.ok) {
                // Add user to local array
                users.push(user);
                renderUsers();
                showMessage('User added successfully!');
            }
        }

        userFormModal.style.display = 'none';
    } catch (error) {
        alert('Error saving user');
    }
});

// Edit user
async function editUser(userId) {
    const user = users.find(u => u.id === userId);
    if (user) {
        showUserForm(true, user);
    } else {
        alert('User not found');
    }
}

// Delete user
async function deleteUser(userId) {
    if (!confirm('Are you sure?')) return;

    try {
        const response = await fetch(`${API_URL}/${userId}`, { method: 'DELETE' });

        if (response.ok) {
            // Remove user from local array
            users = users.filter(user => user.id !== userId);
            renderUsers();
            showMessage('User deleted successfully!');
        }
    } catch (error) {
        alert('Error deleting user');
    }
}

// Show add user form
addUserBtn.addEventListener('click', () => showUserForm());

// Load users on page load
fetchUsers();
