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

function setActiveRole(role) {
    const userBtn = document.getElementById('userLoginBtn');
    const adminBtn = document.getElementById('adminLoginBtn');
    const roleInput = document.getElementById('loginRole');
    roleInput.value = role;
    if (role === 'admin') {
        adminBtn.classList.add('active');
        userBtn.classList.remove('active');
    } else {
        userBtn.classList.add('active');
        adminBtn.classList.remove('active');
    }
}

const userLoginBtn = document.getElementById('userLoginBtn');
const adminLoginBtn = document.getElementById('adminLoginBtn');
if (userLoginBtn && adminLoginBtn) {
    userLoginBtn.addEventListener('click', function() { setActiveRole('user'); });
    adminLoginBtn.addEventListener('click', function() { setActiveRole('admin'); });
}

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const selectedRole = document.getElementById('loginRole').value;
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
        showMessage('Invalid email or password.');
        return;
    }
    // Determine role based on selection and stored user role
    let role = user.role || 'user';
    if (selectedRole === 'admin') {
        // Allow admin login only if stored user is admin or email matches first saved user
        const firstUser = (users[0] && users[0].email) ? users[0].email : null;
        if (role === 'admin' || (firstUser && email === firstUser)) {
            role = 'admin';
        } else {
            showMessage('This account is not authorized for admin login.');
            return;
        }
    }
    localStorage.setItem('sessionUser', JSON.stringify({ email: user.email, username: user.username, role }));
    showMessage('Login successful! Redirecting...', '#1a9c3c');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
});

document.addEventListener('DOMContentLoaded', function() {
    updateNavbar();
    setActiveRole('user');
});
