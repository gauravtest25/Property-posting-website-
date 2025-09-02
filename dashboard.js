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

function getUser() {
    return JSON.parse(localStorage.getItem('sessionUser'));
}

function getProperties() {
    return JSON.parse(localStorage.getItem('properties') || '[]');
}

function getUserLikes(email) {
    return JSON.parse(localStorage.getItem('likes_' + email) || '[]');
}

function renderAdminBuyRequestsSection(root) {
    const requests = JSON.parse(localStorage.getItem('buyRequests') || '[]');
    const header = document.createElement('h3');
    header.textContent = 'Buy Requests';
    header.className = 'dashboard-section-title';
    header.id = 'adminBuyHeader';
    root.appendChild(header);

    const wrap = document.createElement('div');
    wrap.id = 'adminBuySection';
    root.appendChild(wrap);

    if (requests.length === 0) {
        const p = document.createElement('p');
        p.textContent = 'No buy requests yet.';
        wrap.appendChild(p);
        return;
    }
    const props = getProperties();
    const grid = document.createElement('section');
    grid.className = 'property-list';
    wrap.appendChild(grid);

    requests
        .sort((a,b) => b.timestamp - a.timestamp)
        .forEach(req => {
            const prop = props.find(p => p.id === req.propertyId);
            const card = document.createElement('div');
            card.className = 'property-card';
            card.innerHTML = `
                <img src="${(prop && prop.image) || 'https://via.placeholder.com/400x180?text=No+Image'}" alt="Property image" onerror="this.onerror=null;this.src='https://via.placeholder.com/400x180?text=No+Image';">
                <div class="property-card-content">
                    <div class="property-card-title">${prop ? prop.title : 'Unknown Property'}</div>
                    <div class="property-card-location">${prop ? prop.location : ''}</div>
                    <div class="property-card-price">$${prop ? prop.price : ''}</div>
                    <div class="property-card-desc">Requested by: ${req.userName} (${req.userEmail})</div>
                    <div style="font-size:0.9rem;color:#888;">${new Date(req.timestamp).toLocaleString()}</div>
                </div>
            `;
            grid.appendChild(card);
        });
}

