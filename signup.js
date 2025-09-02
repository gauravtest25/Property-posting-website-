function updateNavbar() {
    const user = JSON.parse(localStorage.getItem('sessionUser'));
    document.getElementById('loginLink').style.display = user ? 'none' : 'inline';
    document.getElementById('signupLink').style.display = user ? 'none' : 'inline';
    document.getElementById('logoutLink').style.display = user ? 'inline' : 'none';
    document.getElementById('dashboardLink').style.display = user ? 'inline' : 'none';
    const postLink = document.getElementById('postLink');
    if (postLink) postLink.style.display = (user && user.role === 'admin') ? 'inline' : 'none';
}

document.getElementById('logoutLink').addEventListener('click', function(e) {
    e.preventDefault();
    localStorage.removeItem('sessionUser');
    updateNavbar();
    window.location.href = 'index.html';
});

document.getElementById('menuToggle').addEventListener('click', function() {
    document.getElementById('navLinks').classList.toggle('open');
});

function showMessage(msg, color = '#e74c3c') {
    const m = document.getElementById('message');
    m.textContent = msg;
    m.style.color = color;
}

function setActiveSignupRole(role) {
    const userBtn = document.getElementById('userSignupBtn');
    const adminBtn = document.getElementById('adminSignupBtn');
    const roleInput = document.getElementById('signupRole');
    roleInput.value = role;
    if (role === 'admin') {
        adminBtn.classList.add('active');
        userBtn.classList.remove('active');
    } else {
        userBtn.classList.add('active');
        adminBtn.classList.remove('active');
    }
}

const userSignupBtn = document.getElementById('userSignupBtn');
const adminSignupBtn = document.getElementById('adminSignupBtn');
if (userSignupBtn && adminSignupBtn) {
    userSignupBtn.addEventListener('click', function() { setActiveSignupRole('user'); });
    adminSignupBtn.addEventListener('click', function() { setActiveSignupRole('admin'); });
}

document.getElementById('signupForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('signupUsername').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    const wantedRole = document.getElementById('signupRole').value;

    if (!username || !email || !password || !confirmPassword) {
        showMessage('All fields are required.');
        return;
    }
    if (password !== confirmPassword) {
        showMessage('Passwords do not match.');
        return;
    }

    let users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.some(u => u.email === email)) {
        showMessage('Email already registered.');
        return;
    }

    // Determine assigned role
    let role = 'user';
    if (wantedRole === 'admin') {
        // Security: allow admin signup only if this is the first ever user OR an existing admin is logged in
        const current = JSON.parse(localStorage.getItem('sessionUser') || 'null');
        const firstUserEmail = users[0] ? users[0].email : null;
        const allow = (users.length === 0) || (current && current.role === 'admin') || (firstUserEmail && email === firstUserEmail);
        if (!allow) {
            showMessage('Admin signup not allowed. Please contact an existing admin.');
            return;
        }
        role = 'admin';
    }

    users.push({ username, email, password, role });
    localStorage.setItem('users', JSON.stringify(users));
    showMessage('Signup successful! Redirecting to login...', '#1a9c3c');
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1200);
});

document.addEventListener('DOMContentLoaded', function() {
    updateNavbar();
    setActiveSignupRole('user');
});
