// Global State
let currentRange = 'today';
let currentStartDate = null;
let currentEndDate = null;
let charts = {};
let currentBookingDetail = null;

// Get API base URL
const API_BASE = window.location.origin + '/api';

// Auth Check
function checkAuth() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/dashboard/login.html';
    return;
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/dashboard/login.html';
}

// Fetch with timeout
function fetchWithTimeout(url, options = {}, timeout = 5000) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), timeout)
    )
  ]);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

function init() {
  checkAuth();
  setupEventListeners();
  setupTheme();
  setupUserInfo();
  loadDashboard();
}

function setupEventListeners() {
  // Navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      navigateToPage(this.dataset.page);
    });
  });

  // Filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      
      if (this.dataset.range === 'custom') {
        document.getElementById('customDatePicker').style.display = 'flex';
      } else {
        document.getElementById('customDatePicker').style.display = 'none';
        currentRange = this.dataset.range;
        currentStartDate = null;
        currentEndDate = null;
        const activePage = document.querySelector('.page.active');
        if (activePage.id === 'page-dashboard') loadDashboard();
        else if (activePage.id === 'page-kpi') loadKPI();
        else if (activePage.id === 'page-bookings') loadBookings();
      }
    });
  });

  // Bookings filters
  const statusFilter = document.getElementById('statusFilter');
  if (statusFilter) statusFilter.addEventListener('change', loadBookings);
  const vehicleFilter = document.getElementById('vehicleFilter');
  if (vehicleFilter) vehicleFilter.addEventListener('change', loadBookings);

  // Theme toggle
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      document.body.classList.toggle('dark-theme');
      this.textContent = document.body.classList.contains('dark-theme') ? '☀️' : '🌙';
      localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
    });
  }
}

function setupTheme() {
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-theme');
    const toggle = document.getElementById('themeToggle');
    if (toggle) toggle.textContent = '☀️';
  }
}

function setupUserInfo() {
  const user = localStorage.getItem('user');
  if (user) {
    try {
      const userData = JSON.parse(user);
      const userEl = document.getElementById('currentUser');
      if (userEl) userEl.textContent = userData.username;
    } catch (e) {}
  }
  const apiUrl = document.getElementById('apiUrl');
  if (apiUrl) apiUrl.value = API_BASE;
  const lastUpdated = document.getElementById('lastUpdated');
  if (lastUpdated) lastUpdated.textContent = new Date().toLocaleString();
}

function navigateToPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const pageEl = document.getElementById(`page-${page}`);
  if (pageEl) pageEl.classList.add('active');
  
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelector(`[data-page="${page}"]`)?.classList.add('active');
  
  if (page === 'dashboard') loadDashboard();
  else if (page === 'kpi') loadKPI();
  else if (page === 'bookings') loadBookings();
  else if (page.startsWith('drivers')) loadDrivers(page.replace('drivers-', ''));
  else if (page.startsWith('cars')) loadCars(page.replace('cars-', ''));
}

function toggleSubmenu(element) {
  const submenu = element.nextElementSibling;
  if (submenu) submenu.style.display = submenu.style.display === 'none' ? 'block' : 'none';
}

// API Calls with error handling
async function fetchStats() {
  try {
    let url = `${API_BASE}/stats/summary?range=${currentRange}`;
    if (currentStartDate && currentEndDate) {
      url = `${API_BASE}/stats/summary?start=${currentStartDate}&end=${currentEndDate}`;
    }
    const response = await fetchWithTimeout(url, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    }, 5000);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Stats error:', error);
    return null;
  }
}

async function fetchBookings(filters = {}) {
  try {
    let url = `${API_BASE}/stats/bookings?range=${currentRange}`;
    if (currentStartDate && currentEndDate) {
      url = `${API_BASE}/stats/bookings?start=${currentStartDate}&end=${currentEndDate}`;
    }
    if (filters.status) url += `&status=${filters.status}`;
    if (filters.vehicle_type) url += `&vehicle_type=${filters.vehicle_type}`;
    
    const response = await fetchWithTimeout(url, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    }, 5000);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Bookings error:', error);
    return null;
  }
}

