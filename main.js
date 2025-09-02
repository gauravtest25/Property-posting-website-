// --- Navbar logic ---
function updateNavbar() {
    const user = JSON.parse(localStorage.getItem('sessionUser'));
    document.getElementById('loginLink').style.display = user ? 'none' : 'inline';
    document.getElementById('signupLink').style.display = user ? 'none' : 'inline';
    document.getElementById('logoutLink').style.display = user ? 'inline' : 'none';
    document.getElementById('dashboardLink').style.display = user ? 'inline' : 'none';
    // Only admins can access post page
    const postLink = document.getElementById('postLink');
    if (postLink) postLink.style.display = (user && user.role === 'admin') ? 'inline' : 'none';
}

// --- One-time admin migration (promote first saved user to admin) ---
function ensureAdminUser() {
    try {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        if (!Array.isArray(users) || users.length === 0) return;
        const hasAdmin = users.some(u => u && u.role === 'admin');
        if (!hasAdmin) {
            users[0].role = 'admin';
            localStorage.setItem('users', JSON.stringify(users));
            const sessionUser = JSON.parse(localStorage.getItem('sessionUser') || 'null');
            if (sessionUser && sessionUser.email === users[0].email) {
                sessionUser.role = 'admin';
                localStorage.setItem('sessionUser', JSON.stringify(sessionUser));
            }
        }
    } catch (e) {
        // ignore
    }
}

document.getElementById('logoutLink').addEventListener('click', function(e) {
    e.preventDefault();
    localStorage.removeItem('sessionUser');
    updateNavbar();
    window.location.href = 'index.html';
});

// --- Mobile navbar toggle ---
document.getElementById('menuToggle').addEventListener('click', function() {
    document.getElementById('navLinks').classList.toggle('open');
});

// --- Property rendering ---
function getProperties() {
    return JSON.parse(localStorage.getItem('properties') || '[]');
}

function renderProperties(properties) {
    const list = document.getElementById('propertyList');
    if (!list) return;
    list.innerHTML = '';
    if (properties.length === 0) {
        list.innerHTML = '<p>No properties found.</p>';
        return;
    }
    const sessionUser = getCurrentUser();
    properties.forEach(prop => {
        const card = document.createElement('div');
        card.className = 'property-card';
        const actions = (!sessionUser || sessionUser.role === 'admin') ? '' : `
                <div style="display:flex;gap:0.5rem;margin-top:0.5rem;">
                    <button class="property-card-btn" data-like="${prop.id}">Like</button>
                    <button class="property-card-btn" data-buy="${prop.id}">Add to Buy</button>
                </div>`;
        card.innerHTML = `
            <img src="${prop.image || 'https://via.placeholder.com/400x180?text=No+Image'}" alt="Property image" onerror="this.onerror=null;this.src='https://via.placeholder.com/400x180?text=No+Image';">
            <div class="property-card-content">
                <div class="property-card-title">${prop.title}</div>
                <div class="property-card-location">${prop.location}</div>
                <div class="property-card-price">$${prop.price}</div>
                <div class="property-card-desc">${prop.description.slice(0, 60)}...</div>
                <button class="property-card-btn" onclick="viewProperty('${prop.id}')">View Details</button>
                ${actions}
            </div>
        `;
        list.appendChild(card);
    });
    // Wire buttons
    const likeBtns = list.querySelectorAll('[data-like]');
    likeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-like');
            const res = toggleLikeProperty(id);
            if (!res.ok) alert(res.message);
            else alert(res.liked ? 'Added to likes' : 'Removed from likes');
        });
    });
    const buyBtns = list.querySelectorAll('[data-buy]');
    buyBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-buy');
            const res = requestToBuy(id);
            if (!res.ok) alert(res.message); else alert('Added to buy requests');
        });
    });
}

function viewProperty(id) {
    window.location.href = `property.html?id=${id}`;
}

