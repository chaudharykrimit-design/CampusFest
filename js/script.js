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

// Authentication Logic
async function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const data = await apiFetch('login', 'POST', { email, password });
        if (data.error) {
            alert(data.error); // This will now show the real error from the server
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

async function loadActivities() {
    const data = await apiFetch('activities');
    const container = document.getElementById('activitiesContainer');
    if (!container) return;
    
    container.innerHTML = data.map(act => `
        <div class="card">
            <div class="image-wrapper">
                <img src="https://images.unsplash.com/featured/?${encodeURIComponent(act.title.split(' ')[0])},event" alt="${act.title}">
            </div>
            <div class="card-body">
                <h3>${act.title}</h3>
                <p style="font-size: 0.85rem; color: var(--text-dim); margin-bottom: 5px;">Date: ${act.date}</p>
                <p style="font-size: 0.85rem; margin-bottom: 15px;">${act.description}</p>
                <button onclick="registerEvent('${act.title}')">
                    Register Now <i class="fas fa-paper-plane" style="margin-left: 5px;"></i>
                </button>
            </div>
        </div>
    `).join('') || '<p>No activities scheduled.</p>';
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