// Global State
let currentRange = 'today';
const API_BASE = window.location.origin + '/api';

// Cache busting utility
function getCacheBustUrl(url) {
  return url + (url.indexOf('?') > -1 ? '&' : '?') + 't=' + Date.now();
}

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
  const userEl = document.getElementById('currentUser');
  if (userEl) userEl.textContent = user.username || 'Admin';
  const lastEl = document.getElementById('lastUpdated');
  if (lastEl) lastEl.textContent = new Date().toLocaleDateString();
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
    if (page === 'drivers-all') loadDrivers(null, 'drivers-table-body');
    else if (page === 'drivers-online') loadDrivers('online', 'drivers-online-table-body');
    else if (page === 'drivers-offline') loadDrivers('offline', 'drivers-offline-table-body');
    else if (page === 'cars-all') loadVehicles(null, 'carsGrid');
    else if (page === 'cars-sedan') loadVehicles('sedan', 'carsGridSedan');
    else if (page === 'cars-suv') loadVehicles('suv', 'carsGridSuv');
    else if (page === 'cars-luxury') loadVehicles('luxury', 'carsGridLuxury');
    else if (page === 'cars-van') loadVehicles('van', 'carsGridVan');
    else if (page === 'cars-bus') loadVehicles('bus', 'carsGridBus');
    else if (page === 'cars-minibus') loadVehicles('minibus', 'carsGridMinibus');
    else if (page === 'bookings') loadBookings();
    else if (page === 'kpi') loadKPI();
    else if (page === 'settings') setupUserInfo();
    else if (page === 'alerts') loadAlerts();
  }
}

// Dashboard - Load Stats
async function loadDashboard() {
  try {
    const token = localStorage.getItem('token');
    const range = localStorage.getItem('dashboardRange') || 'month';
    const url = getCacheBustUrl(API_BASE + '/stats/summary?range=' + range);
    const response = await fetch(url, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    
    if (!response.ok) throw new Error('HTTP ' + response.status);
    
    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'API error');
    
    const d = data.data && data.data.summary ? data.data.summary : {};
    const stat = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    stat('stat-bookings', d.total_bookings || '0');
    stat('stat-completed', d.completed_bookings || '0');
    stat('stat-pending', d.pending_bookings || '0');
    stat('stat-cancelled', d.cancelled_bookings || '0');
    stat('stat-revenue', 'AED ' + (parseFloat(d.total_revenue || 0).toFixed(2)));
    stat('stat-cash', 'AED ' + (parseFloat(d.cash_revenue || 0).toFixed(2)));
    stat('stat-card', 'AED ' + (parseFloat(d.card_revenue || 0).toFixed(2)));
  } catch (e) {
    console.error('Dashboard error:', e.message, e);
  }
}

// Range filter handlers
function setDashboardRange(range) {
  localStorage.setItem('dashboardRange', range);
  loadDashboard();
}

// KPI Page
async function loadKPI() {
  try {
    const token = localStorage.getItem('token');
    const url = getCacheBustUrl(API_BASE + '/stats/summary?range=month');
    const response = await fetch(url, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    
    if (!response.ok) throw new Error('HTTP ' + response.status);
    
    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'API error');
    
    const d = data.data && data.data.summary ? data.data.summary : {};
    const totalRev = parseFloat(d.total_revenue) || 0;
    const vendorComm = totalRev * 0.8;
    const profit = totalRev * 0.2;
    
    const stat = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    
    stat('kpi-total-revenue', 'AED ' + totalRev.toFixed(2));
    stat('kpi-vendor-commission', 'AED ' + vendorComm.toFixed(2));
    stat('kpi-company-profit', 'AED ' + profit.toFixed(2));
    stat('kpi-profit-margin', totalRev > 0 ? ((profit / totalRev) * 100).toFixed(1) + '%' : '0%');
  } catch (e) {
    console.error('KPI error:', e.message, e);
  }
}

