function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

function getProperties() {
    return JSON.parse(localStorage.getItem('properties') || '[]');
}

function renderPropertyDetails() {
    const id = getQueryParam('id');
    const property = getProperties().find(p => p.id === id);
    const details = document.getElementById('propertyDetails');
    if (!property) {
        details.innerHTML = '<p>Property not found.</p>';
        return;
    }
    const sessionUser = window.ClerkAuth.isSignedIn() ? {
        email: window.ClerkAuth.getUserEmail(),
        username: window.ClerkAuth.getUserName(),
        id: window.ClerkAuth.getUserId()
    } : null;
    const isAdmin = window.ClerkAuth.isAdmin();
    details.innerHTML = `
        <div class="property-card" style="max-width:600px;margin:2rem auto;">
            <img src="${property.image || 'https://via.placeholder.com/400x180?text=No+Image'}" alt="Property image" onerror="this.onerror=null;this.src='https://via.placeholder.com/400x180?text=No+Image';">
            <div class="property-card-content">
                <div class="property-card-title">${property.title}</div>
                <div class="property-card-location">${property.location}</div>
                <div class="property-card-price">$<span id="propPrice">${property.price}</span></div>
                ${isAdmin ? `
                <div style="margin-top:0.75rem;display:flex;gap:0.5rem;align-items:center;">
                    <input type="number" id="newPrice" placeholder="New price" style="max-width:160px;">
                    <button id="updatePriceBtn" class="property-card-btn">Update Price</button>
                    <span id="priceMsg" style="margin-left:0.5rem;font-size:0.9rem;"></span>
                </div>` : ''}
                ${(!sessionUser || isAdmin) ? '' : `
                <div style="display:flex;gap:0.5rem;margin-top:0.75rem;">
                    <button class="property-card-btn" id="likeBtn">Like</button>
                    <button class="property-card-btn" id="buyBtn">Add to Buy</button>
                </div>`}
                <div class="property-card-desc">${property.description}</div>
                <div style="margin-top:1rem;color:#888;font-size:0.95rem;">Posted by: ${property.owner || 'Unknown'}</div>
            </div>
        </div>
    `;
    if (isAdmin) {
        const btn = document.getElementById('updatePriceBtn');
        btn.addEventListener('click', function() {
            const input = document.getElementById('newPrice');
            const msg = document.getElementById('priceMsg');
            const value = parseFloat(input.value);
            if (isNaN(value) || value <= 0) {
                msg.textContent = 'Enter a valid positive price.';
                msg.style.color = '#e74c3c';
                return;
            }
            const all = getProperties();
            const idx = all.findIndex(p => p.id === id);
            if (idx === -1) return;
            all[idx].price = value;
            localStorage.setItem('properties', JSON.stringify(all));
            document.getElementById('propPrice').textContent = value;
            msg.textContent = 'Price updated.';
            msg.style.color = '#1a9c3c';
        });
    }
    if (sessionUser && !isAdmin) {
        const likeBtn = document.getElementById('likeBtn');
        const buyBtn = document.getElementById('buyBtn');
        if (likeBtn) likeBtn.addEventListener('click', function() {
            const key = 'likes_' + sessionUser.email;
            const likes = JSON.parse(localStorage.getItem(key) || '[]');
            const idx = likes.indexOf(id);
            if (idx >= 0) likes.splice(idx, 1); else likes.push(id);
            localStorage.setItem(key, JSON.stringify(likes));
            alert(idx >= 0 ? 'Removed from likes' : 'Added to likes');
        });
        if (buyBtn) buyBtn.addEventListener('click', function() {
            const requests = JSON.parse(localStorage.getItem('buyRequests') || '[]');
            const exists = requests.some(r => r.propertyId === id && r.userEmail === sessionUser.email);
            if (!exists) {
                requests.push({ propertyId: id, userEmail: sessionUser.email, userName: sessionUser.username || sessionUser.email, timestamp: Date.now(), status: 'requested' });
                localStorage.setItem('buyRequests', JSON.stringify(requests));
            }
            alert('Added to buy requests');
        });
    }
}

// --- Navbar logic ---
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

document.addEventListener('DOMContentLoaded', async function() {
    await window.ClerkAuth.initialize();
    updateNavbar();
    renderPropertyDetails();
    window.ClerkAuth.onAuthStateChange(() => {
        updateNavbar();
    });
});