function renderAdminLikedSection(root) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const props = getProperties();

    // Aggregate likes across all users -> { propertyId: [ {email, username} ] }
    const likesMap = {};
    users.forEach(u => {
        if (!u || !u.email) return;
        const likes = getUserLikes(u.email);
        likes.forEach(pid => {
            if (!likesMap[pid]) likesMap[pid] = [];
            likesMap[pid].push({ email: u.email, username: u.username || u.email });
        });
    });

    const header = document.createElement('h3');
    header.textContent = 'Liked Properties';
    header.className = 'dashboard-section-title';
    header.id = 'adminLikedHeader';
    root.appendChild(header);

    const wrap = document.createElement('div');
    wrap.id = 'adminLikedSection';
    root.appendChild(wrap);

    const propertyIds = Object.keys(likesMap);
    if (propertyIds.length === 0) {
        const p = document.createElement('p');
        p.textContent = 'No liked properties yet.';
        wrap.appendChild(p);
        return;
    }

    const grid = document.createElement('section');
    grid.className = 'property-list';
    wrap.appendChild(grid);

    propertyIds.forEach(pid => {
        const prop = props.find(p => p.id === pid);
        if (!prop) return;
        const usersWhoLiked = likesMap[pid];
        const likedCount = usersWhoLiked.length;
        const likedUsersLabel = usersWhoLiked.map(u => u.username || u.email).slice(0, 3).join(', ');
        const moreCount = likedCount > 3 ? ` and ${likedCount - 3} more` : '';
        const card = document.createElement('div');
        card.className = 'property-card';
        card.innerHTML = `
            <img src="${prop.image || 'https://via.placeholder.com/400x180?text=No+Image'}" alt="Property image" onerror="this.onerror=null;this.src='https://via.placeholder.com/400x180?text=No+Image';">
            <div class="property-card-content">
                <div class="property-card-title">${prop.title}</div>
                <div class="property-card-location">${prop.location}</div>
                <div class="property-card-price">$${prop.price}</div>
                <div class="property-card-desc">Liked by ${likedCount}: ${likedUsersLabel}${moreCount}</div>
                <div style="display:flex;gap:0.5rem;">
                    <button class="property-card-btn" onclick="viewProperty('${prop.id}')">View</button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function renderUserCart() {
    const user = getUser();
    const root = document.getElementById('userPropertyList');
    const props = getProperties();

    const likes = getUserLikes(user.email);
    const myRequests = (JSON.parse(localStorage.getItem('buyRequests') || '[]') || []).filter(r => r.userEmail === user.email);

    root.innerHTML = '';

    const tabs = document.getElementById('dashboardTabs');
    if (tabs) {
        tabs.style.display = 'flex';
        const likedBtn = document.getElementById('likedTabBtn');
        const buyBtn = document.getElementById('buyTabBtn');
        if (likedBtn) likedBtn.textContent = 'Liked';
        if (buyBtn) buyBtn.textContent = 'Added to Buy';
    }

    const likedHeader = document.createElement('h3');
    likedHeader.textContent = 'Liked Properties';
    likedHeader.className = 'dashboard-section-title';
    likedHeader.id = 'likedHeader';
    root.appendChild(likedHeader);
    const likedWrap = document.createElement('div');
    likedWrap.id = 'likedSection';
    root.appendChild(likedWrap);
    if (likes.length === 0) {
        const emptyLikes = document.createElement('p');
        emptyLikes.textContent = 'No liked properties yet.';
        likedWrap.appendChild(emptyLikes);
    } else {
        const likedGrid = document.createElement('section');
        likedGrid.className = 'property-list';
        likedWrap.appendChild(likedGrid);
        likes.forEach(id => {
            const prop = props.find(p => p.id === id);
            if (!prop) return;
            const card = document.createElement('div');
            card.className = 'property-card';
            card.innerHTML = `
                <img src="${prop.image || 'https://via.placeholder.com/400x180?text=No+Image'}" alt="Property image" onerror="this.onerror=null;this.src='https://via.placeholder.com/400x180?text=No+Image';">
                <div class="property-card-content">
                    <div class="property-card-title">${prop.title}</div>
                    <div class="property-card-location">${prop.location}</div>
                    <div class="property-card-price">$${prop.price}</div>
                    <div class="property-card-desc">${prop.description.slice(0, 60)}...</div>
                    <div style="display:flex;gap:0.5rem;">
                        <button class="property-card-btn" onclick="viewProperty('${prop.id}')">View</button>
                        <button class="property-card-btn" data-remove-like="${prop.id}" style="background:#e74c3c;">Remove</button>
                    </div>
                </div>
            `;
            likedGrid.appendChild(card);
        });
    }

    const requestHeader = document.createElement('h3');
    requestHeader.textContent = 'Added to Buy';
    requestHeader.className = 'dashboard-section-title';
    requestHeader.id = 'buyHeader';
    root.appendChild(requestHeader);
    const buyWrap = document.createElement('div');
    buyWrap.id = 'buySection';
    root.appendChild(buyWrap);

    if (myRequests.length === 0) {
        const emptyReq = document.createElement('p');
        emptyReq.textContent = 'No items added to buy yet.';
        buyWrap.appendChild(emptyReq);
    } else {
        const buyGrid = document.createElement('section');
        buyGrid.className = 'property-list';
        buyWrap.appendChild(buyGrid);
        myRequests.sort((a,b) => b.timestamp - a.timestamp).forEach(req => {
            const prop = props.find(p => p.id === req.propertyId);
            if (!prop) return;
            const card = document.createElement('div');
            card.className = 'property-card';
            card.innerHTML = `
                <img src="${prop.image || 'https://via.placeholder.com/400x180?text=No+Image'}" alt="Property image" onerror="this.onerror=null;this.src='https://via.placeholder.com/400x180?text=No+Image';">
                <div class="property-card-content">
                    <div class="property-card-title">${prop.title}</div>
                    <div class="property-card-location">${prop.location}</div>
                    <div class="property-card-price">$${prop.price}</div>
                    <div class="property-card-desc">Requested on: ${new Date(req.timestamp).toLocaleString()}</div>
                    <div style="display:flex;gap:0.5rem;">
                        <button class="property-card-btn" onclick="viewProperty('${prop.id}')">View</button>
                    </div>
                </div>
            `;
            buyGrid.appendChild(card);
        });
    }

    // Wire remove like
    root.querySelectorAll('[data-remove-like]').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-remove-like');
            const key = 'likes_' + user.email;
            const likes = JSON.parse(localStorage.getItem(key) || '[]');
            const idx = likes.indexOf(id);
            if (idx >= 0) {
                likes.splice(idx, 1);
                localStorage.setItem(key, JSON.stringify(likes));
                renderUserCart();
            }
        });
    });

    // Tab switching (user)
    const likedTabBtn = document.getElementById('likedTabBtn');
    const buyTabBtn = document.getElementById('buyTabBtn');
    function showLiked() {
        likedTabBtn.classList.add('active');
        buyTabBtn.classList.remove('active');
        document.getElementById('likedHeader').style.display = '';
        document.getElementById('likedSection').style.display = '';
        document.getElementById('buyHeader').style.display = 'none';
        document.getElementById('buySection').style.display = 'none';
    }
    function showBuy() {
        buyTabBtn.classList.add('active');
        likedTabBtn.classList.remove('active');
        document.getElementById('buyHeader').style.display = '';
        document.getElementById('buySection').style.display = '';
        document.getElementById('likedHeader').style.display = 'none';
        document.getElementById('likedSection').style.display = 'none';
    }
    if (likedTabBtn && buyTabBtn) {
        likedTabBtn.addEventListener('click', showLiked);
        buyTabBtn.addEventListener('click', showBuy);
        showLiked();
    }
}

function renderAdminDashboard() {
    const root = document.getElementById('userPropertyList');
    root.innerHTML = '';
    const tabs = document.getElementById('dashboardTabs');
    if (tabs) {
        tabs.style.display = 'flex';
        const likedBtn = document.getElementById('likedTabBtn');
        const buyBtn = document.getElementById('buyTabBtn');
        if (likedBtn) likedBtn.textContent = 'Liked';
        if (buyBtn) buyBtn.textContent = 'Buy Requests';
    }

    renderAdminLikedSection(root);
    renderAdminBuyRequestsSection(root);

    // Tab switching (admin)
    const likedTabBtn = document.getElementById('likedTabBtn');
    const buyTabBtn = document.getElementById('buyTabBtn');
    function showAdminLiked() {
        likedTabBtn.classList.add('active');
        buyTabBtn.classList.remove('active');
        document.getElementById('adminLikedHeader').style.display = '';
        document.getElementById('adminLikedSection').style.display = '';
        document.getElementById('adminBuyHeader').style.display = 'none';
        document.getElementById('adminBuySection').style.display = 'none';
    }
    function showAdminBuy() {
        buyTabBtn.classList.add('active');
        likedTabBtn.classList.remove('active');
        document.getElementById('adminBuyHeader').style.display = '';
        document.getElementById('adminBuySection').style.display = '';
        document.getElementById('adminLikedHeader').style.display = 'none';
        document.getElementById('adminLikedSection').style.display = 'none';
    }
    if (likedTabBtn && buyTabBtn) {
        likedTabBtn.addEventListener('click', showAdminLiked);
        buyTabBtn.addEventListener('click', showAdminBuy);
        showAdminBuy();
    }
}

function renderDashboard() {
    const user = getUser();
    const list = document.getElementById('userPropertyList');
    if (!user) {
        showMessage('You must be logged in to view your dashboard.');
        list.innerHTML = '';
        return;
    }
    if (user.role === 'admin') {
        showMessage('Admin dashboard', '#1a9c3c');
        renderAdminDashboard();
    } else {
        showMessage('Your cart', '#1a9c3c');
        renderUserCart();
    }
}

window.viewProperty = function(id) {
    window.location.href = `property.html?id=${id}`;
}

document.addEventListener('DOMContentLoaded', function() {
    updateNavbar();
    renderDashboard();
});
