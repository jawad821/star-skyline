// Global State
let currentRange = 'today';
const API_BASE = window.location.origin + '/api';

// Auth
function checkAuth() {
  if (!localStorage.getItem('token')) window.location.href = '/dashboard/login.html';
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/dashboard/login.html';
}

// Init
document.addEventListener('DOMContentLoaded', init);
function init() {
  checkAuth();
  setupTheme();
  setupUserInfo();
  setupNavigation();
  loadDashboard();
}

// Theme
function setupTheme() {
  const isDark = localStorage.getItem('theme') === 'dark';
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  const toggle = document.getElementById('themeToggle');
  if (toggle) toggle.addEventListener('click', toggleTheme);
}

function toggleTheme() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
  localStorage.setItem('theme', isDark ? 'light' : 'dark');
}

// User Info
function setupUserInfo() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  document.querySelectorAll('[class*="user-info"], [class*="user-name"]').forEach(el => {
    if (el) el.textContent = user.username || 'User';
  });
}

// Navigation
function setupNavigation() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      const page = this.getAttribute('data-page');
      if (page) navigateToPage(page);
    });
  });
}

function navigateToPage(page) {
  document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
  const active = document.querySelector('[data-page="' + page + '"]');
  if (active) active.classList.add('active');
  
  document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
  const pageEl = document.getElementById('page-' + page);
  if (pageEl) {
    pageEl.style.display = 'block';
    if (page === 'drivers-all') loadDrivers();
    else if (page === 'cars-all') loadVehicles();
    else if (page === 'bookings') loadBookings();
    else if (page === 'kpi') loadKPI();
  }
}

// Dashboard - Load Stats
async function loadDashboard() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(API_BASE + '/stats/summary?range=today', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.data) {
        const d = data.data;
        const stat = (id, val) => {
          const el = document.getElementById(id);
          if (el) el.textContent = val;
        };
        stat('stat-bookings', d.total_bookings || 0);
        stat('stat-completed', d.completed_bookings || 0);
        stat('stat-pending', d.pending_bookings || 0);
        stat('stat-cancelled', d.cancelled_bookings || 0);
        stat('stat-revenue', 'AED ' + ((d.total_revenue || 0).toFixed(2)));
        stat('stat-cash', 'AED ' + ((d.cash_revenue || 0).toFixed(2)));
        stat('stat-card', 'AED ' + ((d.card_revenue || 0).toFixed(2)));
      }
    }
  } catch (e) {
    console.log('Dashboard error:', e);
  }
}

// KPI Page
async function loadKPI() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(API_BASE + '/stats/summary?range=today', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.data) {
        const d = data.data;
        const totalRev = d.total_revenue || 0;
        const vendorComm = totalRev * 0.8;
        const profit = totalRev * 0.2;
        
        const stat = (id, val) => {
          const el = document.getElementById(id);
          if (el) el.textContent = val;
        };
        
        stat('kpi-total-revenue', 'AED ' + (totalRev.toFixed(2)));
        stat('kpi-vendor-commission', 'AED ' + (vendorComm.toFixed(2)));
        stat('kpi-company-profit', 'AED ' + (profit.toFixed(2)));
        stat('kpi-profit-margin', (((profit / totalRev) * 100) || 0).toFixed(1) + '%');
      }
    }
  } catch (e) {
    console.log('KPI error:', e);
  }
}

// Drivers
async function loadDrivers() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(API_BASE + '/drivers', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    
    if (response.ok) {
      const data = await response.json();
      const tbody = document.getElementById('drivers-table-body');
      if (!tbody) return;
      
      if (!data.data || !data.data.length) {
        tbody.innerHTML = '<tr><td colspan="7">No drivers</td></tr>';
        return;
      }
      
      tbody.innerHTML = data.data.map(d => '<tr><td>' + d.id.substring(0, 8) + '</td><td>' + d.name + '</td><td>' + (d.phone || 'N/A') + '</td><td>' + (d.status || 'online') + '</td><td>-</td><td>0</td><td><button onclick="editDriver(' + d.id + ')" class="btn-small">Edit</button></td></tr>').join('');
    }
  } catch (e) {
    console.log('Drivers error:', e);
  }
}

function editDriver(id) {
  alert('Edit Driver: ' + id);
}