// --- Likes and Buy Requests helpers ---
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('sessionUser'));
}
function getUserLikes(email) {
    return JSON.parse(localStorage.getItem('likes_' + email) || '[]');
}
function setUserLikes(email, likes) {
    localStorage.setItem('likes_' + email, JSON.stringify(likes));
}
function toggleLikeProperty(propertyId) {
    const user = getCurrentUser();
    if (!user) return { ok: false, message: 'Login required.' };
    if (user.role === 'admin') return { ok: false, message: 'Admins cannot like properties.' };
    const likes = getUserLikes(user.email);
    const idx = likes.indexOf(propertyId);
    if (idx >= 0) likes.splice(idx, 1); else likes.push(propertyId);
    setUserLikes(user.email, likes);
    return { ok: true, liked: likes.includes(propertyId) };
}
function requestToBuy(propertyId) {
    const user = getCurrentUser();
    if (!user) return { ok: false, message: 'Login required.' };
    if (user.role === 'admin') return { ok: false, message: 'Admins cannot request to buy.' };
    const requests = JSON.parse(localStorage.getItem('buyRequests') || '[]');
    const exists = requests.some(r => r.propertyId === propertyId && r.userEmail === user.email);
    if (!exists) {
        requests.push({ propertyId, userEmail: user.email, userName: user.username || user.email, timestamp: Date.now(), status: 'requested' });
        localStorage.setItem('buyRequests', JSON.stringify(requests));
    }
    return { ok: true };
}

// --- Search logic ---
document.getElementById('searchForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const location = document.getElementById('searchLocation').value.trim().toLowerCase();
    const price = parseFloat(document.getElementById('searchPrice').value);
    let properties = getProperties();
    if (location) {
        properties = properties.filter(p => p.location.toLowerCase().includes(location));
    }
    if (!isNaN(price)) {
        properties = properties.filter(p => parseFloat(p.price) <= price);
    }
    renderProperties(properties);
});

// --- Demo data population ---
function populateDemoProperties() {
    if (localStorage.getItem('properties')) return;
    const demoProperties = [
        {
            id: 'prop_1',
            title: 'Modern Apartment in City Center',
            price: 1200,
            location: 'New York',
            description: 'A beautiful modern apartment located in the heart of New York City. Close to all amenities and public transport.',
            image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
            owner: 'demo'
        },
        {
            id: 'prop_2',
            title: 'Cozy Cottage Retreat',
            price: 800,
            location: 'Vermont',
            description: 'Escape to this cozy cottage surrounded by nature. Perfect for a peaceful getaway or remote work.',
            image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80',
            owner: 'demo'
        },
        {
            id: 'prop_3',
            title: 'Luxury Villa with Pool',
            price: 3500,
            location: 'Los Angeles',
            description: 'Experience luxury living in this spacious villa with a private pool and garden. Ideal for families.',
            image: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=400&q=80',
            owner: 'demo'
        },
        {
            id: 'prop_4',
            title: 'Downtown Studio Flat',
            price: 950,
            location: 'Chicago',
            description: 'A compact and stylish studio flat in downtown Chicago. Walking distance to shops and restaurants.',
            image: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=400&q=80',
            owner: 'demo'
        },
        {
            id: 'prop_5',
            title: 'Beachside Bungalow',
            price: 1800,
            location: 'Miami',
            description: 'Wake up to ocean views in this charming beachside bungalow. Steps from the sand and surf.',
            image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=400&q=80',
            owner: 'demo'
        },
        {
            id: 'prop_6',
            title: 'Suburban Family Home',
            price: 1600,
            location: 'Dallas',
            description: 'A spacious family home in a quiet suburb. Large backyard, garage, and great schools nearby.',
            image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
            owner: 'demo'
        },
        {
            id: 'prop_7',
            title: 'Mountain Cabin Escape',
            price: 1100,
            location: 'Denver',
            description: 'Rustic cabin in the mountains, perfect for hiking and outdoor adventures. Cozy fireplace included.',
            image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=400&q=80',
            owner: 'demo'
        },
        {
            id: 'prop_8',
            title: 'Penthouse with City View',
            price: 4000,
            location: 'San Francisco',
            description: 'Stunning penthouse apartment with panoramic city views. High-end finishes and rooftop access.',
            image: 'https://images.unsplash.com/photo-1460474647541-4edd0cd0c746?auto=format&fit=crop&w=400&q=80',
            owner: 'demo'
        },
        {
            id: 'prop_9',
            title: 'Historic Townhouse',
            price: 2100,
            location: 'Boston',
            description: 'Charming historic townhouse with modern updates. Walk to parks, cafes, and museums.',
            image: 'https://images.unsplash.com/photo-1430285561322-7808604715df?auto=format&fit=crop&w=400&q=80',
            owner: 'demo'
        },
        {
            id: 'prop_10',
            title: 'Country Farmhouse',
            price: 1300,
            location: 'Nashville',
            description: 'Spacious farmhouse with acres of land. Enjoy the tranquility of country living close to the city.',
            image: 'https://images.unsplash.com/photo-1464029902023-f42eba355bde?auto=format&fit=crop&w=400&q=80',
            owner: 'demo'
        }
    ];
    localStorage.setItem('properties', JSON.stringify(demoProperties));
}

