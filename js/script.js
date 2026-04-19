// API helper functions
async function apiFetch(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' }
    };
    if (body) options.body = JSON.stringify(body);
    
    const response = await fetch(`/api/${endpoint}`, options);
    return await response.json();
}

function toggleAuth() {
    const card = document.querySelector('.login-card');
    const isLogin = card.querySelector('h1').innerText === 'Welcome Back';
    
    if (isLogin) {
        card.querySelector('h1').innerText = 'Create Account';
        card.querySelector('p').innerText = 'Join ASPIRE 2026 Today';
        card.querySelector('.form-group').insertAdjacentHTML('afterbegin', '<input id="regUserName" type="text" placeholder="Full Name">');
        card.querySelector('button').innerHTML = 'Sign Up <i class="fas fa-user-plus" style="margin-left: 8px;"></i>';
        card.querySelector('button').onclick = signup;
        card.querySelector('p:last-of-type').innerHTML = 'Already have an account? <a href="#" onclick="toggleAuth()" style="color: var(--primary); text-decoration: none;">Login</a>';
    } else {
        card.querySelector('h1').innerText = 'Welcome Back';
        card.querySelector('p').innerText = 'Login to access your festival dashboard';
        card.querySelector('#regUserName').remove();
        card.querySelector('button').innerHTML = 'Sign In <i class="fas fa-arrow-right" style="margin-left: 8px;"></i>';
        card.querySelector('button').onclick = login;
        card.querySelector('p:last-of-type').innerHTML = 'Don\'t have an account? <a href="#" onclick="toggleAuth()" style="color: var(--primary); text-decoration: none;">Sign Up</a>';
    }
}

async function signup() {
    const name = document.getElementById('regUserName').value;
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const data = await apiFetch('signup', 'POST', { name, email, password });
    if (data.error) {
        alert(data.error);
    } else {
        alert("Account Created! You can now login.");
        toggleAuth();
    }
}

async function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const data = await apiFetch('login', 'POST', { email, password });
        if (data.error) {
            alert(data.error);
        } else {
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = data.user.role === 'admin' ? 'admin.html' : 'dashboard.html';
        }
    } catch (err) {
        alert("Network Error: Could not connect to the server.");
    }
}

function logout() {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

function checkAuth() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user && !window.location.pathname.endsWith('index.html')) {
        window.location.href = 'index.html';
    }
    return user;
}

function checkAdmin() {
    const user = checkAuth();
    if (user.role !== 'admin') {
        window.location.href = 'dashboard.html';
    }
}

// Event Registration
function registerEvent(eventName) {
    localStorage.setItem("eventName", eventName);
    window.location.href = "register.html";
}

async function submitRegistration() {
    const user = checkAuth();
    const registration = {
        name: document.getElementById('regName').value,
        enrollment: document.getElementById('regEnrollment').value,
        phone: document.getElementById('regPhone').value,
        email: document.getElementById('regEmail').value,
        house: document.getElementById('regHouse').value,
        event: document.getElementById('eventField').value,
        userId: user.id
    };

    const data = await apiFetch('register', 'POST', registration);
    if (data.message) {
        alert("Registration Successful!");
        window.location.href = "activities.html";
    }
}

// Data Loading Functions
async function loadDashboard() {
    const data = await apiFetch('announcements');
    const container = document.getElementById('highlightsSection');
    if (!container) return;
    
    let html = '<h2 class="section-title"><i class="fas fa-star" style="color: #fbbf24;"></i> Upcoming Highlights</h2>';
    data.slice(0, 3).forEach(ann => {
        html += `
            <div class="announcement">
                <div class="announcement-icon"><i class="fas fa-info-circle"></i></div>
                <div><strong>${ann.title}:</strong> ${ann.content}</div>
            </div>
        `;
    });
    container.innerHTML = html;
}

async function loadActivities(filter = 'All') {
    // Update active button
    document.querySelectorAll('.admin-nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.innerText === filter || (filter === 'All' && btn.innerText === 'All Events')) {
            btn.classList.add('active');
        }
    });

    const data = await apiFetch('activities');
    const container = document.getElementById('activitiesContainer');
    if (!container) return;
    
    const filteredData = filter === 'All' ? data : data.filter(act => act.type === filter);

    container.innerHTML = filteredData.map(act => `
        <div class="card animate">
            <div class="image-wrapper">
                <img src="https://source.unsplash.com/featured/?${encodeURIComponent(act.title.split(' ')[0])},${act.type}" alt="${act.title}">
                <div style="position: absolute; top: 15px; right: 15px; background: var(--primary); padding: 5px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700;">${act.type}</div>
            </div>
            <div class="card-body">
                <h3 style="margin-bottom: 10px;">${act.title}</h3>
                <p style="font-size: 0.85rem; color: var(--accent); font-weight: 600; margin-bottom: 8px;"><i class="fas fa-calendar-alt"></i> ${act.date}</p>
                <p style="font-size: 0.9rem; color: var(--text-dim); margin-bottom: 20px; line-height: 1.5;">${act.description}</p>
                <button onclick="registerEvent('${act.title}')" style="width: 100%;">
                    Join Event <i class="fas fa-arrow-right" style="margin-left: 8px;"></i>
                </button>
            </div>
        </div>
    `).join('') || '<p>No activities found in this category.</p>';
}

