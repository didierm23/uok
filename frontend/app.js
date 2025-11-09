// ========================================
// CONFIGURATION
// ========================================

// ✅ FIX: Auto-select correct backend depending on environment
const API_BASE_URL =
  window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api'
    : 'https://user-management-api-1-k4mo.onrender.com/api';

// ========================================
// STATE MANAGEMENT
// ========================================

let currentUser = null;
let authToken = null;

// ========================================
// INITIALIZE APP
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Application initialized');
  checkAuthStatus();
  setupEventListeners();
});

// ========================================
// CHECK AUTHENTICATION STATUS
// ========================================

function checkAuthStatus() {
  const token = localStorage.getItem('authToken');
  const user = localStorage.getItem('currentUser');

  if (token && user) {
    authToken = token;
    currentUser = JSON.parse(user);
    showAuthenticatedState();
  } else {
    showUnauthenticatedState();
  }
}

// ========================================
// SETUP EVENT LISTENERS
// ========================================

function setupEventListeners() {
  document.getElementById('nav-register').addEventListener('click', () => showSection('register'));
  document.getElementById('nav-login').addEventListener('click', () => showSection('login'));
  document.getElementById('nav-users').addEventListener('click', () => showSection('users'));
  document.getElementById('nav-logout').addEventListener('click', logout);

  document.getElementById('register-form').addEventListener('submit', handleRegister);
  document.getElementById('login-form').addEventListener('submit', handleLogin);

  document.getElementById('link-to-login').addEventListener('click', (e) => {
    e.preventDefault();
    showSection('login');
  });

  document.getElementById('link-to-register').addEventListener('click', (e) => {
    e.preventDefault();
    showSection('register');
  });

  document.getElementById('refresh-users').addEventListener('click', loadUsers);
}

// ========================================
// LOAD USERS (PROTECTED ROUTE)
// ========================================

async function loadUsers() {
  document.getElementById('loading-users').style.display = 'block';
  document.getElementById('users-container').style.display = 'none';
  document.getElementById('users-error').style.display = 'none';

  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json', // ✅ FIX: explicit type
        'Authorization': `Bearer ${authToken}`,
      },
    });

    // ✅ FIX: Guard against non-JSON or failed response
    let data = null;
    try {
      data = await response.json();
    } catch {
      throw new Error('Invalid JSON response from server.');
    }

    if (response.ok) {
      // ✅ FIX: Handle both {users, count} and plain [] responses
      const users = Array.isArray(data) ? data : data.users;
      const count = Array.isArray(data)
        ? data.length
        : data.count ?? (data.users ? data.users.length : 0);

      displayUsers(users, count);
    } else {
      if (response.status === 401) {
        showAlert('Session expired. Please login again.', 'error');
        logout();
      } else {
        throw new Error(data.error || `Server error: ${response.status}`);
      }
    }
  } catch (error) {
    console.error('Load users error:', error);
    document.getElementById('users-error').style.display = 'block';
    showAlert('Failed to load users. Please try again.', 'error'); // ✅ clearer message
  } finally {
    document.getElementById('loading-users').style.display = 'none';
  }
}

// ========================================
// REST OF YOUR CODE (unchanged)
// ========================================

// everything below (register, login, displayUsers, etc.) remains exactly the same.


// // ========================================
// // CONFIGURATION
// // ========================================

// // Base URL for API - Change this if your backend runs on different port
// const API_BASE_URL = 'http://localhost:3000/api';

// // ========================================
// // STATE MANAGEMENT
// // ========================================

// let currentUser = null;
// let authToken = null;

// // ========================================
// // INITIALIZE APP
// // ========================================

// document.addEventListener('DOMContentLoaded', () => {
//     console.log('🚀 Application initialized');
    
//     // Check if user is already logged in
//     checkAuthStatus();
    
//     // Set up event listeners
//     setupEventListeners();
// });

// // ========================================
// // CHECK AUTHENTICATION STATUS
// // ========================================