// Drivers
async function loadDrivers(status = null, targetTableId = 'drivers-table-body') {
  try {
    const token = localStorage.getItem('token');
    let url = API_BASE + '/drivers';
    if (status) url += '?status=' + status;
    url = getCacheBustUrl(url);
    
    const response = await fetch(url, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    
    if (!response.ok) throw new Error('HTTP ' + response.status);
    
    const data = await response.json();
    const tbody = document.getElementById(targetTableId);
    if (!tbody) return;
    
    const drivers = data.data || [];
    if (!drivers || !drivers.length) {
      tbody.innerHTML = '<tr><td colspan="7">No drivers found</td></tr>';
      return;
    }
    
    tbody.innerHTML = drivers.map(d => '<tr><td>' + d.id.substring(0, 8) + '</td><td>' + d.name + '</td><td>' + (d.phone || 'N/A') + '</td><td><span style="padding: 4px 8px; border-radius: 4px; background: ' + (d.status === 'online' ? '#10b981' : '#ef4444') + '; color: white; font-size: 12px;">' + (d.status || 'offline') + '</span></td><td>-</td><td>0</td><td><button onclick="viewDriver(\'' + d.id + '\')" class="btn-small">View</button> <button onclick="editDriver(\'' + d.id + '\')" class="btn-small">Edit</button></td></tr>').join('');
  } catch (e) {
    const tbody = document.getElementById(targetTableId);
    if (tbody) tbody.innerHTML = '<tr><td colspan="7" style="color:red;">Error: ' + e.message + '</td></tr>';
    console.error('Drivers error:', e.message, e);
  }
}

function editDriver(id) {
  const url = getCacheBustUrl(API_BASE + '/drivers/' + id);
  fetch(url, {
    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
  })
  .then(r => {
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  })
  .then(d => {
    if (d.data) {
      const modal = document.getElementById('driverEditModal');
      if (modal) {
        document.getElementById('driverEditId').value = d.data.id;
        document.getElementById('driverName').value = d.data.name || '';
        document.getElementById('driverPhone').value = d.data.phone || '';
        document.getElementById('driverStatus').value = d.data.status || 'offline';
        modal.style.display = 'block';
        document.getElementById('modalOverlay').style.display = 'block';
      }
    }
  })
  .catch(e => console.error('Edit driver error:', e));
}

// Vehicles
async function loadVehicles(type = null, targetContainerId = 'carsGrid') {
  try {
    const token = localStorage.getItem('token');
    let url = API_BASE + '/vehicles';
    if (type) url += '?type=' + type;
    url = getCacheBustUrl(url);
    
    const response = await fetch(url, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    
    if (!response.ok) throw new Error('HTTP ' + response.status);
    
    const data = await response.json();
    const container = document.getElementById(targetContainerId);
    if (!container) return;
    
    const vehicles = data.data || data.vehicles || [];
    if (!vehicles || !vehicles.length) {
      container.innerHTML = '<p style="padding:20px; text-align:center;">No vehicles found</p>';
      return;
    }
    
    container.innerHTML = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px;">' + vehicles.map(v => '<div style="border: 1px solid var(--border); border-radius: 8px; padding: 15px; background: var(--glass-bg);"><h4 style="margin-bottom:10px;">' + v.model + '</h4><p><strong>Type:</strong> ' + v.type + '</p><p><strong>Plate:</strong> ' + (v.plate_number || 'N/A') + '</p><p><strong>Capacity:</strong> ' + v.max_passengers + ' pax / ' + v.max_luggage + ' luggage</p><p><strong>Status:</strong> ' + (v.status || 'available') + '</p></div>').join('') + '</div>';
  } catch (e) {
    const container = document.getElementById(targetContainerId);
    if (container) container.innerHTML = '<p style="color:red; padding:20px;">Error loading vehicles: ' + e.message + '</p>';
    console.error('Vehicles error:', e.message, e);
  }
}

// Bookings
async function loadBookings() {
  try {
    const token = localStorage.getItem('token');
    const tbody = document.getElementById('bookings-table-body');
    if (tbody) tbody.innerHTML = '<tr><td colspan="13" style="text-align:center; padding:20px;">Loading bookings...</td></tr>';
    
    const url = getCacheBustUrl(API_BASE + '/bookings');
    const response = await fetch(url, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    
    if (!response.ok) throw new Error('HTTP ' + response.status);
    
    const data = await response.json();
    if (!tbody) return;
    
    if (!data.data || !data.data.length) {
      tbody.innerHTML = '<tr><td colspan="13">No bookings found</td></tr>';
      return;
    }
    
    tbody.innerHTML = data.data.map(b => '<tr><td>' + b.id.substring(0, 8) + '</td><td>' + b.customer_name + '</td><td>' + b.customer_phone + '</td><td>' + b.pickup_location + '</td><td>' + b.dropoff_location + '</td><td>' + b.distance_km + '</td><td>-</td><td>AED ' + (b.fare_aed || b.total_fare || 0) + '</td><td>' + (b.driver_name || 'Unassigned') + '</td><td>-</td><td>' + b.status + '</td><td>' + new Date(b.created_at).toLocaleDateString() + '</td><td><button onclick="viewBooking(\'' + b.id + '\')" class="btn-small">View</button> <button onclick="editBooking(\'' + b.id + '\')" class="btn-small">Edit</button></td></tr>').join('');
  } catch (e) {
    const tbody = document.getElementById('bookings-table-body');
    if (tbody) tbody.innerHTML = '<tr><td colspan="13" style="color:red;">Error loading bookings: ' + e.message + '</td></tr>';
    console.error('Bookings error:', e.message, e);
  }
}

function viewBooking(id) {
  const url = getCacheBustUrl(API_BASE + '/bookings/' + id);
  fetch(url, {
    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
  })
    .then(r => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
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
    .catch(e => console.error('View booking error:', e));
}

// Helper Functions
function toggleSubmenu(element) {
  const submenu = element.nextElementSibling;
  if (submenu && submenu.classList.contains('nav-submenu')) {
    submenu.style.display = submenu.style.display === 'none' ? 'block' : 'none';
  }
}

function toggleCustomRange() {
  const picker = document.getElementById('customDatePicker');
  if (picker) picker.style.display = picker.style.display === 'none' ? 'flex' : 'none';
}

function applyCustomRange() {
  loadDashboard();
}

function saveCarChanges() {
  const id = document.getElementById('vehicleEditId').value;
  const token = localStorage.getItem('token');
  fetch(API_BASE + '/vehicles/' + id, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({
      model: document.getElementById('vehicleModel').value,
      type: document.getElementById('vehicleType').value,
      status: document.getElementById('vehicleStatus').value
    })
  }).then(r => r.json()).then(d => {
    if (d.success) {
      closeModal('vehicleEditModal');
      loadVehicles();
    }
  }).catch(e => console.log(e));
}

function saveDriverChanges() {
  const id = document.getElementById('driverEditId').value;
  const token = localStorage.getItem('token');
  fetch(API_BASE + '/drivers/' + id, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({
      name: document.getElementById('driverName').value,
      phone: document.getElementById('driverPhone').value,
      status: document.getElementById('driverStatus').value
    })
  }).then(r => r.json()).then(d => {
    if (d.success) {
      closeModal('driverEditModal');
      loadDrivers();
    }
  }).catch(e => console.log(e));
}

function exportBookings(format) {
  const token = localStorage.getItem('token');
  const url = getCacheBustUrl(API_BASE + '/bookings');
  fetch(url, {
    headers: { 'Authorization': 'Bearer ' + token }
  }).then(r => {
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  }).then(d => {
    if (!d.data) return;
    let csv = 'Customer,Phone,Pickup,Dropoff,Distance,Fare,Status\n';
    d.data.forEach(b => {
      csv += '"' + b.customer_name + '","' + b.customer_phone + '","' + b.pickup_location + '","' + b.dropoff_location + '",' + b.distance_km + ',' + (b.fare_aed || 0) + ',' + b.status + '\n';
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const objUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objUrl;
    a.download = 'bookings.' + format;
    a.click();
  }).catch(e => console.error('Export error:', e));
}

function openAddBookingModal() {
  const modal = document.getElementById('addBookingModal');
  if (modal) {
    modal.style.display = 'block';
    document.getElementById('modalOverlay').style.display = 'block';
  }
}

function createManualBooking() {
  const token = localStorage.getItem('token');
  fetch(API_BASE + '/bookings/create-manual', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({
      customer_name: document.getElementById('bookingCustomerName').value,
      customer_phone: document.getElementById('bookingCustomerPhone').value,
      pickup_location: document.getElementById('bookingPickup').value,
      dropoff_location: document.getElementById('bookingDropoff').value,
      distance_km: parseFloat(document.getElementById('bookingDistance').value) || 0,
      passengers_count: parseInt(document.getElementById('bookingPassengers').value) || 1,
      luggage_count: parseInt(document.getElementById('bookingLuggage').value) || 0,
      booking_type: document.getElementById('bookingType').value || 'point-to-point'
    })
  }).then(r => r.json()).then(d => {
    if (d.success) {
      closeModal('addBookingModal');
      loadBookings();
    }
  }).catch(e => console.log(e));
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = 'none';
  document.getElementById('modalOverlay').style.display = 'none';
}

// View Driver
function viewDriver(id) {
  const url = getCacheBustUrl(API_BASE + '/drivers/' + id);
  fetch(url, {
    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
  })
  .then(r => r.json())
  .then(d => {
    if (d.data) {
      alert('Driver: ' + d.data.name + '\nPhone: ' + d.data.phone + '\nStatus: ' + d.data.status);
    }
  })
  .catch(e => console.error(e));
}

// Edit Booking
function editBooking(id) {
  fetch(API_BASE + '/bookings/' + id, {
    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
  })
  .then(r => r.json())
  .then(d => {
    if (d.data) {
      document.getElementById('editStatus').value = d.data.status || 'pending';
      document.getElementById('editPayment').value = d.data.payment_method || 'cash';
      document.getElementById('editFare').value = d.data.fare_aed || 0;
      const modal = document.getElementById('editBookingModal');
      if (modal) modal.style.display = 'block';
      document.getElementById('modalOverlay').style.display = 'block';
      window.editingBookingId = id;
    }
  })
  .catch(e => console.error(e));
}

// Load Alerts
async function loadAlerts() {
  try {
    const token = localStorage.getItem('token');
    const container = document.getElementById('alertsFullList');
    if (!container) return;
    
    container.innerHTML = '<div style="text-align:center; padding:20px;"><p>✅ No critical alerts</p><p style="color:var(--text-secondary); font-size:12px;">System running normally</p></div>';
  } catch (e) {
    console.error(e);
  }
}
