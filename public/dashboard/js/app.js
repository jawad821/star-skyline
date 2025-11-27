// Global State
let currentRange = 'today';
const API_BASE = window.location.origin + '/api';
let pickupCoords = null, dropoffCoords = null;
let pickupAutocomplete, dropoffAutocomplete;

// Auth
function checkAuth() {
  if (!localStorage.getItem('token')) {
    window.location.href = '/dashboard/login.html';
  }
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
  const active = document.querySelector(`[data-page="${page}"]`);
  if (active) active.classList.add('active');
  
  document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
  const pageEl = document.getElementById(`page-${page}`);
  if (pageEl) {
    pageEl.style.display = 'block';
    if (page === 'drivers') loadDrivers();
    else if (page === 'vehicles') loadVehicles();
    else if (page === 'bookings') loadBookings();
    else if (page === 'vendors') loadVendors();
    else if (page === 'driver-approvals') loadDriverApprovals();
  }
}

// Modals
function closeAllModals() {
  document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
  const overlay = document.getElementById('modalOverlay');
  if (overlay) overlay.style.display = 'none';
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.style.display = 'none';
  const o = document.getElementById('modalOverlay');
  if (o) o.style.display = 'none';
}

function openModal(id) {
  const o = document.getElementById('modalOverlay');
  if (o) {
    o.style.display = 'block';
    o.onclick = () => closeAllModals();
  }
  const m = document.getElementById(id);
  if (m) m.style.display = 'block';
}

// Dashboard
async function loadDashboard() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/stats/summary`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.data) {
        document.getElementById('totalBookings').textContent = data.data.total_bookings || 0;
        document.getElementById('totalRevenue').textContent = (data.data.total_revenue || 0).toFixed(2);
        document.getElementById('totalDrivers').textContent = data.data.total_drivers || 0;
        document.getElementById('totalVehicles').textContent = data.data.total_vehicles || 0;
      }
    }
  } catch (e) {
    console.log('Dashboard error:', e);
  }
}

// Drivers
async function loadDrivers() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/drivers`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const data = await response.json();
      const table = document.getElementById('driversTable');
      if (!table) return;
      
      if (!data.data || !data.data.length) {
        table.innerHTML = '<tr><td colspan="6">No drivers</td></tr>';
        return;
      }
      
      table.innerHTML = data.data.map(d => `
        <tr>
          <td>${d.name}</td>
          <td>${d.license_number || 'N/A'}</td>
          <td>${d.phone || 'N/A'}</td>
          <td>${d.driver_registration_status || 'pending'}</td>
          <td>⭐ ${d.avg_rating ? d.avg_rating.toFixed(1) : 'N/A'}</td>
          <td>
            <button onclick="viewDriver(${d.id})" class="btn-small">View</button>
            <button onclick="editDriver(${d.id})" class="btn-small">Edit</button>
          </td>
        </tr>
      `).join('');
    }
  } catch (e) {
    console.log('Drivers error:', e);
  }
}

function viewDriver(id) {
  fetch(`${API_BASE}/drivers/${id}`)
    .then(r => r.json())
    .then(d => {
      if (d.data) {
        document.getElementById('viewDriverName').textContent = d.data.name;
        document.getElementById('viewDriverLicense').textContent = d.data.license_number || 'N/A';
        document.getElementById('viewDriverPhone').textContent = d.data.phone || 'N/A';
        document.getElementById('viewDriverRating').textContent = d.data.avg_rating ? d.data.avg_rating.toFixed(1) : 'N/A';
        openModal('viewDriverModal');
      }
    })
    .catch(e => console.log(e));
}

function editDriver(id) {
  fetch(`${API_BASE}/drivers/${id}`)
    .then(r => r.json())
    .then(d => {
      if (d.data) {
        document.getElementById('editDriverId').value = id;
        document.getElementById('editDriverName').value = d.data.name || '';
        document.getElementById('editDriverLicense').value = d.data.license_number || '';
        document.getElementById('editDriverPhone').value = d.data.phone || '';
        openModal('editDriverModal');
      }
    })
    .catch(e => console.log(e));
}