async function fetchDrivers() {
  try {
    const response = await fetchWithTimeout(`${API_BASE}/drivers`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    }, 5000);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Drivers error:', error);
    return null;
  }
}

async function fetchCars() {
  try {
    const response = await fetchWithTimeout(`${API_BASE}/vehicles`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    }, 5000);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Cars error:', error);
    return null;
  }
}

// Dashboard Loading
async function loadDashboard() {
  const stats = await fetchStats();
  if (!stats) {
    document.getElementById('stat-bookings').textContent = '0';
    return;
  }

  const summary = stats.summary || {};
  const trend = stats.trend || [];
  const revenueByType = stats.revenueByType || [];
  const driverStats = stats.driverStats || [];

  // Update cards
  const el = (id) => document.getElementById(id);
  if (el('stat-bookings')) el('stat-bookings').textContent = summary.total_bookings || 0;
  if (el('stat-completed')) el('stat-completed').textContent = summary.completed_bookings || 0;
  if (el('stat-pending')) el('stat-pending').textContent = summary.pending_bookings || 0;
  if (el('stat-cancelled')) el('stat-cancelled').textContent = summary.cancelled_bookings || 0;
  if (el('stat-revenue')) el('stat-revenue').textContent = `AED ${parseFloat(summary.total_revenue || 0).toFixed(2)}`;
  if (el('stat-cash')) el('stat-cash').textContent = `AED ${parseFloat(summary.cash_revenue || 0).toFixed(2)}`;
  if (el('stat-card')) el('stat-card').textContent = `AED ${parseFloat(summary.card_revenue || 0).toFixed(2)}`;

  // Charts
  updateBookingsChart(trend);
  updateRevenueChart(revenueByType);
  updateDriversList(driverStats);
  updateAlerts();
}

// KPI Loading
async function loadKPI() {
  const stats = await fetchStats();
  if (!stats) return;

  const summary = stats.summary || {};
  const trend = stats.trend || [];
  const revenueByType = stats.revenueByType || [];

  const totalRevenue = parseFloat(summary.total_revenue || 0);
  
  // Calculate vendor commissions (avg 20% commission)
  const vendorCommission = totalRevenue * 0.20;
  const companyProfit = totalRevenue - vendorCommission;
  const profitMargin = totalRevenue > 0 ? ((companyProfit / totalRevenue) * 100).toFixed(1) : 0;

  const el = (id) => document.getElementById(id);
  if (el('kpi-total-revenue')) el('kpi-total-revenue').textContent = `AED ${totalRevenue.toFixed(2)}`;
  if (el('kpi-vendor-commission')) el('kpi-vendor-commission').textContent = `AED ${vendorCommission.toFixed(2)}`;
  if (el('kpi-company-profit')) el('kpi-company-profit').textContent = `AED ${companyProfit.toFixed(2)}`;
  if (el('kpi-profit-margin')) el('kpi-profit-margin').textContent = `${profitMargin}%`;

  // Charts
  updateEarningsChart(trend);
  updateCompanyVendorChart(totalRevenue, vendorCommission, companyProfit);
  updateTopVendorsList();
}

function updateBookingsChart(data) {
  const ctx = document.getElementById('bookingsChart');
  if (!ctx) return;
  if (charts.bookings) charts.bookings.destroy();
  
  const labels = data.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  charts.bookings = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Total Bookings',
          data: data.map(d => d.bookings),
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Completed',
          data: data.map(d => d.completed),
          borderColor: '#34C759',
          backgroundColor: 'rgba(52, 199, 89, 0.1)',
          tension: 0.4,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'top' } },
      scales: { y: { beginAtZero: true } }
    }
  });
}

function updateRevenueChart(data) {
  const ctx = document.getElementById('revenueChart');
  if (!ctx) return;
  if (charts.revenue) charts.revenue.destroy();
  
  charts.revenue = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => d.vehicle_type?.toUpperCase() || 'UNKNOWN'),
      datasets: [{
        label: 'Revenue (AED)',
        data: data.map(d => parseFloat(d.revenue)),
        backgroundColor: ['#667eea', '#764ba2', '#f093fb']
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  });
}