// function checkAuthStatus() {
//     // Get token from localStorage
//     const token = localStorage.getItem('authToken');
//     const user = localStorage.getItem('currentUser');
    
//     if (token && user) {
//         authToken = token;
//         currentUser = JSON.parse(user);
//         showAuthenticatedState();
//     } else {
//         showUnauthenticatedState();
//     }
// }

// // ========================================
// // SETUP EVENT LISTENERS
// // ========================================

// function setupEventListeners() {
//     // Navigation buttons
//     document.getElementById('nav-register').addEventListener('click', () => showSection('register'));
//     document.getElementById('nav-login').addEventListener('click', () => showSection('login'));
//     document.getElementById('nav-users').addEventListener('click', () => showSection('users'));
//     document.getElementById('nav-logout').addEventListener('click', logout);
    
//     // Form submissions
//     document.getElementById('register-form').addEventListener('submit', handleRegister);
//     document.getElementById('login-form').addEventListener('submit', handleLogin);
    
//     // Quick navigation links
//     document.getElementById('link-to-login').addEventListener('click', (e) => {
//         e.preventDefault();
//         showSection('login');
//     });
    
//     document.getElementById('link-to-register').addEventListener('click', (e) => {
//         e.preventDefault();
//         showSection('register');
//     });
    
//     // Refresh users button
//     document.getElementById('refresh-users').addEventListener('click', loadUsers);
// }

// // ========================================
// // NAVIGATION / SECTION MANAGEMENT
// // ========================================

// function showSection(section) {
//     // Hide all sections
//     document.getElementById('register-section').style.display = 'none';
//     document.getElementById('login-section').style.display = 'none';
//     document.getElementById('users-section').style.display = 'none';
    
//     // Remove active class from all nav buttons
//     document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    
//     // Show selected section and activate nav button
//     if (section === 'register') {
//         document.getElementById('register-section').style.display = 'block';
//         document.getElementById('nav-register').classList.add('active');
//     } else if (section === 'login') {
//         document.getElementById('login-section').style.display = 'block';
//         document.getElementById('nav-login').classList.add('active');
//     } else if (section === 'users') {
//         document.getElementById('users-section').style.display = 'block';
//         document.getElementById('nav-users').classList.add('active');
//         loadUsers(); // Load users when showing this section
//     }
// }

// // ========================================
// // AUTHENTICATION STATE MANAGEMENT
// // ========================================

// function showAuthenticatedState() {
//     // Show authenticated elements
//     document.getElementById('welcome-message').style.display = 'block';
//     document.getElementById('username-display').textContent = currentUser.username;
//     document.getElementById('nav-users').style.display = 'inline-block';
//     document.getElementById('nav-logout').style.display = 'inline-block';
    
//     // Hide unauthenticated elements
//     document.getElementById('nav-register').style.display = 'none';
//     document.getElementById('nav-login').style.display = 'none';
    
//     // Show users section
//     showSection('users');
// }

// function showUnauthenticatedState() {
//     // Hide authenticated elements
//     document.getElementById('welcome-message').style.display = 'none';
//     document.getElementById('nav-users').style.display = 'none';
//     document.getElementById('nav-logout').style.display = 'none';
    
//     // Show unauthenticated elements
//     document.getElementById('nav-register').style.display = 'inline-block';
//     document.getElementById('nav-login').style.display = 'inline-block';
    
//     // Show register section by default
//     showSection('register');
// }

// // ========================================
// // REGISTER HANDLER
// // ========================================

// async function handleRegister(e) {
//     e.preventDefault();
    
//     // Get form data
//     const username = document.getElementById('reg-username').value.trim();
//     const email = document.getElementById('reg-email').value.trim();
//     const password = document.getElementById('reg-password').value;
//     const confirmPassword = document.getElementById('reg-password-confirm').value;
    