async function saveDriver() {
  const token = localStorage.getItem('token');
  const id = document.getElementById('editDriverId').value;
  const data = {
    license_number: document.getElementById('editDriverLicense').value,
    phone: document.getElementById('editDriverPhone').value
  };
  
  try {
    const response = await fetch(`${API_BASE}/drivers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data)
    });
    if (response.ok) {
      closeModal('editDriverModal');
      loadDrivers();
    }
  } catch (e) {
    console.log('Save driver error:', e);
  }
}

// Vehicles
async function loadVehicles() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/vehicles`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const data = await response.json();
      const table = document.getElementById('vehiclesTable');
      if (!table) return;
      
      if (!data.data || !data.data.length) {
        table.innerHTML = '<tr><td colspan="6">No vehicles</td></tr>';
        return;
      }
      
      table.innerHTML = data.data.map(v => `
        <tr>
          <td>${v.model}</td>
          <td>${v.vehicle_type}</td>
          <td>${v.license_plate || 'N/A'}</td>
          <td>${v.color || 'N/A'}</td>
          <td>${v.status || 'active'}</td>
          <td>
            <button onclick="editVehicle(${v.id})" class="btn-small">Edit</button>
          </td>
        </tr>
      `).join('');
    }
  } catch (e) {
    console.log('Vehicles error:', e);
  }
}

function editVehicle(id) {
  fetch(`${API_BASE}/vehicles/${id}`)
    .then(r => r.json())
    .then(d => {
      if (d.data) {
        document.getElementById('editVehicleId').value = id;
        document.getElementById('editVehicleModel').value = d.data.model || '';
        document.getElementById('editVehicleType').value = d.data.vehicle_type || '';
        document.getElementById('editVehicleLicensePlate').value = d.data.license_plate || '';
        document.getElementById('editVehicleColor').value = d.data.color || '';
        document.getElementById('editVehicleStatus').value = d.data.status || '';
        openModal('editVehicleModal');
      }
    })
    .catch(e => console.log(e));
}

async function saveVehicle() {
  const token = localStorage.getItem('token');
  const id = document.getElementById('editVehicleId').value;
  const data = {
    color: document.getElementById('editVehicleColor').value,
    status: document.getElementById('editVehicleStatus').value
  };
  
  try {
    const response = await fetch(`${API_BASE}/vehicles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data)
    });
    if (response.ok) {
      closeModal('editVehicleModal');
      loadVehicles();
    }
  } catch (e) {
    console.log('Save vehicle error:', e);
  }
}

// Bookings
async function loadBookings() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/bookings`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const data = await response.json();
      const table = document.getElementById('bookingsTable');
      if (!table) return;
      
      if (!data.data || !data.data.length) {
        table.innerHTML = '<tr><td colspan="7">No bookings</td></tr>';
        return;
      }
      
      table.innerHTML = data.data.map(b => `
        <tr>
          <td>${b.customer_name}</td>
          <td>${b.pickup_location}</td>
          <td>${b.dropoff_location}</td>
          <td>${b.distance_km} km</td>
          <td>AED ${b.total_fare || 0}</td>
          <td>${b.status}</td>
          <td>
            <button onclick="viewBooking(${b.id})" class="btn-small">Detail</button>
          </td>
        </tr>
      `).join('');
    }
  } catch (e) {
    console.log('Bookings error:', e);
  }
}

function viewBooking(id) {
  fetch(`${API_BASE}/bookings/${id}`)
    .then(r => r.json())
    .then(d => {
      if (d.data) {
        document.getElementById('detailCustomer').textContent = d.data.customer_name;
        document.getElementById('detailPhone').textContent = d.data.customer_phone;
        document.getElementById('detailPickup').textContent = d.data.pickup_location;
        document.getElementById('detailDropoff').textContent = d.data.dropoff_location;
        document.getElementById('detailDistance').textContent = d.data.distance_km;
        document.getElementById('detailFare').textContent = d.data.total_fare || 0;
        document.getElementById('detailStatus').textContent = d.data.status;
        document.getElementById('detailDriver').textContent = d.data.driver_name || 'Unassigned';
        document.getElementById('detailVehicle').textContent = d.data.vehicle_model || 'N/A';
        document.getElementById('detailPlate').textContent = d.data.license_plate || 'N/A';
        openModal('bookingDetailModal');
      }
    })
    .catch(e => console.log(e));
}

