function updateNavbar() {
    const isSignedIn = window.ClerkAuth.isSignedIn();
    const isAdmin = window.ClerkAuth.isAdmin();
    
    document.getElementById('loginLink').style.display = isSignedIn ? 'none' : 'inline';
    document.getElementById('signupLink').style.display = isSignedIn ? 'none' : 'inline';
    document.getElementById('logoutLink').style.display = 'none';
    document.getElementById('dashboardLink').style.display = isSignedIn ? 'inline' : 'none';
    
    const userButtonContainer = document.getElementById('userButtonContainer');
    if (userButtonContainer) {
        if (isSignedIn) {
            userButtonContainer.style.display = 'inline';
            userButtonContainer.innerHTML = '';
            window.ClerkAuth.mountUserButton(userButtonContainer);
        } else {
            userButtonContainer.style.display = 'none';
        }
    }
    
    const postLink = document.getElementById('postLink');
    if (postLink) postLink.style.display = isAdmin ? 'inline' : 'none';
}

document.getElementById('logoutLink').addEventListener('click', function(e) {
    e.preventDefault();
    window.ClerkAuth.signOut();
});

document.getElementById('menuToggle').addEventListener('click', function() {
    document.getElementById('navLinks').classList.toggle('open');
});

function showMessage(msg, color = '#e74c3c') {
    const m = document.getElementById('message');
    m.textContent = msg;
    m.style.color = color;
}

function getUser() {
    if (!window.ClerkAuth.isSignedIn()) return null;
    return {
        email: window.ClerkAuth.getUserEmail(),
        username: window.ClerkAuth.getUserName(),
        role: window.ClerkAuth.isAdmin() ? 'admin' : 'user',
        id: window.ClerkAuth.getUserId()
    };
}

document.addEventListener('DOMContentLoaded', async function() {
    await window.ClerkAuth.initialize();
    updateNavbar();
    
    const user = getUser();
    if (!user) {
        showMessage('You must be logged in to post a property.');
        document.getElementById('postForm').style.display = 'none';
        return;
    }
    if (user.role !== 'admin') {
        showMessage('Only admins can post properties.');
        document.getElementById('postForm').style.display = 'none';
        return;
    }
    
    window.ClerkAuth.onAuthStateChange(() => {
        updateNavbar();
    });
});

document.getElementById('postForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const user = getUser();
    if (!user) {
        showMessage('You must be logged in to post a property.');
        return;
    }
    if (user.role !== 'admin') {
        showMessage('Only admins can post properties.');
        return;
    }
    const title = document.getElementById('propertyTitle').value.trim();
    const price = document.getElementById('propertyPrice').value.trim();
    const location = document.getElementById('propertyLocation').value.trim();
    const description = document.getElementById('propertyDescription').value.trim();
    const imageInput = document.getElementById('propertyImage');
    if (!title || !price || !location || !description) {
        showMessage('All fields except image are required.');
        return;
    }
    const property = {
        id: 'prop_' + Date.now(),
        title,
        price,
        location,
        description,
        owner: user.username || user.email,
        ownerId: user.id,
        image: ''
    };
    function saveProperty(imgData) {
        property.image = imgData;
        let properties = JSON.parse(localStorage.getItem('properties') || '[]');
        properties.unshift(property);
        localStorage.setItem('properties', JSON.stringify(properties));
        showMessage('Property posted successfully!', '#1a9c3c');
        document.getElementById('postForm').reset();
    }
    if (imageInput.files && imageInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            saveProperty(e.target.result);
        };
        reader.readAsDataURL(imageInput.files[0]);
    } else {
        saveProperty('');
    }
});