async function loadScoreboard() {
    const data = await apiFetch('scoreboard');
    const tbody = document.querySelector('#scoreboardTable tbody');
    if (!tbody) return;

    const icons = { 'Agni': '🔥', 'Vayu': '🌪', 'Jal': '💧', 'Prithvi': '🌍', 'Antriksh': '🚀' };
    tbody.innerHTML = data.map((row, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${icons[row.houseName] || ''} ${row.houseName}</td>
            <td>${row.points}</td>
            <td><span style="color: ${index === 0 ? '#10b981' : (index === 1 ? '#6366f1' : 'var(--text-dim)')}; font-weight: 600;">
                ${index === 0 ? 'Leading' : (index === 1 ? 'Chasing' : 'Steady')}
            </span></td>
        </tr>
    `).join('');
}

async function loadSchedule() {
    const data = await apiFetch('schedule');
    const tbody = document.querySelector('#scheduleTable tbody');
    if (!tbody) return;
    tbody.innerHTML = data.map(item => `
        <tr>
            <td>${item.time}</td>
            <td>${item.event_name}</td>
            <td>${item.location}</td>
        </tr>
    `).join('') || '<tr><td colspan="3">No events scheduled.</td></tr>';
}

async function loadAnnouncements() {
    const data = await apiFetch('announcements');
    const container = document.getElementById('announcementsContainer');
    if (!container) return;
    container.innerHTML = data.map(ann => `
        <div class="announcement">
            <div class="announcement-icon"><i class="fas fa-info-circle"></i></div>
            <div>
                <strong>${ann.title}</strong><br>
                ${ann.content}<br>
                <small style="color: var(--text-dim);">${new Date(ann.createdAt).toLocaleDateString()}</small>
            </div>
        </div>
    `).join('') || '<p>No announcements yet.</p>';
}

// Admin Logic
async function loadAdminData(section) {
    if (section === 'registrations') {
        const data = await apiFetch('register');
        const tbody = document.querySelector('#registrationsTable tbody');
        tbody.innerHTML = data.map(reg => `
            <tr>
                <td>${reg.name}</td>
                <td>${reg.enrollment}</td>
                <td>${reg.house}</td>
                <td>${reg.event}</td>
                <td>${reg.phone}</td>
                <td><i class="fas fa-trash delete-btn"></i></td>
            </tr>
        `).join('');
    } else if (section === 'activities') {
        const data = await apiFetch('activities');
        const tbody = document.querySelector('#activitiesTable tbody');
        tbody.innerHTML = data.map(act => `
            <tr>
                <td>${act.title}</td>
                <td>${act.date}</td>
                <td><i class="fas fa-trash delete-btn" onclick="deleteItem('activities', '${act._id}')"></i></td>
            </tr>
        `).join('');
    } else if (section === 'announcements') {
        const data = await apiFetch('announcements');
        const tbody = document.querySelector('#announcementsTable tbody');
        tbody.innerHTML = data.map(ann => `
            <tr>
                <td>${ann.title}</td>
                <td>${new Date(ann.createdAt).toLocaleDateString()}</td>
                <td><i class="fas fa-trash delete-btn" onclick="deleteItem('announcements', '${ann._id}')"></i></td>
            </tr>
        `).join('');
    } else if (section === 'schedule') {
        const data = await apiFetch('schedule');
        const tbody = document.querySelector('#scheduleTableAdmin tbody');
        tbody.innerHTML = data.map(item => `
            <tr>
                <td>${item.event_name}</td>
                <td>${item.time}</td>
                <td>${item.location}</td>
                <td><i class="fas fa-trash delete-btn" onclick="deleteItem('schedule', '${item._id}')"></i></td>
            </tr>
        `).join('');
    } else if (section === 'scoreboard') {
        const data = await apiFetch('scoreboard');
        const tbody = document.querySelector('#scoreboardTableAdmin tbody');
        tbody.innerHTML = data.map(row => `
            <tr>
                <td>${row.houseName}</td>
                <td>${row.points}</td>
                <td><button onclick="updateScore('${row.houseName}')">Update</button></td>
            </tr>
        `).join('');
    }
}

async function deleteItem(type, id) {
    if (confirm("Are you sure?")) {
        await apiFetch(`${type}?id=${id}`, 'DELETE');
        loadAdminData(type);
    }
}

async function addActivity() {
    const activity = {
        title: document.getElementById('actTitle').value,
        description: document.getElementById('actDesc').value,
        date: document.getElementById('actDate').value
    };
    await apiFetch('activities', 'POST', activity);
    loadAdminData('activities');
}

async function addAnnouncement() {
    const ann = {
        title: document.getElementById('annTitle').value,
        content: document.getElementById('annContent').value
    };
    await apiFetch('announcements', 'POST', ann);
    loadAdminData('announcements');
}

async function addSchedule() {
    const item = {
        event_name: document.getElementById('schEvent').value,
        time: document.getElementById('schTime').value,
        location: document.getElementById('schLocation').value
    };
    await apiFetch('schedule', 'POST', item);
    loadAdminData('schedule');
}

async function updateScore(houseName) {
    const points = prompt(`Enter new points for ${houseName}:`);
    if (points !== null) {
        await apiFetch('scoreboard', 'POST', { houseName, points });
        loadAdminData('scoreboard');
    }
}

// Global initialization
window.onload = function() {
    const user = checkAuth();
    if (user && document.querySelector('.user-profile span')) {
        document.querySelector('.user-profile span').innerText = user.name;
    }

    // Load page specific data
    const path = window.location.pathname;
    if (path.endsWith('dashboard.html')) loadDashboard();
    if (path.endsWith('activities.html')) loadActivities();
    if (path.endsWith('scoreboard.html')) loadScoreboard();
    if (path.endsWith('schedule.html')) loadSchedule();
    if (path.endsWith('announcements.html')) loadAnnouncements();
    if (path.endsWith('register.html')) {
        const eventField = document.getElementById('eventField');
        if (eventField) eventField.value = localStorage.getItem('eventName') || '';
    }
    if (path.endsWith('admin.html')) loadAdminData('registrations');
}