// Vehicles
async function loadVehicles() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(API_BASE + '/vehicles', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    
    if (response.ok) {
      const data = await response.json();
      const container = document.getElementById('carsGrid');
      if (!container) return;
      
      if (!data.vehicles || !data.vehicles.length) {
        container.innerHTML = '<p>No vehicles</p>';
        return;
      }
      
      container.innerHTML = '<div style="display: grid; gap: 15px;">' + data.vehicles.map(v => '<div style="border: 1px solid var(--border); border-radius: 8px; padding: 15px;"><h4>' + v.model + '</h4><p><strong>Type:</strong> ' + v.vehicle_type + '</p><p><strong>Plate:</strong> ' + (v.license_plate || 'N/A') + '</p><p><strong>Color:</strong> ' + (v.color || 'N/A') + '</p><p><strong>Status:</strong> ' + (v.status || 'active') + '</p></div>').join('') + '</div>';
    }
  } catch (e) {
    console.log('Vehicles error:', e);
  }
}

// Bookings
async function loadBookings() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(API_BASE + '/bookings', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    
    if (response.ok) {
      const data = await response.json();
      const tbody = document.getElementById('bookings-table-body');
      if (!tbody) return;
      
      if (!data.data || !data.data.length) {
        tbody.innerHTML = '<tr><td colspan="13">No bookings</td></tr>';
        return;
      }
      
      tbody.innerHTML = data.data.map(b => '<tr><td>' + b.id.substring(0, 8) + '</td><td>' + b.customer_name + '</td><td>' + b.customer_phone + '</td><td>' + b.pickup_location + '</td><td>' + b.dropoff_location + '</td><td>' + b.distance_km + '</td><td>-</td><td>' + (b.fare_aed || b.total_fare || 0) + '</td><td>' + (b.driver_name || 'Unassigned') + '</td><td>-</td><td>' + b.status + '</td><td>' + new Date(b.created_at).toLocaleDateString() + '</td><td><button onclick="viewBooking(\'' + b.id + '\')" class="btn-small">View</button></td></tr>').join('');
    }
  } catch (e) {
    console.log('Bookings error:', e);
  }
}

function viewBooking(id) {
  fetch(API_BASE + '/bookings/' + id)
    .then(r => r.json())
    .then(d => {
      if (d.data) {
        const content = document.getElementById('bookingDetailContent');
        if (content) {
          content.innerHTML = '<div style="display: grid; gap: 12px;"><div><strong>Customer:</strong> ' + d.data.customer_name + '</div><div><strong>Phone:</strong> ' + d.data.customer_phone + '</div><div><strong>Pickup:</strong> ' + d.data.pickup_location + '</div><div><strong>Dropoff:</strong> ' + d.data.dropoff_location + '</div><div><strong>Distance:</strong> ' + d.data.distance_km + ' km</div><div><strong>Fare:</strong> AED ' + (d.data.fare_aed || d.data.total_fare || 0) + '</div><div><strong>Status:</strong> ' + d.data.status + '</div></div>';
          const modal = document.getElementById('bookingDetailModal');
          const overlay = document.getElementById('modalOverlay');
          if (modal) modal.style.display = 'block';
          if (overlay) overlay.style.display = 'block';
        }
      }
    })
    .catch(e => console.log(e));
}

// Helper Functions
function toggleSubmenu(element) {
  const submenu = element.nextElementSibling;
  if (submenu && submenu.classList.contains('nav-submenu')) {
    submenu.style.display = submenu.style.display === 'none' ? 'block' : 'none';
  }
}

function applyCustomRange() {
  loadDashboard();
}

function saveCarChanges() {
  alert('Vehicle updated');
}

function saveDriverChanges() {
  alert('Driver updated');
}

function exportBookings(format) {
  const token = localStorage.getItem('token');
  fetch(API_BASE + '/bookings', {
    headers: { 'Authorization': 'Bearer ' + token }
  }).then(r => r.json()).then(d => {
    if (!d.data) return;
    let csv = 'Customer,Phone,Pickup,Dropoff,Distance,Fare,Status\n';
    d.data.forEach(b => {
      csv += '"' + b.customer_name + '","' + b.customer_phone + '","' + b.pickup_location + '","' + b.dropoff_location + '",' + b.distance_km + ',' + (b.fare_aed || 0) + ',' + b.status + '\n';
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bookings.' + format;
    a.click();
  }).catch(e => console.log(e));
}

function openAddBookingModal() {
  alert('Add booking feature');
}

function createManualBooking() {
  alert('Booking created');
}