// --- On page load ---
document.addEventListener('DOMContentLoaded', function() {
    populateDemoProperties();
    ensureAdminUser();
    updateNavbar();
    
    const messageDiv = document.getElementById('message');
    const searchForm = document.getElementById('searchForm');
    const propertyList = document.getElementById('propertyList');
    const heroImageContainer = document.getElementById('heroImageContainer');
    
    const user = JSON.parse(localStorage.getItem('sessionUser'));
    if (!user) {
        messageDiv.textContent = 'Please log in or sign up to view property listings.';
        messageDiv.style.color = '#e74c3c';
        if (searchForm) searchForm.style.display = 'none';
        if (propertyList) propertyList.style.display = 'none';
        if (heroImageContainer) heroImageContainer.style.display = 'block';
        return;
    } else {
        if (searchForm) searchForm.style.display = '';
        if (propertyList) propertyList.style.display = '';
        if (heroImageContainer) heroImageContainer.style.display = 'none';
        messageDiv.textContent = '';
    }
    renderProperties(getProperties());
});

// --- Voice Search Integration ---
const voiceBtn = document.getElementById('voiceSearchBtn');
const voiceStatus = document.getElementById('voiceStatus');
if (voiceBtn && window.SpeechRecognition || window.webkitSpeechRecognition) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    voiceBtn.addEventListener('click', function() {
        voiceStatus.textContent = 'Listening...';
        recognition.start();
    });

    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript.toLowerCase();
        voiceStatus.textContent = 'Heard: "' + transcript + '"';
        // Try to extract price and location
        let location = '';
        let price = '';
        // e.g. "property in new york under 2000"
        const priceMatch = transcript.match(/under (\d+)/);
        if (priceMatch) price = priceMatch[1];
        // Try to extract location (words after 'in' or 'at')
        const locMatch = transcript.match(/in ([a-zA-Z ]+)/) || transcript.match(/at ([a-zA-Z ]+)/);
        if (locMatch) location = locMatch[1].replace(/ under.*/, '').trim();
        // Fallback: if user says only a city or only a price
        if (!location && !price) {
            if (/\d+/.test(transcript)) price = transcript.match(/\d+/)[0];
            else location = transcript;
        }
        document.getElementById('searchLocation').value = location;
        document.getElementById('searchPrice').value = price;
        // Trigger search
        document.getElementById('searchForm').dispatchEvent(new Event('submit'));
    };
    recognition.onerror = function(event) {
        voiceStatus.textContent = 'Voice error: ' + event.error;
    };
    recognition.onend = function() {
        setTimeout(() => { voiceStatus.textContent = ''; }, 2000);
    };
} else if (voiceBtn) {
    voiceBtn.style.display = 'none';
    if (voiceStatus) voiceStatus.textContent = 'Voice search not supported.';
} 