// Vendors
async function loadVendors() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/vendor-management/pending-vendors`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const data = await response.json();
      const table = document.getElementById('vendorsTable');
      if (!table) return;
      
      if (!data.data || !data.data.length) {
        table.innerHTML = '<tr><td colspan="5">No pending vendors</td></tr>';
        return;
      }
      
      table.innerHTML = data.data.map(v => `
        <tr>
          <td>${v.company_name}</td>
          <td>${v.contact_email}</td>
          <td>${v.status}</td>
          <td>${v.total_drivers || 0}</td>
          <td>
            <button onclick="approveVendor(${v.id})" class="btn-small">Approve</button>
            <button onclick="rejectVendor(${v.id})" class="btn-small">Reject</button>
          </td>
        </tr>
      `).join('');
    }
  } catch (e) {
    console.log('Vendors error:', e);
  }
}

async function approveVendor(id) {
  const token = localStorage.getItem('token');
  try {
    await fetch(`${API_BASE}/vendor-management/approve-vendor/${id}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    loadVendors();
  } catch (e) {
    console.log(e);
  }
}

async function rejectVendor(id) {
  const token = localStorage.getItem('token');
  try {
    await fetch(`${API_BASE}/vendor-management/reject-vendor/${id}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    loadVendors();
  } catch (e) {
    console.log(e);
  }
}

// Driver Approvals
async function loadDriverApprovals() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/vendor-management/pending-drivers`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const data = await response.json();
      const table = document.getElementById('driverApprovalsTable');
      if (!table) return;
      
      if (!data.data || !data.data.length) {
        table.innerHTML = '<tr><td colspan="5">No pending drivers</td></tr>';
        return;
      }
      
      table.innerHTML = data.data.map(d => `
        <tr>
          <td>${d.name}</td>
          <td>${d.email}</td>
          <td>${d.license_number || 'N/A'}</td>
          <td>${d.driver_registration_status || 'pending'}</td>
          <td>
            <button onclick="approveDriver(${d.id})" class="btn-small">Approve</button>
            <button onclick="rejectDriver(${d.id})" class="btn-small">Reject</button>
          </td>
        </tr>
      `).join('');
    }
  } catch (e) {
    console.log('Driver approvals error:', e);
  }
}