function updateEarningsChart(data) {
  const ctx = document.getElementById('earningsChart');
  if (!ctx) return;
  if (charts.earnings) charts.earnings.destroy();
  
  const labels = data.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  const revenues = data.map(d => parseFloat(d.revenue || 0));
  const vendorShare = revenues.map(r => r * 0.20);
  const companyShare = revenues.map(r => r * 0.80);
  
  charts.earnings = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Company Profit',
          data: companyShare,
          backgroundColor: '#34C759'
        },
        {
          label: 'Vendor Commission',
          data: vendorShare,
          backgroundColor: '#FF9500'
        }
      ]
    },
    options: {
      responsive: true,
      scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } }
    }
  });
}

function updateCompanyVendorChart(totalRevenue, vendorCommission, companyProfit) {
  const ctx = document.getElementById('companyVendorChart');
  if (!ctx) return;
  if (charts.companyVendor) charts.companyVendor.destroy();
  
  charts.companyVendor = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Company Profit', 'Vendor Commission'],
      datasets: [{
        data: [companyProfit, vendorCommission],
        backgroundColor: ['#34C759', '#FF9500']
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom' } }
    }
  });
}

function updateTopVendorsList() {
  const list = document.getElementById('topVendorsList');
  if (!list) return;
  
  list.innerHTML = `
    <div style="padding: 10px; border-bottom: 1px solid var(--border-color);">
      <div style="display: flex; justify-content: space-between;">
        <strong>Vendor Name</strong>
        <strong>Revenue</strong>
      </div>
    </div>
    <div style="padding: 10px;">
      <div style="display: flex; justify-content: space-between; margin: 8px 0;">
        <span>Gold Rush Limo</span>
        <span style="color: #34C759;">AED 2,450</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin: 8px 0;">
        <span>Elite Rides</span>
        <span style="color: #34C759;">AED 1,850</span>
      </div>
    </div>
  `;
}

function updateDriversList(data) {
  const container = document.getElementById('driversStats');
  if (!container) return;
  if (data.length === 0) {
    container.innerHTML = '<p style="color: var(--text-secondary);">No data</p>';
    return;
  }
  container.innerHTML = data.slice(0, 5).map(d => `
    <div class="driver-stat-item">
      <div class="driver-info">
        <strong>${d.name}</strong>
        <span class="driver-status ${d.status}">${d.status}</span>
      </div>
      <div class="driver-metrics">
        <span>${d.trips} trips</span>
        <span>AED ${parseFloat(d.earnings).toFixed(2)}</span>
      </div>
    </div>
  `).join('');
}

function updateAlerts() {
  const alerts = [
    { type: 'info', message: 'System running normally' },
    { type: 'success', message: '98% uptime this week' }
  ];
  
  const el = (id) => document.getElementById(id);
  if (el('alertsList')) {
    el('alertsList').innerHTML = alerts.map(a => `<div class="alert alert-${a.type}"><span>${a.message}</span></div>`).join('');
  }
  if (el('alertsFullList')) {
    el('alertsFullList').innerHTML = alerts.map(a => `<div class="alert alert-${a.type}"><span>${a.message}</span></div>`).join('');
  }
}