//     // Client-side validation
//     if (password !== confirmPassword) {
//         showAlert('Passwords do not match!', 'error');
//         return;
//     }
    
//     if (password.length < 6) {
//         showAlert('Password must be at least 6 characters long', 'error');
//         return;
//     }
    
//     // Show loading state
//     setButtonLoading('register-form', true);
    
//     try {
//         // Make API call
//         const response = await fetch(`${API_BASE_URL}/users/register`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({ username, email, password })
//         });
        
//         const data = await response.json();
        
//         if (response.ok) {
//             // Success
//             showAlert('✅ Registration successful! Please login.', 'success');
            
//             // Clear form
//             document.getElementById('register-form').reset();
            
//             // Switch to login after 1.5 seconds
//             setTimeout(() => {
//                 showSection('login');
//                 // Pre-fill email in login form
//                 document.getElementById('login-email').value = email;
//             }, 1500);
//         } else {
//             // Error from server
//             showAlert(data.error || 'Registration failed', 'error');
//         }
//     } catch (error) {
//         console.error('Registration error:', error);
//         showAlert('❌ Network error. Please check if the server is running.', 'error');
//     } finally {
//         setButtonLoading('register-form', false);
//     }
// }

// // ========================================
// // LOGIN HANDLER
// // ========================================

// async function handleLogin(e) {
//     e.preventDefault();
    
//     // Get form data
//     const email = document.getElementById('login-email').value.trim();
//     const password = document.getElementById('login-password').value;
    
//     // Show loading state
//     setButtonLoading('login-form', true);
    
//     try {
//         // Make API call
//         const response = await fetch(`${API_BASE_URL}/users/login`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({ email, password })
//         });
        
//         const data = await response.json();
        
//         if (response.ok) {
//             // Success - save token and user data
//             authToken = data.token;
//             currentUser = data.user;
            
//             // Store in localStorage
//             localStorage.setItem('authToken', authToken);
//             localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
//             // Show success message
//             showAlert('✅ Login successful!', 'success');
            
//             // Clear form
//             document.getElementById('login-form').reset();
            
//             // Update UI to show authenticated state
//             setTimeout(() => {
//                 showAuthenticatedState();
//             }, 1000);
//         } else {
//             // Error from server
//             showAlert(data.error || 'Login failed', 'error');
//         }
//     } catch (error) {
//         console.error('Login error:', error);
//         showAlert('❌ Network error. Please check if the server is running.', 'error');
//     } finally {
//         setButtonLoading('login-form', false);
//     }
// }

// // ========================================
// // LOAD USERS (PROTECTED ROUTE)
// // ========================================

// async function loadUsers() {
//     // Show loading state
//     document.getElementById('loading-users').style.display = 'block';
//     document.getElementById('users-container').style.display = 'none';
//     document.getElementById('users-error').style.display = 'none';
    
//     try {
//         // Make API call with authentication token
//         const response = await fetch(`${API_BASE_URL}/users`, {
//             method: 'GET',
//             headers: {
//                 'Authorization': `Bearer ${authToken}`
//             }
//         });
        
//         const data = await response.json();
        
//         if (response.ok) {
//             // Success - display users
//             displayUsers(data.users, data.count);
//         } else {
//             // Error (likely token expired)
//             if (response.status === 401) {
//                 showAlert('Session expired. Please login again.', 'error');
//                 logout();
//             } else {
//                 throw new Error(data.error);
//             }
//         }
//     } catch (error) {
//         console.error('Load users error:', error);
//         document.getElementById('users-error').style.display = 'block';
//         showAlert('Failed to load users', 'error');
//     } finally {
//         document.getElementById('loading-users').style.display = 'none';
//     }
// }

// // ========================================
// // DISPLAY USERS
// // ========================================

// function displayUsers(users, count) {
//     // Show users container
//     document.getElementById('users-container').style.display = 'block';
    
//     // Update count
//     document.getElementById('total-users').textContent = count;
    