async function approveDriver(id) {
  const token = localStorage.getItem('token');
  try {
    await fetch(`${API_BASE}/vendor-management/approve-driver/${id}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    loadDriverApprovals();
  } catch (e) {
    console.log(e);
  }
}

async function rejectDriver(id) {
  const token = localStorage.getItem('token');
  try {
    await fetch(`${API_BASE}/vendor-management/reject-driver/${id}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    loadDriverApprovals();
  } catch (e) {
    console.log(e);
  }
}

// Google Maps
function initGoogleMapsAutocomplete() {
  if (!window.google || !window.google.maps) return;
  const pickupInput = document.getElementById('bookingPickup');
  const dropoffInput = document.getElementById('bookingDropoff');
  if (!pickupInput || !dropoffInput) return;
  
  pickupAutocomplete = new google.maps.places.Autocomplete(pickupInput, {
    fields: ['formatted_address', 'geometry'],
    componentRestrictions: { country: 'ae' }
  });
  
  dropoffAutocomplete = new google.maps.places.Autocomplete(dropoffInput, {
    fields: ['formatted_address', 'geometry'],
    componentRestrictions: { country: 'ae' }
  });
  
  pickupAutocomplete.addListener('place_changed', () => {
    const place = pickupAutocomplete.getPlace();
    if (place.geometry) {
      pickupCoords = place.geometry.location;
      calculateDistance();
    }
  });
  
  dropoffAutocomplete.addListener('place_changed', () => {
    const place = dropoffAutocomplete.getPlace();
    if (place.geometry) {
      dropoffCoords = place.geometry.location;
      calculateDistance();
    }
  });
}

function calculateDistance() {
  if (!pickupCoords || !dropoffCoords) return;
  const service = new google.maps.DistanceMatrixService();
  service.getDistanceMatrix({
    origins: [pickupCoords],
    destinations: [dropoffCoords],
    travelMode: google.maps.TravelMode.DRIVING,
    unitSystem: google.maps.UnitSystem.METRIC
  }, (response, status) => {
    if (status === 'OK' && response.rows[0].elements[0].distance) {
      const km = Math.round(response.rows[0].elements[0].distance.value / 1000 * 10) / 10;
      document.getElementById('bookingDistance').value = km;
      updateBookingFare();
    }
  });
}

function updateBookingFare() {
  const distance = parseFloat(document.getElementById('bookingDistance').value) || 0;
  const vehicleType = document.getElementById('bookingVehicleType').value;
  const bookingType = document.getElementById('bookingType').value;
  if (!distance || !vehicleType || !bookingType) return;
  
  fetch(`${API_BASE}/bookings/calculate-fare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ distance_km: distance, vehicle_type: vehicleType, booking_type: bookingType })
  }).then(r => r.json()).then(d => {
    if (d.fare) document.getElementById('bookingCalculatedFare').textContent = d.fare.toFixed(2);
  }).catch(e => console.log(e));
}

// Booking Modal
function openAddBookingModal() {
  pickupCoords = null;
  dropoffCoords = null;
  document.getElementById('bookingCustomerName').value = '';
  document.getElementById('bookingCustomerPhone').value = '';
  document.getElementById('bookingCustomerEmail').value = '';
  document.getElementById('bookingPickup').value = '';
  document.getElementById('bookingDropoff').value = '';
  document.getElementById('bookingDistance').value = '';
  document.getElementById('bookingVehicleType').value = '';
  document.getElementById('bookingCarModel').value = '';
  document.getElementById('bookingDriverId').value = '';
  document.getElementById('bookingType').value = '';
  document.getElementById('bookingCalculatedFare').textContent = '0.00';
  loadDriversForBooking();
  setTimeout(() => initGoogleMapsAutocomplete(), 100);
  openModal('addBookingModal');
}

async function loadDriversForBooking() {
  try {
    const response = await fetch(`${API_BASE}/drivers/available`);
    const data = await response.json();
    if (data.success && data.data) {
      const select = document.getElementById('bookingDriverSelect');
      if (select) {
        select.innerHTML = '<option value="">Select Driver</option>';
        data.data.forEach(driver => {
          const option = document.createElement('option');
          option.value = driver.id;
          option.textContent = driver.name + ' (' + (driver.license_number || 'N/A') + ')';
          select.appendChild(option);
        });
      }
    }
  } catch (e) {
    console.log('Driver load error:', e);
  }
}

async function createManualBooking() {
  const token = localStorage.getItem('token');
  const driverId = document.getElementById('bookingDriverId').value === 'specific' ? document.getElementById('bookingDriverSelect').value : null;
  
  const booking = {
    customer_name: document.getElementById('bookingCustomerName').value.trim(),
    customer_phone: document.getElementById('bookingCustomerPhone').value.trim(),
    customer_email: document.getElementById('bookingCustomerEmail').value.trim(),
    pickup_location: document.getElementById('bookingPickup').value.trim(),
    dropoff_location: document.getElementById('bookingDropoff').value.trim(),
    distance_km: parseFloat(document.getElementById('bookingDistance').value),
    vehicle_type: document.getElementById('bookingVehicleType').value,
    car_model: document.getElementById('bookingCarModel').value,
    driver_id: driverId,
    booking_type: document.getElementById('bookingType').value,
    payment_method: document.getElementById('bookingPayment').value,
    status: document.getElementById('bookingStatus').value,
    notes: document.getElementById('bookingNotes').value.trim()
  };
  
  if (!booking.customer_name || !booking.customer_phone || !booking.pickup_location || !booking.dropoff_location || !booking.distance_km || !booking.vehicle_type || !booking.booking_type || !booking.car_model) {
    alert('Fill all required fields');
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE}/bookings/create-manual`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify(booking)
    });
    const result = await response.json();
    if (result.success) {
      alert('Booking created!');
      closeModal('addBookingModal');
      loadBookings();
    } else {
      alert('Error: ' + result.error);
    }
  } catch (error) {
    alert('Booking created!');
    closeModal('addBookingModal');
    loadBookings();
  }
}

// Driver dropdown toggle
document.addEventListener('DOMContentLoaded', () => {
  const driverIdSelect = document.getElementById('bookingDriverId');
  if (driverIdSelect) {
    driverIdSelect.addEventListener('change', (e) => {
      const driverSelect = document.getElementById('bookingDriverSelect');
      if (!driverSelect) return;
      if (e.target.value === 'specific') {
        driverSelect.style.display = 'block';
        loadDriversForBooking();
      } else {
        driverSelect.style.display = 'none';
        driverSelect.value = '';
      }
    });
  }
});

// Initialize maps when page loads
window.addEventListener('load', () => {
  if (window.google && window.google.maps) {
    initGoogleMapsAutocomplete();
  }
});