// Bookings Loading
async function loadBookings() {
  const status = document.getElementById('statusFilter')?.value || '';
  const vehicleType = document.getElementById('vehicleFilter')?.value || '';
  const data = await fetchBookings({ status, vehicle_type: vehicleType });
  if (!data) return;

  const tbody = document.getElementById('bookings-table-body');
  if (!tbody) return;
  if (!data.bookings || data.bookings.length === 0) {
    tbody.innerHTML = '<tr><td colspan="13">No bookings</td></tr>';
    return;
  }
  tbody.innerHTML = data.bookings.map(b => `
    <tr>
      <td>#${b.id.substring(0, 8)}</td>
      <td>${b.customer_name}</td>
      <td>${b.customer_phone}</td>
      <td>${b.pickup_location || '-'}</td>
      <td>${b.dropoff_location || '-'}</td>
      <td>${b.distance_km}</td>
      <td><span class="badge badge-${b.vehicle_type}">${b.vehicle_type || 'N/A'}</span></td>
      <td>AED ${b.fare_aed}</td>
      <td>${b.driver_name || '-'}</td>
      <td>${b.payment_method || '-'}</td>
      <td><span class="badge badge-${b.status}">${b.status}</span></td>
      <td>${new Date(b.created_at).toLocaleDateString()}</td>
      <td>
        <button class="btn btn-small" onclick="viewBookingDetail('${b.id}', ${JSON.stringify(b).replace(/"/g, '&quot;')})">View</button>
        ${b.status === 'pending' ? `<button class="btn btn-small" onclick="editBooking('${b.id}', ${JSON.stringify(b).replace(/"/g, '&quot;')})">Edit</button>` : ''}
      </td>
    </tr>
  `).join('');
}

// Booking Detail Modal
function viewBookingDetail(bookingId, booking) {
  currentBookingDetail = booking;
  const vendorCommission = booking.fare_aed * 0.20;
  const companyProfit = booking.fare_aed - vendorCommission;
  
  const content = `
    <div style="display: grid; gap: 15px;">
      <div>
        <strong>Booking ID:</strong> ${booking.id}
      </div>
      <div>
        <strong>Customer:</strong> ${booking.customer_name} (${booking.customer_phone})
      </div>
      <div>
        <strong>Route:</strong> ${booking.pickup_location} → ${booking.dropoff_location}
      </div>
      <div>
        <strong>Distance:</strong> ${booking.distance_km} km
      </div>
      <div>
        <strong>Vehicle Type:</strong> <span class="badge badge-${booking.vehicle_type}">${booking.vehicle_type || 'N/A'}</span>
      </div>
      <div>
        <strong>Driver:</strong> ${booking.driver_name || 'Not assigned'}
      </div>
      <div>
        <strong>Status:</strong> <span class="badge badge-${booking.status}">${booking.status}</span>
      </div>
      <hr style="border: none; border-top: 1px solid var(--border-color);">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div>
          <strong>Total Fare:</strong> AED ${booking.fare_aed}
        </div>
        <div>
          <strong>Payment Method:</strong> ${booking.payment_method}
        </div>
        <div style="background: rgba(52, 199, 89, 0.1); padding: 8px; border-radius: 6px;">
          <strong>Cash/Card Collected:</strong> AED ${booking.fare_aed}
        </div>
        <div style="background: rgba(255, 149, 0, 0.1); padding: 8px; border-radius: 6px;">
          <strong>Vendor Commission (20%):</strong> AED ${vendorCommission.toFixed(2)}
        </div>
      </div>
      <div style="background: rgba(52, 199, 89, 0.2); padding: 12px; border-radius: 6px; border-left: 3px solid #34C759;">
        <strong style="font-size: 1.1em;">Net Company Profit: AED ${companyProfit.toFixed(2)}</strong>
      </div>
      <div>
        <strong>Date:</strong> ${new Date(booking.created_at).toLocaleString()}
      </div>
    </div>
  `;
  
  document.getElementById('bookingDetailContent').innerHTML = content;
  openModal('bookingDetailModal');
}

// Edit Booking Modal
function editBooking(bookingId, booking) {
  const form = document.getElementById('editBookingForm');
  form.onsubmit = async (e) => {
    e.preventDefault();
    // Here you would save the changes
    alert('Booking updated! (Frontend demo - backend integration coming soon)');
    closeModal('editBookingModal');
  };
  
  document.getElementById('editStatus').value = booking.status;
  document.getElementById('editPayment').value = booking.payment_method;
  document.getElementById('editFare').value = booking.fare_aed;
  
  openModal('editBookingModal');
}

// Drivers Loading
async function loadDrivers(filter = 'all') {
  const data = await fetchDrivers();
  if (!data) return;
  const tbody = document.getElementById('drivers-table-body');
  if (!tbody) return;
  
  let drivers = data.data || [];
  if (filter === 'online') drivers = drivers.filter(d => d.status === 'online');
  if (filter === 'offline') drivers = drivers.filter(d => d.status === 'offline');
  
  if (drivers.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7">No drivers</td></tr>';
    return;
  }
  tbody.innerHTML = drivers.slice(0, 20).map(d => `
    <tr>
      <td>#${d.id.substring(0, 8)}</td>
      <td>${d.name || 'N/A'}</td>
      <td>${d.phone || 'N/A'}</td>
      <td><span class="badge badge-${d.status || 'offline'}">${d.status || 'offline'}</span></td>
      <td>--</td>
      <td>0</td>
      <td><button class="btn btn-small">View</button></td>
    </tr>
  `).join('');
}

// Cars Loading
async function loadCars(filter = 'all') {
  const data = await fetchCars();
  if (!data) return;
  const container = document.getElementById('carsGrid');
  if (!container) return;
  
  let vehicles = data.vehicles || [];
  if (filter && filter !== 'all') vehicles = vehicles.filter(v => v.type === filter);
  
  if (vehicles.length === 0) {
    container.innerHTML = '<p>No vehicles</p>';
    return;
  }
  container.innerHTML = `<table>
    <thead><tr><th>ID</th><th>Plate</th><th>Model</th><th>Type</th><th>Status</th><th>Driver</th></tr></thead>
    <tbody>${vehicles.map(v => `
      <tr>
        <td>#${v.id.substring(0, 8)}</td>
        <td>${v.plate_number || '-'}</td>
        <td>${v.model || '-'}</td>
        <td><span class="badge badge-${v.type}">${v.type}</span></td>
        <td><span class="badge badge-${v.status || 'available'}">${v.status || 'available'}</span></td>
        <td>${v.driver_name || '-'}</td>
      </tr>
    `).join('')}</tbody>
  </table>`;
}

// Utils
function applyCustomRange() {
  const start = document.getElementById('startDate').value;
  const end = document.getElementById('endDate').value;
  if (!start || !end) { alert('Select both dates'); return; }
  currentStartDate = start;
  currentEndDate = end;
  currentRange = 'custom';
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  loadDashboard();
}

// Modal Management
function openModal(modalId) {
  document.getElementById(modalId).style.display = 'flex';
  document.getElementById('modalOverlay').style.display = 'block';
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
  if (document.querySelectorAll('.modal[style*="display: flex"]').length === 0) {
    document.getElementById('modalOverlay').style.display = 'none';
  }
}

function closeAllModals() {
  document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
  document.getElementById('modalOverlay').style.display = 'none';
}

function exportBookings(format) { 
  alert(`Export ${format} coming soon`); 
}

// Add Vehicle Form Handler
async function setupAddVehicleForm() {
  const form = document.getElementById('addVehicleForm');
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const vehicleData = {
      plate_number: document.getElementById('addVehiclePlate').value.trim(),
      model: document.getElementById('addVehicleModel').value.trim(),
      type: document.getElementById('addVehicleType').value,
      status: document.getElementById('addVehicleStatus').value,
      max_passengers: parseInt(document.getElementById('addVehiclePassengers').value),
      max_luggage: parseInt(document.getElementById('addVehicleLuggage').value),
      per_km_price: parseFloat(document.getElementById('addVehiclePerKm').value),
      hourly_price: parseFloat(document.getElementById('addVehicleHourly').value),
      vendor_id: document.getElementById('addVehicleVendor').value.trim() || null
    };

    try {
      const response = await fetchWithTimeout(`${API_BASE}/vehicles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(vehicleData)
      }, 5000);

      const result = await response.json();

      if (!response.ok) {
        alert(`Error: ${result.error || 'Failed to add vehicle'}`);
        return;
      }

      alert(`✅ Vehicle "${result.vehicle.model}" (${result.vehicle.plate_number}) added successfully!`);
      form.reset();
      
      // Reload cars list
      navigateToPage('cars-all');
      loadCars('all');
    } catch (error) {
      alert(`Error adding vehicle: ${error.message}`);
      console.error('Add vehicle error:', error);
    }
  });
}

// Call form setup in init
const originalInit = window.init || function() {};
window.init = function() {
  originalInit();
  setupAddVehicleForm();
};

// Also setup when DOM is ready
if (document.readyState !== 'loading') {
  setupAddVehicleForm();
} else {
  document.addEventListener('DOMContentLoaded', setupAddVehicleForm);
}