//     // Get users list container
//     const usersList = document.getElementById('users-list');
    
//     // Clear existing content
//     usersList.innerHTML = '';
    
//     // Check if there are users
//     if (!users || users.length === 0) {
//         usersList.innerHTML = '<p class="text-center">No users found.</p>';
//         return;
//     }
    
//     // Create user cards
//     users.forEach(user => {
//         const userCard = createUserCard(user);
//         usersList.appendChild(userCard);
//     });
// }

// // ========================================
// // CREATE USER CARD
// // ========================================

// function createUserCard(user) {
//     const card = document.createElement('div');
//     card.className = 'user-card';
    
//     // Get initials for avatar
//     const initials = user.username.substring(0, 2).toUpperCase();
    
//     // Format date
//     const createdDate = new Date(user.created_at).toLocaleDateString('en-US', {
//         year: 'numeric',
//         month: 'short',
//         day: 'numeric'
//     });
    
//     // Check if this is the current user
//     const isCurrentUser = currentUser && currentUser.id === user.id;
    
//     card.innerHTML = `
//         <div class="user-card-header">
//             <div class="user-avatar">${initials}</div>
//             <div class="user-info">
//                 <h4>${user.username} ${isCurrentUser ? '<span class="user-badge">You</span>' : ''}</h4>
//                 <div class="user-email">
//                     <span>📧</span>
//                     <span>${user.email}</span>
//                 </div>
//             </div>
//         </div>
//         <div class="user-meta">
//             <span>📅 Joined: ${createdDate}</span>
//             <span>🆔 ID: ${user.id}</span>
//         </div>
//     `;
    
//     return card;
// }

// // ========================================
// // LOGOUT
// // ========================================

// function logout() {
//     // Clear authentication data
//     authToken = null;
//     currentUser = null;
    
//     // Clear localStorage
//     localStorage.removeItem('authToken');
//     localStorage.removeItem('currentUser');
    
//     // Show alert
//     showAlert('Logged out successfully', 'success');
    
//     // Update UI
//     showUnauthenticatedState();
// }

// // ========================================
// // UTILITY FUNCTIONS
// // ========================================

// // Show alert message
// function showAlert(message, type = 'success') {
//     const alertBox = document.getElementById('alert-box');
//     const alertMessage = document.getElementById('alert-message');
    
//     alertMessage.textContent = message;
//     alertBox.className = `alert-box ${type}`;
//     alertBox.style.display = 'flex';
    
//     // Auto-hide after 5 seconds
//     setTimeout(() => {
//         closeAlert();
//     }, 5000);
// }

// // Close alert
// function closeAlert() {
//     document.getElementById('alert-box').style.display = 'none';
// }

// // Set button loading state
// function setButtonLoading(formId, isLoading) {
//     const form = document.getElementById(formId);
//     const button = form.querySelector('button[type="submit"]');
//     const btnText = button.querySelector('.btn-text');
//     const btnLoader = button.querySelector('.btn-loader');
    
//     if (isLoading) {
//         btnText.style.display = 'none';
//         btnLoader.style.display = 'flex';
//         button.disabled = true;
//     } else {
//         btnText.style.display = 'inline';
//         btnLoader.style.display = 'none';
//         button.disabled = false;
//     }
// }

// // ========================================
// // GLOBAL ERROR HANDLER
// // ========================================

// window.addEventListener('unhandledrejection', (event) => {
//     console.error('Unhandled promise rejection:', event.reason);
//     showAlert('An unexpected error occurred', 'error');
// });

// // ========================================
// // CONSOLE WELCOME MESSAGE
// // ========================================

// console.log('%c🚀 User Management System', 'color: #4f46e5; font-size: 24px; font-weight: bold;');
// console.log('%cAPI Base URL:', 'color: #64748b; font-weight: bold;', API_BASE_URL);
// console.log('%cMade with ❤️ using Node.js, Express, and PostgreSQL', 'color: #64748b;');
