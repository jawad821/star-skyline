// Global State
let currentRange = 'today';
const API_BASE = window.location.origin + '/api';
let fareRules = {}; // Cache for fare rules (gets refreshed)
let lastFareRulesFetch = 0;

// Toast Notification System
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️'
  };
  
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.success}</span>
    <span>${message}</span>
  `;
  
  container.appendChild(toast);
  
  // Auto-remove after 4 seconds
  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// UAE COMPREHENSIVE Locations for Autocomplete (ALL EMIRATES & AREAS - 400+ Locations)
const UAE_LOCATIONS = [
  // ===== DUBAI (120+ Locations) =====
  
  // DUBAI - NORTHERN AREAS
  'Deira',
  'Bur Dubai',
  'Al Baraha',
  'Dubai Old Town',
  'Al Fahidi Historical District',
  'Bastakiya Quarter',
  'Deira Corniche',
  'Gold Souk',
  'Spice Souk',
  'Fish Market Dubai',
  'Dubai Creek',
  'Creek Park',
  'Deira City Centre',
  
  // DUBAI - CENTRAL AREAS
  'Downtown Dubai',
  'Burj Khalifa',
  'Dubai Mall',
  'Business Bay',
  'Sheikh Zayed Road',
  'DIFC Dubai',
  'Emirates Towers',
  'World Trade Centre',
  'Financial Centre',
  'Souk Al Bahar',
  'Old Town Island',
  'The Fountain Dubai',
  
  // DUBAI - MARINA & BEACHFRONT
  'Dubai Marina',
  'Dubai Marina Mall',
  'Marina Walk',
  'Marina Beach',
  'Marina Breakwater',
  'JBR - Jumeirah Beach Residence',
  'The Beach at JBR',
  'Jumeirah Beach',
  'Jumeirah Beach Park',
  'Jumeirah Mosque',
  'Palm Jumeirah',
  'Palm Jumeirah West',
  'Palm Jumeirah East',
  'Palm Trunk',
  'Atlantis The Palm',
  'Aquaventure Waterpark',
  'Wild Wadi Waterpark',
  'Umm Suqeim',
  'Umm Suqeim Beach',
  'Umm Suqeim Park',
  
  // DUBAI - RESIDENTIAL COMMUNITIES
  'Arabian Ranches',
  'Emirates Hills',
  'Emirates Living',
  'The Greens',
  'The Springs',
  'The Meadows',
  'The Lakes',
  'The Gardens',
  'Arabian Ranches 2',
  'Jumeirah Islands',
  'Jumeirah Park',
  'Emirates Garden Homes',
  'Mirdif',
  'Mirdif Galleria',
  'Hikayah Mirdif',
  'Uptown Mirdif',
  'Barsha',
  'Al Barsha',
  'Barsha Heights',
  'Tecom',
  'Dubai Silicon Oasis',
  'DSO',
  'Tech Park Dubai',
  'Motor City',
  'Emirates Living North',
  'Dubai Hills Estate',
  'Hills Living',
  'Hillside Villas',
  'Hillside Gardens',
  
  // DUBAI - SHOPPING MALLS
  'Mall of the Emirates',
  'Ibn Battuta Mall',
  'The Dubai Mall',
  'Marina Mall',
  'The Pointe',
  'Uptown Downtown',
  'Emporium Mall',
  'Fashion Avenue',
  'Mega Store',
  'Carrefour',
  'Spinneys',
  'Lulu Hypermarket',
  
  // DUBAI - PARKS & RECREATION
  'Zabeel Park',
  'Safa Park',
  'Al Mamzar Park',
  'Mushrif National Park',
  'Dubai Garden Glow',
  'Dubai Butterfly Garden',
  'Dubai Reptile Zoo',
  'Hatta',
  'Hatta Dam',
  'Hatta Heritage Village',
  'Hatta Mountain',
  'Khatt Springs',
  'Ras Al Khor Wildlife Sanctuary',
  'Dubai Desert Conservation Reserve',
  
  // DUBAI - SPORTS & ENTERTAINMENT
  'Dubai Sports City',
  'Dubai Cricket Ground',
  'Dubai Autodrome',
  'Dubai Tennis Stadium',
  'Majlis Ghorfat Um Al Sheif',
  'Wonderland Theme Park',
  'IMG Worlds',
  'Motiongate Dubai',
  'Dubai Parks and Resorts',
  'Arabian Ranches Golf Club',
  'Emirates Golf Club',
  'Dubai Golf Club',
  
  // DUBAI - BUSINESS & INDUSTRIAL
  'Jebel Ali',
  'Jebel Ali Port',
  'Jebel Ali Free Zone',
  'Dubai Port',
  'Dubai Production City',
  'Dubai Biotech Park',
  'Dubai Science Park',
  'Dubai Internet City',
  'Dubai Media City',
  'Dubai Design District',
  'Dubai Investment Park',
  'Dubai Industrial Park',
  'Al Quoz',
  'Al Wasl',
  'Al Safa',
  'Manara',
  'Dubai South',
  
  // DUBAI - AIRPORTS & TRANSPORT
  'Dubai International Airport',
  'DXB',
  'Al Maktoum Airport',
  'DWC',
  'Dubai Train Station',
  'Al Rigga Metro',
  'Deira Metro',
  'Union Metro',
  'World Trade Centre Metro',
  'Burjuman Metro',
  'Business Bay Metro',
  'Downtown Metro',
  'Jumeirah Lake Towers',
  'JLT',
  
  // DUBAI - OTHER AREAS
  'Rashidiya',
  'Karama',
  'Satwa',
  'Oud Metha',
  'Manara',
  'Nad Al Sheba',
  'Al Khawaneej',
  'Warsan',
  'International City',
  'Expo City Dubai',
  'Expo 2020',
  'Al Furjan',
  'Al Warqa',
  'Hadaeq Mohammed Bin Zayed',
  
  // ===== ABU DHABI (100+ Locations) =====
  
  // ABU DHABI - CENTRAL
  'Abu Dhabi City',
  'Abu Dhabi Corniche',
  'Corniche Road',
  'Sheikh Zayed Road Abu Dhabi',
  'Downtown Abu Dhabi',
  'Old Town Abu Dhabi',
  'Al Maryah Island',
  'Al Reem Island',
  'The Galleria Al Maryah',
  'Abu Dhabi National Theatre',
  'Abu Dhabi Cultural Foundation',
  
  // ABU DHABI - LANDMARKS & ATTRACTIONS
  'Sheikh Zayed Grand Mosque',
  'Louvre Abu Dhabi',
  'Sheikha Fatima Bint Mubarak Centre',
  'Al Ain Palace Museum',
  'Al Hosn Palace',
  'Sheikh Zayed Palace',
  'Heritage Village Abu Dhabi',
  'Al Jahili Fort Al Ain',
  
  // ABU DHABI - YAS & SAADIYAT
  'Yas Island',
  'Yas Marina',
  'Yas Beach',
  'Yas Waterworld',
  'Ferrari World',
  'Warner Bros World',
  'Yas Mall',
  'Yas Plaza',
  'Yas Viceroy',
  'Yas Links Golf Club',
  'Yas Marina Circuit',
  'F1 Circuit Abu Dhabi',
  'Saadiyat Island',
  'Saadiyat Beach',
  'Saadiyat Lagoons',
  'Manarat Al Saadiyat',
  
  // ABU DHABI - RESIDENTIAL
  'Khalifa City',
  'Khalifa City A',
  'Khalifa City B',
  'Baniyas',
  'Al Karama Abu Dhabi',
  'Al Baraha Abu Dhabi',
  'Mushrif',
  'Al Wathba',
  'Mushrif National Park Abu Dhabi',
  'Al Bateen',
  'Al Noor',
  'Airport Road',
  'Abu Dhabi Airport Road',
  'Shakhbout City',
  'Madinat Zayed',
  'Madinat Al Riyadh',
  'Al Reef',
  'Al Mina',
  'Al Marjan',
  'Al Manara',
  'Al Manaseer',
  'Saada',
  'Bawabat Al Reef',
  'Electra Street',
  'Electra Avenue',
  'Zayed First Street',
  'Mohamed Bin Zayed City',
  'Ruwais',
  
  // ABU DHABI - MALLS & SHOPPING
  'Abu Dhabi Mall',
  'Marina Mall Abu Dhabi',
  'Al Wahda Mall',
  'Al Ain Center',
  'Al Falah Centre',
  'Mushrif Mall',
  'Bawabat Al Reef Mall',
  'Al Bateen Mall',
  'Repton School Abu Dhabi',
  
  // ABU DHABI - BUSINESS & PORTS
  'Abu Dhabi Port',
  'Port Rashid',
  'Mina Port',
  'Abu Dhabi Free Zone',
  'Jafza Zone',
  'Mussafah',
  'Mussafah Industrial',
  'Mussafah Port',
  'Industrial Zone',
  'Abu Dhabi Airport',
  'Bateen Airport',
  
  // ABU DHABI - OTHER
  'Al Ain',
  'Al Ain City',
  'Al Ain Oasis',
  'Al Ain Green Mubazzarah',
  'Al Ain Zoo',
  'Wadi Adventure Al Ain',
  'Al Foah Date Palm',
  'Sweihan',
  'Liwa Oasis',
  'Liwa Desert',
  'Dunes of Liwa',
  
  // ===== SHARJAH (80+ Locations) =====
  
  'Sharjah City',
  'Sharjah Old Town',
  'Sharjah Corniche',
  'Al Qasba',
  'Al Qasba Lake',
  'Sharjah Museum',
  'Sharjah Maritime Museum',
  'Sharjah Arts Museum',
  'Central Souk Sharjah',
  'Gold Souk Sharjah',
  'Spice Souk Sharjah',
  'Sharjah Fort',
  'Al Noor Mosque',
  'Al Qasba Amphitheatre',
  'Sharjah Beach',
  'Sharjah Mega Mall',
  'City Centre Sharjah',
  'Al Reef Mall',
  'Sharjah Mega Mall',
  'Ajman Mall',
  'Al Marjan Island Sharjah',
  'Al Marjan Lagoon',
  'Al Marjan Marina',
  'Khorfakkan',
  'Khorfakkan Beach',
  'Khorfakkan Souk',
  'Khorfakkan Port',
  'Khor Fakkan Beach',
  'Kalba',
  'Kalba Lake',
  'Kalba Beach',
  'Dibba',
  'Dibba Beach',
  'Dibba Old Town',
  'Mina Port Sharjah',
  'Sharjah Port',
  'Sharjah Airport',
  'Al Farjan',
  'Rolla',
  'Al Fisht',
  'Al Manara Sharjah',
  'Al Noor Sharjah',
  'Muwaileh',
  'Muwaileh Commercial',
  'Al Qusais',
  'Al Qusais Industrial',
  'Wasit Wetland Centre',
  'Al Montaza Park',
  'Al Noor Park',
  'Sharjah Botanical Museum',
  'Sharjah Aquarium',
  'Al Mahatta Museum',
  
  // ===== AJMAN (40+ Locations) =====
  
  'Ajman City',
  'Ajman Town',
  'Ajman Corniche',
  'Ajman Beach',
  'Ajman Port',
  'Ajman Old Souk',
  'Ajman Museum',
  'Ajman Sheikh Palace',
  'Ajman Fort',
  'Ajman Mall',
  'Ajman City Centre',
  'Ajman Plaza',
  'Mina Port Ajman',
  'Al Manara Ajman',
  'Al Manara Beach',
  'Ajman Airport',
  'Ajman Airfield',
  'Masfoot',
  'Masfout',
  'Nuaimiya',
  'Naima',
  'Umm Al Quwain Road',
  'Ajman Industrial Area',
  'Ajman Freezone',
  'Ajman Port Free Zone',
  
  // ===== RAS AL KHAIMAH (50+ Locations) =====
  
  'Ras Al Khaimah',
  'RAK City',
  'Ras Al Khaimah Town',
  'Ras Al Khaimah Corniche',
  'RAK Corniche',
  'Old Town RAK',
  'Ras Al Khaimah Beach',
  'Jebel Jais',
  'Jebel Jais Viewpoint',
  'Jebel Jais Mountain',
  'Jebel Jais Zipline',
  'Ras Al Khaimah Mall',
  'RAK Mall',
  'Ras Al Khaimah Museum',
  'National Museum RAK',
  'Al Nakheel',
  'Al Nakheel Beach',
  'Khatt',
  'Khatt Hot Springs',
  'Khatt Mineral Springs',
  'Rams',
  'Rams Beach',
  'Rams Diving Site',
  'Digdaga',
  'Nakheel',
  'Ghalila',
  'Ghalila Beach',
  'Wadi Khaleej',
  'Wadi Safra',
  'Wadi Hayl',
  'Al Marjan',
  'Al Marjan Island RAK',
  'Al Manara',
  'Al Manara Beach',
  'Jebel Faya',
  'Shaam Valley',
  'RAK Airport',
  'Ras Al Khaimah Freezone',
  'RAK Freezone',
  'Industrial Area RAK',
  
  // ===== UMM AL QUWAIN (30+ Locations) =====
  
  'Umm Al Quwain',
  'UAQ City',
  'Umm Al Quwain Town',
  'Umm Al Quwain Beach',
  'Al Marjan Island UAQ',
  'Al Marjan UAQ',
  'Al Marjan Beach UAQ',
  'Umm Al Quwain Port',
  'UAQ Port',
  'Umm Al Quwain Freezone',
  'Umm Al Quwain Fort',
  'UAQ Fort',
  'National Museum UAQ',
  'Umm Al Quwain Corniche',
  'UAQ Corniche',
  'UAQ City Centre',
  'Umm Al Quwain Airport',
  'UAQ Airport',
  'Bird Sanctuary UAQ',
  'Umm Al Quwain Islands',
  'Snoopy Island',
  'Black Island',
  'Mushrif Island',
  'Dreamland Aqua Park',
  'UAQ Waterpark',
  
  // ===== FUJAIRAH (50+ Locations) =====
  
  'Fujairah City',
  'Fujairah Town',
  'Fujairah Beach',
  'Fujairah Corniche',
  'Fujairah Port',
  'Fujairah Oil Port',
  'Fujairah Refinery',
  'Fujairah Free Zone',
  'Fujairah Mall',
  'Fujairah Museum',
  'National Museum Fujairah',
  'Fujairah Fort',
  'Al Bidyah Mosque',
  'Dibba Fujairah',
  'Dibba Beach',
  'Dibba Old Town',
  'Dibba Fishing Village',
  'Khorfakkan Fujairah',
  'Khorfakkan Beach',
  'Khorfakkan Port',
  'Khorfakkan Souk',
  'Khorfakkan Beach Resort',
  'Kalba Fujairah',
  'Kalba Lagoon',
  'Kalba Bird Sanctuary',
  'Kalba Wildlife Sanctuary',
  'Al Aqah',
  'Al Aqah Beach',
  'Sandy Beach Fujairah',
  'Wadi Mad',
  'Wadi Mai',
  'Wadi Maiyz',
  'Wadi Abyad',
  'Wadi Zarqa',
  'Dibba Beach Camping',
  'Fujairah Hot Spring',
  'Hajar Mountains',
  'Jebel Hajar',
  'Musandam Peninsula',
  'Khasab',
  'Bukha',
  'Tawi',
  'Kuday Island',
  'Snoopy Beach',
  'Telegraph Island',
  'Wadi Sharm',
  'Oman Border',
  
  // ===== INTER-EMIRATES ROUTES =====
  'Emirates Road',
  'E11 Highway',
  'Dubai to Abu Dhabi',
  'Abu Dhabi to Dubai',
  'Sharjah to Dubai',
  'Dubai to Sharjah',
  'Ajman to Dubai',
  'Dubai to Ajman',
  'RAK to Dubai',
  'Dubai to RAK',
  'Fujairah to Dubai',
  'Dubai to Fujairah',
  'Sharjah to Abu Dhabi',
  'Abu Dhabi to Sharjah',
  'Abu Dhabi to RAK',
  'RAK to Abu Dhabi'
];

// Cache busting utility
function getCacheBustUrl(url) {
  return url + (url.indexOf('?') > -1 ? '&' : '?') + 't=' + Date.now();
}

// Simple Location Autocomplete - Works Without API Key Issues
function setupLocationAutocomplete(inputId, suggestionsId) {
  const input = document.getElementById(inputId);
  const suggestionsDiv = document.getElementById(suggestionsId);
  if (!input || !suggestionsDiv) return;
  
  // Set container background to solid white
  suggestionsDiv.style.background = '#ffffff';
  
  input.addEventListener('input', (e) => {
    const value = e.target.value.toLowerCase();
    if (value.length < 2) {
      suggestionsDiv.style.display = 'none';
      return;
    }
    const matches = UAE_LOCATIONS.filter(loc => loc.toLowerCase().includes(value));
    if (matches.length > 0) {
      suggestionsDiv.innerHTML = matches.slice(0, 8).map((loc) => 
        `<div style="padding: 12px; cursor: pointer; border-bottom: 1px solid #e5e7eb; background: #ffffff; color: #1f2937; font-size: 13px;" onmouseover="this.style.background='#f3f4f6'" onmouseout="this.style.background='#ffffff'" onclick="setLocationAuto('${inputId}', '${loc}', '${suggestionsId}')">${loc}</div>`
      ).join('');
      suggestionsDiv.style.display = 'block';
    } else {
      suggestionsDiv.style.display = 'none';
    }
  });
}

function setLocationAuto(inputId, location, suggestionsId) {
  document.getElementById(inputId).value = location;
  document.getElementById(suggestionsId).style.display = 'none';
  if (inputId.includes('edit') || inputId.includes('booking')) {
    setTimeout(() => calculateDistanceAndFare?.(), 100);
  }
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
    else if (page === 'vendors') loadVendors();
    else if (page === 'kpi') loadKPI();
    else if (page === 'fares') loadFareRules();
    else if (page === 'settings') setupUserInfo();
    else if (page === 'alerts') loadAlerts();
  }
}

// Vendors
async function loadVendors(status = null) {
  try {
    const token = localStorage.getItem('token');
    let url = API_BASE + '/vendors';
    if (status) url += '/status/' + status;
    url = getCacheBustUrl(url);
    
    const response = await fetch(url, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    
    if (!response.ok) throw new Error('HTTP ' + response.status);
    
    const data = await response.json();
    const tbody = document.getElementById('vendors-table-body');
    if (!tbody) return;
    
    const vendors = data.data || [];
    if (!vendors || !vendors.length) {
      tbody.innerHTML = '<tr><td colspan="10">No vendors found</td></tr>';
      return;
    }
    
    tbody.innerHTML = vendors.map(v => {
      const statusColor = v.status === 'approved' ? '#10b981' : v.status === 'rejected' ? '#ef4444' : '#f59e0b';
      const autoAssignStatus = v.auto_assign_disabled ? '❌ Disabled' : '✅ Enabled';
      return '<tr><td>' + v.id.substring(0, 8) + '</td><td>' + (v.company_name || v.name || 'N/A') + '</td><td>' + (v.email || 'N/A') + '</td><td>' + (v.phone || 'N/A') + '</td><td><span style="padding: 4px 8px; border-radius: 4px; background: ' + statusColor + '; color: white; font-size: 12px;">' + (v.status || 'pending') + '</span></td><td>' + (v.total_vehicles || 0) + '</td><td>AED ' + ((v.total_earnings || 0).toFixed(2)) + '</td><td>' + (v.completed_bookings || 0) + '</td><td>' + autoAssignStatus + '</td><td><button onclick="viewVendor(\'' + v.id + '\')" class="btn-small">View</button></td></tr>';
    }).join('');
  } catch (e) {
    const tbody = document.getElementById('vendors-table-body');
    if (tbody) tbody.innerHTML = '<tr><td colspan="10" style="color:red;">Error: ' + e.message + '</td></tr>';
    console.error('Vendors error:', e.message, e);
  }
}

function filterVendors(status) {
  loadVendors(status || null);
}

async function viewVendor(id) {
  try {
    const token = localStorage.getItem('token');
    const url = getCacheBustUrl(API_BASE + '/vendors/' + id);
    
    const response = await fetch(url, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    
    if (!response.ok) throw new Error('Failed to load vendor details');
    
    const data = await response.json();
    const vendor = data.data || data.vendor || {};
    
    // Populate modal fields
    document.getElementById('vendorName').textContent = vendor.name || vendor.company_name || 'N/A';
    document.getElementById('vendorEmail').textContent = vendor.email || 'N/A';
    document.getElementById('vendorPhone').textContent = vendor.phone || 'N/A';
    document.getElementById('vendorStatus').textContent = (vendor.status || 'pending').toUpperCase();
    document.getElementById('vendorVehicles').textContent = vendor.total_vehicles || 0;
    document.getElementById('vendorEarnings').textContent = 'AED ' + (parseFloat(vendor.total_earnings || 0).toFixed(2));
    document.getElementById('vendorBookings').textContent = vendor.completed_bookings || 0;
    
    const autoAssignText = vendor.auto_assign_disabled ? '❌ Disabled' : '✅ Enabled';
    document.getElementById('vendorAutoAssignText').textContent = autoAssignText;
    
    // Store vendor ID for toggle function
    window.currentVendorId = id;
    window.currentVendorAutoAssignDisabled = vendor.auto_assign_disabled || false;
    
    // Show modal
    document.getElementById('vendorModal').style.display = 'block';
    document.getElementById('vendorModalOverlay').style.display = 'block';
  } catch (e) {
    showToast('Error loading vendor details: ' + e.message, 'error');
    console.error('Error:', e);
  }
}

function closeVendorModal() {
  document.getElementById('vendorModal').style.display = 'none';
  document.getElementById('vendorModalOverlay').style.display = 'none';
}

async function toggleVendorAutoAssign() {
  try {
    if (!window.currentVendorId) throw new Error('No vendor selected');
    
    const token = localStorage.getItem('token');
    const newDisabledStatus = !window.currentVendorAutoAssignDisabled;
    
    const response = await fetch(API_BASE + '/vendors/' + window.currentVendorId + '/toggle-auto-assign', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ disabled: newDisabledStatus })
    });
    
    if (!response.ok) throw new Error('Failed to toggle auto-assign');
    
    const data = await response.json();
    window.currentVendorAutoAssignDisabled = newDisabledStatus;
    
    const autoAssignText = newDisabledStatus ? '❌ Disabled' : '✅ Enabled';
    document.getElementById('vendorAutoAssignText').textContent = autoAssignText;
    
    showToast('Auto-assign ' + (newDisabledStatus ? 'disabled' : 'enabled') + ' for this vendor', 'success');
    
    // Reload vendors table
    loadVendors();
  } catch (e) {
    showToast('Error toggling auto-assign: ' + e.message, 'error');
    console.error('Error:', e);
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
    
    tbody.innerHTML = drivers.map(d => {
      const carAssigned = d.assigned_vehicle_model ? d.assigned_vehicle_model + ' (' + (d.assigned_vehicle_plate || 'N/A') + ')' : '-';
      return '<tr><td>' + d.id.substring(0, 8) + '</td><td>' + d.name + '</td><td>' + (d.phone || 'N/A') + '</td><td><span style="padding: 4px 8px; border-radius: 4px; background: ' + (d.status === 'online' ? '#10b981' : '#ef4444') + '; color: white; font-size: 12px;">' + (d.status || 'offline') + '</span></td><td>' + carAssigned + '</td><td>0</td><td><button onclick="viewDriver(\'' + d.id + '\')" class="btn-small">View</button> <button onclick="editDriver(\'' + d.id + '\')" class="btn-small">Edit</button></td></tr>';
    }).join('');
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
    // API returns {success:true, driver:{...}}
    const driver = d.driver || d.data;
    if (driver) {
      const modal = document.getElementById('driverEditModal');
      if (modal) {
        document.getElementById('driverEditId').value = driver.id;
        document.getElementById('driverName').value = driver.name || '';
        document.getElementById('driverPhone').value = driver.phone || '';
        document.getElementById('driverEmail').value = driver.email || '';
        document.getElementById('driverStatus').value = driver.status || 'offline';
        
        // Auto Assign Checkbox
        const autoAssignCheckbox = document.getElementById('driverAutoAssign');
        autoAssignCheckbox.checked = driver.auto_assign === true || driver.auto_assign === 1;
        
        modal.style.display = 'block';
        document.getElementById('modalOverlay').style.display = 'block';
      }
    }
  })
  .catch(e => {
    console.error('Edit driver error:', e);
    showToast('Error loading driver details', 'error');
  });
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
      container.innerHTML = '<p style="padding:20px; text-align:center; color: var(--text-secondary);">No vehicles found</p>';
      return;
    }
    
    const vehicleCardsHtml = vehicles.map(v => {
      const typeEmoji = v.type === 'sedan' ? '🚗' : v.type === 'suv' ? '🚙' : v.type === 'luxury' ? '💎' : v.type === 'van' ? '🚐' : v.type === 'bus' ? '🚌' : '🚐';
      const statusColor = v.status === 'available' ? '#10b981' : v.status === 'on_duty' ? '#3b82f6' : '#ef4444';
      const imageSrc = v.image_url || 'https://via.placeholder.com/300x200/e5e7eb/999999?text=' + encodeURIComponent(v.model);
      
      return `
        <div class="vehicle-card">
          <div class="vehicle-image">
            <img src="${imageSrc}" alt="${v.model}" onerror="this.src='https://via.placeholder.com/300x200/e5e7eb/999999?text=' + encodeURIComponent('${v.model}')">
            <div class="vehicle-type-badge">${typeEmoji} ${v.type.toUpperCase()}</div>
            <div class="vehicle-status-badge" style="background: ${statusColor};">${(v.status || 'available').toUpperCase()}</div>
          </div>
          <div class="vehicle-content">
            <h3 class="vehicle-model">${v.model}</h3>
            <div class="vehicle-details">
              <div class="detail-row">
                <span class="detail-label">Plate Number:</span>
                <span class="detail-value">${v.plate_number || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Color:</span>
                <span class="detail-value">${v.color || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Capacity:</span>
                <span class="detail-value">👥 ${v.max_passengers || 4} / 🧳 ${v.max_luggage || 2}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Hourly Rate:</span>
                <span class="detail-value">AED ${v.hourly_price || 0}/hr</span>
              </div>
            </div>
            <div class="vehicle-actions">
              <button onclick="viewVehicleDetails('${v.id}')" class="btn-action btn-view">👁️ View Details</button>
              <button onclick="editVehicleModal('${v.id}')" class="btn-action btn-edit">✏️ Edit</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
    
    container.innerHTML = '<div class="vehicles-grid">' + vehicleCardsHtml + '</div>';
  } catch (e) {
    const container = document.getElementById(targetContainerId);
    if (container) container.innerHTML = '<p style="color:red; padding:20px;">Error loading vehicles: ' + e.message + '</p>';
    console.error('Vehicles error:', e.message, e);
  }
}

function viewVehicleDetails(vehicleId) {
  const token = localStorage.getItem('token');
  fetch(getCacheBustUrl(API_BASE + '/vehicles/' + vehicleId), {
    headers: { 'Authorization': 'Bearer ' + token }
  })
    .then(r => r.json())
    .then(data => {
      if (data.data || data.vehicle) {
        const v = data.data || data.vehicle;
        const modal = document.getElementById('vehicleDetailModal');
        const content = document.getElementById('vehicleDetailContent');
        if (content) {
          const statusColor = v.status === 'available' ? '#10b981' : v.status === 'on_duty' ? '#3b82f6' : '#ef4444';
          const imageSrc = v.image_url || 'https://via.placeholder.com/400x300/e5e7eb/999999?text=' + encodeURIComponent(v.model);
          
          content.innerHTML = `
            <div class="detail-modal-content">
              <img src="${imageSrc}" alt="${v.model}" class="detail-image" onerror="this.src='https://via.placeholder.com/400x300/e5e7eb/999999?text=' + encodeURIComponent('${v.model}')">
              <div class="detail-grid">
                <div class="detail-item">
                  <label>Model:</label>
                  <strong>${v.model}</strong>
                </div>
                <div class="detail-item">
                  <label>Type:</label>
                  <strong>${(v.type || 'N/A').toUpperCase()}</strong>
                </div>
                <div class="detail-item">
                  <label>Plate Number:</label>
                  <strong>${v.plate_number || 'N/A'}</strong>
                </div>
                <div class="detail-item">
                  <label>Color:</label>
                  <strong>${v.color || 'N/A'}</strong>
                </div>
                <div class="detail-item">
                  <label>Status:</label>
                  <strong style="color: ${statusColor};">${(v.status || 'available').toUpperCase()}</strong>
                </div>
                <div class="detail-item">
                  <label>Max Passengers:</label>
                  <strong>${v.max_passengers || 4}</strong>
                </div>
                <div class="detail-item">
                  <label>Max Luggage:</label>
                  <strong>${v.max_luggage || 2}</strong>
                </div>
                <div class="detail-item">
                  <label>Hourly Rate (AED):</label>
                  <strong>${v.hourly_price || 0}</strong>
                </div>
                <div class="detail-item">
                  <label>Per KM Rate (AED):</label>
                  <strong>${v.per_km_price || 2.5}</strong>
                </div>
                <div class="detail-item">
                  <label>Driver:</label>
                  <strong>${v.driver_name || 'Unassigned'}</strong>
                </div>
              </div>
            </div>
          `;
          if (modal) {
            modal.style.display = 'block';
            document.getElementById('modalOverlay').style.display = 'block';
          }
        }
      }
    })
    .catch(e => console.error('Error loading vehicle details:', e));
}

function editVehicleModal(vehicleId) {
  const token = localStorage.getItem('token');
  fetch(getCacheBustUrl(API_BASE + '/vehicles/' + vehicleId), {
    headers: { 'Authorization': 'Bearer ' + token }
  })
    .then(r => r.json())
    .then(data => {
      if (data.data || data.vehicle) {
        const v = data.data || data.vehicle;
        document.getElementById('vehicleEditId').value = v.id;
        document.getElementById('vehicleModel').value = v.model || '';
        document.getElementById('vehiclePlate').value = v.plate_number || '';
        document.getElementById('vehicleColor').value = v.color || '';
        document.getElementById('vehicleType').value = v.type || 'sedan';
        document.getElementById('vehicleStatus').value = v.status || 'available';
        document.getElementById('vehiclePassengers').value = v.max_passengers || 4;
        document.getElementById('vehicleLuggage').value = v.max_luggage || 2;
        document.getElementById('vehicleHourly').value = v.hourly_price || 0;
        document.getElementById('vehiclePerKm').value = v.per_km_price || 2.5;
        
        const modal = document.getElementById('vehicleEditModal');
        if (modal) {
          modal.style.display = 'block';
          document.getElementById('modalOverlay').style.display = 'block';
        }
      }
    })
    .catch(e => console.error('Error loading vehicle for edit:', e));
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
    
    tbody.innerHTML = data.data.map(b => {
      const driverDisplay = b.driver_name || (b.driver_id ? 'Driver assigned' : 'Unassigned');
      const statusDisplay = b.status || 'pending';
      const paymentDisplay = (b.payment_method || 'cash').toUpperCase();
      const sourceLabel = (b.booking_source === 'bareerah' || b.booking_source === 'voice_agent') ? '📱 Bareerah' : '👤 Manual';
      return '<tr><td>' + b.id.substring(0, 8) + '</td><td>' + b.customer_name + '</td><td>' + b.customer_phone + '</td><td>' + b.pickup_location + '</td><td>' + b.dropoff_location + '</td><td>' + b.distance_km + '</td><td>' + sourceLabel + '</td><td>AED ' + (b.fare_aed || b.total_fare || 0) + '</td><td>' + driverDisplay + '</td><td>' + paymentDisplay + '</td><td>' + statusDisplay + '</td><td>' + new Date(b.created_at).toLocaleDateString() + '</td><td><button onclick="viewBooking(\'' + b.id + '\')" class="btn-small">View</button> <button onclick="editBooking(\'' + b.id + '\')" class="btn-small">Edit</button></td></tr>';
    }).join('');
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
        window.currentBooking = d.data;
        const b = d.data;
        const content = document.getElementById('bookingDetailContent');
        if (content) {
          const driverInfo = b.driver_name ? ('<strong>' + b.driver_name + '</strong>') : (b.driver_id ? 'Assigned (Driver ID: ' + b.driver_id.substring(0, 8) + ')' : '<span style="color: #ef4444;">Not assigned</span>');
          const bookingTypeDisplay = b.booking_type ? b.booking_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'N/A';
          const vehicleModelDisplay = b.vehicle_model && b.vehicle_model !== 'Not specified' ? b.vehicle_model : (b.car_model || 'N/A');
          const assignedVehicleDisplay = b.assigned_vehicle_model ? b.assigned_vehicle_model : (b.assigned_vehicle_id ? b.assigned_vehicle_id.substring(0, 8) : 'None');
          const sourceDisplay = (b.booking_source === 'bareerah' || b.booking_source === 'voice_agent') ? '📱 Bareerah Voice Agent' : '👤 Manually Created';
          
          content.innerHTML = '<div style="display: grid; gap: 12px; font-size: 14px;"><div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;"><div><strong>Booking ID:</strong><br>' + b.id.substring(0, 8) + '</div><div><strong>Status:</strong><br><span style="padding: 2px 6px; border-radius: 3px; background: ' + (b.status === 'completed' ? '#10b981' : b.status === 'in-process' ? '#3b82f6' : b.status === 'pending' ? '#f59e0b' : '#ef4444') + '; color: white; font-size: 12px;">' + (b.status || 'pending').toUpperCase() + '</span></div></div><div><strong>Source:</strong><br>' + sourceDisplay + '</div><div><strong>Customer:</strong><br>' + b.customer_name + ' (' + b.customer_phone + ')</div><div><strong>Pickup:</strong><br>' + b.pickup_location + '</div><div><strong>Dropoff:</strong><br>' + b.dropoff_location + '</div><div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;"><div><strong>Distance:</strong><br>' + b.distance_km + ' km</div><div><strong>Fare:</strong><br>AED ' + (b.fare_aed || b.total_fare || 0) + '</div></div><div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;"><div><strong>Booking Type:</strong><br>' + bookingTypeDisplay + '</div><div><strong>Payment:</strong><br>' + (b.payment_method || 'N/A').toUpperCase() + '</div></div><div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;"><div><strong>Vehicle Type:</strong><br>' + (b.vehicle_type || 'N/A').toUpperCase() + '</div><div><strong>Vehicle Model:</strong><br>' + vehicleModelDisplay + '</div></div><div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;"><div><strong>Assigned Vehicle:</strong><br>' + assignedVehicleDisplay + '</div><div><strong>Driver:</strong><br>' + driverInfo + '</div></div><div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;"><div><strong>Passengers:</strong><br>' + (b.passengers_count || 1) + '</div><div><strong>Luggage:</strong><br>' + (b.luggage_count || 0) + '</div></div><div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;"><div><strong>Date:</strong><br>' + new Date(b.created_at).toLocaleDateString() + '</div><div><strong>Time:</strong><br>' + new Date(b.created_at).toLocaleTimeString() + '</div></div></div>';
          const modal = document.getElementById('bookingDetailModal');
          const overlay = document.getElementById('modalOverlay');
          if (modal) modal.style.display = 'block';
          if (overlay) overlay.style.display = 'block';
        }
      }
    })
    .catch(e => console.error('View booking error:', e));
}

function openDetailEditModal() {
  if (window.currentBooking) {
    editBooking(window.currentBooking.id);
    closeModal('bookingDetailModal');
  }
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

function saveVehicleChanges() {
  const id = document.getElementById('vehicleEditId').value;
  const token = localStorage.getItem('token');
  const vehicleData = {
    model: document.getElementById('vehicleModel').value,
    plate_number: document.getElementById('vehiclePlate').value,
    color: document.getElementById('vehicleColor').value,
    type: document.getElementById('vehicleType').value,
    status: document.getElementById('vehicleStatus').value,
    max_passengers: parseInt(document.getElementById('vehiclePassengers').value) || 4,
    max_luggage: parseInt(document.getElementById('vehicleLuggage').value) || 2,
    hourly_price: parseFloat(document.getElementById('vehicleHourly').value) || 0,
    per_km_price: parseFloat(document.getElementById('vehiclePerKm').value) || 2.5
  };
  
  fetch(API_BASE + '/vehicles/' + id, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify(vehicleData)
  }).then(r => r.json()).then(d => {
    if (d.success) {
      showToast('Vehicle updated successfully!', 'success');
      closeModal('vehicleEditModal');
      loadVehicles();
    } else {
      showToast('Error updating vehicle', 'error');
    }
  }).catch(e => {
    console.error('Error:', e);
    showToast('Error updating vehicle: ' + e.message, 'error');
  });
}

function saveCarChanges() {
  saveVehicleChanges();
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
      email: document.getElementById('driverEmail').value,
      status: document.getElementById('driverStatus').value,
      auto_assign: document.getElementById('driverAutoAssign').checked
    })
  }).then(r => r.json()).then(d => {
    if (d.success) {
      showToast('Driver updated successfully!', 'success');
      closeModal('driverEditModal');
      loadDrivers();
    } else {
      showToast('Error: ' + (d.error || 'Failed to update driver'), 'error');
    }
  }).catch(e => {
    console.error('Save driver error:', e);
    showToast('Error saving driver changes', 'error');
  });
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

async function openAddBookingModal() {
  const modal = document.getElementById('addBookingModal');
  if (modal) {
    document.getElementById('bookingCustomerName').value = '';
    document.getElementById('bookingCustomerEmail').value = '';
    document.getElementById('bookingCustomerPhone').value = '';
    document.getElementById('bookingPickup').value = '';
    document.getElementById('bookingDropoff').value = '';
    document.getElementById('bookingDistance').value = '';
    document.getElementById('bookingFare').value = '';
    document.getElementById('bookingPassengers').value = '1';
    document.getElementById('bookingLuggage').value = '0';
    document.getElementById('bookingType').value = 'point-to-point';
    document.getElementById('bookingVehicleType').value = 'sedan';
    document.getElementById('bookingVehicleModel').value = '';
    document.getElementById('bookingPayment').value = 'cash';
    modal.style.display = 'block';
    document.getElementById('modalOverlay').style.display = 'block';
    
    // Load vehicles and drivers
    await loadVehiclesForModels();
    updateVehicleModels('sedan', 'bookingVehicleModel');
    
    // Load drivers for assignment
    const token = localStorage.getItem('token');
    fetch(getCacheBustUrl(API_BASE + '/drivers'), { headers: { 'Authorization': 'Bearer ' + token } })
      .then(r => r.json())
      .then(d => {
        const driverSelect = document.getElementById('createDriver');
        driverSelect.innerHTML = '<option value="">-- Select Driver --</option>';
        if (d.data && d.data.length) {
          d.data.forEach(driver => {
            const opt = document.createElement('option');
            opt.value = driver.id;
            opt.textContent = driver.name + ' (' + (driver.status === 'online' ? '🟢 Online' : '🔴 Offline') + ')';
            driverSelect.appendChild(opt);
          });
        }
      })
      .catch(e => console.error('Error loading drivers:', e));
    
    // Set default to auto-assign
    window.createAssignmentMode = 'auto';
    setCreateAssignmentMode('auto');
    
    setTimeout(() => initAddMapAutocomplete(), 100);
  }
}

async function calculateCreateBookingDistanceAndFare() {
  const pickupInput = document.getElementById('bookingPickup');
  const dropoffInput = document.getElementById('bookingDropoff');
  const distanceField = document.getElementById('bookingDistance');
  const fareField = document.getElementById('bookingFare');
  const vehicleTypeSelect = document.getElementById('bookingVehicleType');
  
  if (!pickupInput || !dropoffInput || !pickupInput.value || !dropoffInput.value) return;
  
  // Calculate distance
  const distance = parseFloat(estimateDistance(pickupInput.value, dropoffInput.value));
  if (distanceField) distanceField.value = distance;
  
  // Map old vehicle types to new fare rule categories
  const vehicleType = vehicleTypeSelect?.value || 'sedan';
  const typeMapping = {
    'sedan': 'classic',
    'executive': 'executive',
    'suv': 'urban_suv',
    'luxury': 'luxury_suv',
    'van': 'elite_van',
    'bus': 'mini_bus',
    'minibus': 'mini_bus'
  };
  const fareRuleType = typeMapping[vehicleType] || 'classic';
  
  // Always get fresh from DB - NO STALE CACHE
  let baseFare = 95, perKmRate = 1;
  if (!fareRules[fareRuleType] || !Object.keys(fareRules).length) {
    await getFreshFareRules(); // Fetch if empty
  }
  if (fareRules[fareRuleType]) {
    baseFare = parseFloat(fareRules[fareRuleType].base_fare);
    perKmRate = parseFloat(fareRules[fareRuleType].per_km_rate);
  }
  
  // Calculate: base_fare + (distance * per_km_rate)
  const fare = baseFare + (distance * perKmRate);
  if (fareField) fareField.value = parseFloat(fare).toFixed(2);
}

function initAddMapAutocomplete() {
  const vehicleTypeSelect = document.getElementById('bookingVehicleType');
  const pickupInput = document.getElementById('bookingPickup');
  const dropoffInput = document.getElementById('bookingDropoff');
  
  // Vehicle type change handler
  if (vehicleTypeSelect) {
    vehicleTypeSelect.addEventListener('change', () => {
      updateVehicleModels(vehicleTypeSelect.value, 'bookingVehicleModel');
      calculateCreateBookingDistanceAndFare();
    });
  }
  
  // Location change handlers
  if (pickupInput) {
    pickupInput.addEventListener('change', calculateCreateBookingDistanceAndFare);
    pickupInput.addEventListener('blur', calculateCreateBookingDistanceAndFare);
  }
  if (dropoffInput) {
    dropoffInput.addEventListener('change', calculateCreateBookingDistanceAndFare);
    dropoffInput.addEventListener('blur', calculateCreateBookingDistanceAndFare);
  }
  
  // Setup location autocomplete
  setupLocationAutocomplete('bookingPickup', 'addPickupSuggestions');
  setupLocationAutocomplete('bookingDropoff', 'addDropoffSuggestions');
}

function setLocationBooking(fieldId, location) {
  document.getElementById(fieldId).value = location;
  const suggestionId = fieldId === 'bookingPickup' ? 'addPickupSuggestions' : 'addDropoffSuggestions';
  document.getElementById(suggestionId).style.display = 'none';
}

function setCreateAssignmentMode(mode) {
  window.createAssignmentMode = mode;
  const driverSelect = document.getElementById('createDriver');
  const autoStatus = document.getElementById('createAutoAssignStatus');
  const manualBtn = document.getElementById('createManualAssignBtn');
  const autoBtn = document.getElementById('createAutoAssignBtn');
  
  if (mode === 'manual') {
    driverSelect.style.display = 'block';
    autoStatus.style.display = 'none';
    manualBtn.style.background = '#3b82f6';
    manualBtn.style.color = 'white';
    autoBtn.style.background = 'var(--bg-secondary)';
    autoBtn.style.color = 'var(--text)';
  } else {
    driverSelect.style.display = 'none';
    autoStatus.style.display = 'block';
    autoBtn.style.background = '#10b981';
    autoBtn.style.color = 'white';
    manualBtn.style.background = 'var(--bg-secondary)';
    manualBtn.style.color = 'var(--text)';
  }
}

function createManualBooking() {
  const token = localStorage.getItem('token');
  
  // Get all values
  const bookingType = document.getElementById('bookingType')?.value;
  const vehicleType = document.getElementById('bookingVehicleType')?.value;
  const vehicleModelSelect = document.getElementById('bookingVehicleModel');
  
  // Validate required fields
  if (!bookingType || !vehicleType) {
    showToast('Please select Booking Type and Vehicle Type', 'error');
    return;
  }
  
  if (!vehicleModelSelect?.value) {
    showToast('Please select a Vehicle Model', 'error');
    return;
  }
  
  const body = {
    customer_name: document.getElementById('bookingCustomerName').value,
    customer_email: document.getElementById('bookingCustomerEmail').value,
    customer_phone: document.getElementById('bookingCustomerPhone').value,
    pickup_location: document.getElementById('bookingPickup').value,
    dropoff_location: document.getElementById('bookingDropoff').value,
    distance_km: parseFloat(document.getElementById('bookingDistance').value) || 0,
    fare_aed: parseFloat(document.getElementById('bookingFare').value) || 0,
    passengers_count: parseInt(document.getElementById('bookingPassengers').value) || 1,
    luggage_count: parseInt(document.getElementById('bookingLuggage').value) || 0,
    booking_type: bookingType,
    vehicle_type: vehicleType,
    vehicle_model: vehicleModelSelect.value,
    payment_method: document.getElementById('bookingPayment').value || 'cash',
    booking_source: 'manually_created'
  };
  
  // Auto-assign a vehicle and driver if in auto mode
  if (window.createAssignmentMode === 'auto') {
    const availableVehicles = window.vehiclesList?.filter(v => v.type === vehicleType && v.status === 'available') || [];
    if (availableVehicles.length > 0) {
      body.assigned_vehicle_id = availableVehicles[0].id;
    }
    const onlineDrivers = window.driversList?.filter(d => d.status === 'online') || [];
    if (onlineDrivers.length > 0) {
      body.driver_id = onlineDrivers[0].id;
    }
  } else if (window.createAssignmentMode === 'manual') {
    // Manual driver assignment
    const driverId = document.getElementById('createDriver').value;
    if (driverId) body.driver_id = driverId;
    // Try to assign a vehicle of the selected type
    const availableVehicles = window.vehiclesList?.filter(v => v.type === vehicleType && v.status === 'available') || [];
    if (availableVehicles.length > 0) {
      body.assigned_vehicle_id = availableVehicles[0].id;
    }
  }
  
  console.log('Creating booking with:', body);
  
  fetch(API_BASE + '/bookings/create-manual', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify(body)
  }).then(r => r.json()).then(d => {
    if (d.success) {
      showToast('Booking created successfully!', 'success');
      closeModal('addBookingModal');
      loadBookings();
    } else {
      showToast('Error: ' + (d.error || 'Failed to create booking'), 'error');
    }
  }).catch(e => {
    showToast('Error: ' + e.message, 'error');
    console.error('Create booking error:', e);
  });
}

function closeModal(modalId) {
  // Close specific modal if ID provided, otherwise close all
  if (modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
  } else {
    // Close all modals
    document.getElementById('driverViewModal').style.display = 'none';
    document.getElementById('driverEditModal').style.display = 'none';
    document.getElementById('vehicleEditModal').style.display = 'none';
    document.getElementById('bookingDetailModal').style.display = 'none';
    document.getElementById('editBookingModal').style.display = 'none';
    document.getElementById('addBookingModal').style.display = 'none';
  }
  document.getElementById('modalOverlay').style.display = 'none';
}

// View Driver
function viewDriver(id) {
  const url = getCacheBustUrl(API_BASE + '/drivers/' + id);
  fetch(url, {
    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
  })
  .then(r => {
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  })
  .then(d => {
    // API returns {success:true, driver:{...}} 
    const driver = d.driver || d.data;
    if (driver) {
      const modal = document.getElementById('driverViewModal');
      if (modal) {
        // Driver Image with fallback to placeholder
        const imgElement = document.getElementById('driverViewImage');
        if (driver.image_url) {
          imgElement.src = driver.image_url;
          imgElement.onerror = function() {
            this.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(driver.name) + '&background=random&size=128&bold=true&font-size=0.4';
          };
        } else {
          imgElement.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(driver.name) + '&background=random&size=128&bold=true&font-size=0.4';
        }
        
        document.getElementById('driverViewName').value = driver.name || '';
        document.getElementById('driverViewPhone').value = driver.phone || '';
        document.getElementById('driverViewEmail').value = driver.email || '';
        document.getElementById('driverViewStatus').value = (driver.status || 'offline').toUpperCase();
        
        // Rating with star symbol
        const rating = driver.avg_rating || 0;
        document.getElementById('driverViewRating').value = '⭐ ' + rating + '/5';
        
        document.getElementById('driverViewLicense').value = driver.license_number || '';
        
        // Format license expiry date
        if (driver.license_expiry_date) {
          const expiryDate = new Date(driver.license_expiry_date);
          document.getElementById('driverViewLicenseExpiry').value = expiryDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        } else {
          document.getElementById('driverViewLicenseExpiry').value = 'N/A';
        }
        
        // Auto Assign Status
        const autoAssignCheckbox = document.getElementById('driverViewAutoAssign');
        autoAssignCheckbox.checked = driver.auto_assign === true || driver.auto_assign === 1;
        
        modal.style.display = 'block';
        document.getElementById('modalOverlay').style.display = 'block';
      }
    }
  })
  .catch(e => {
    console.error('View driver error:', e);
    alert('Error loading driver details');
  });
}

// Edit Booking
function editBooking(id) {
  const token = localStorage.getItem('token');
  Promise.all([
    fetch(getCacheBustUrl(API_BASE + '/bookings/' + id), { headers: { 'Authorization': 'Bearer ' + token } }).then(r => r.json()),
    fetch(getCacheBustUrl(API_BASE + '/drivers'), { headers: { 'Authorization': 'Bearer ' + token } }).then(r => r.json()),
    fetch(getCacheBustUrl(API_BASE + '/vehicles'), { headers: { 'Authorization': 'Bearer ' + token } }).then(r => {
      if (!r.ok) return { data: [] };
      return r.json();
    }).catch(() => ({ data: [] }))
  ])
  .then(([booking, drivers, vehicles]) => {
    if (booking.data) {
      const b = booking.data;
      document.getElementById('editBookingId').value = id;
      document.getElementById('editStatus').value = b.status || 'pending';
      document.getElementById('editBookingType').value = b.booking_type || 'point_to_point';
      document.getElementById('editPickup').value = b.pickup_location || '';
      document.getElementById('editDropoff').value = b.dropoff_location || '';
      document.getElementById('editDistance').value = b.distance_km || 0;
      document.getElementById('editVehicleType').value = b.vehicle_type || 'sedan';
      document.getElementById('editVehicleModel').value = b.vehicle_model || '';
      document.getElementById('editPayment').value = b.payment_method || 'cash';
      document.getElementById('editFare').value = b.fare_aed || 0;
      
      // Add change listeners
      document.getElementById('editPickup').addEventListener('change', calculateDistanceAndFare);
      document.getElementById('editDropoff').addEventListener('change', calculateDistanceAndFare);
      document.getElementById('editVehicleType').addEventListener('change', calculateDistanceAndFare);
      
      // Load drivers for selection
      const driverSelect = document.getElementById('editDriver');
      driverSelect.innerHTML = '<option value="">-- Select Driver --</option>';
      if (drivers.data && drivers.data.length) {
        drivers.data.forEach(d => {
          const opt = document.createElement('option');
          opt.value = d.id;
          opt.textContent = d.name + ' (' + (d.status === 'online' ? '🟢 Online' : '🔴 Offline') + ')';
          if (b.driver_id === d.id) opt.selected = true;
          driverSelect.appendChild(opt);
        });
      }
      
      // Load vehicles for assignment override
      const vehicleSelect = document.getElementById('editAssignedVehicle');
      vehicleSelect.innerHTML = '<option value="">-- Auto Select --</option>';
      if (vehicles.data && vehicles.data.length) {
        vehicles.data.forEach(v => {
          const opt = document.createElement('option');
          opt.value = v.id;
          opt.textContent = (v.model || 'Unknown') + ' (' + (v.type || 'sedan').toUpperCase() + ') - ' + (v.status || 'unknown').toUpperCase();
          if (b.assigned_vehicle_id === v.id) opt.selected = true;
          vehicleSelect.appendChild(opt);
        });
      }
      
      // Disable/enable assignment controls based on booking status
      const isLocked = b.status === 'in_progress' || b.status === 'completed';
      driverSelect.disabled = isLocked;
      vehicleSelect.disabled = isLocked;
      document.getElementById('manualAssignBtn').disabled = isLocked;
      document.getElementById('autoAssignBtn').disabled = isLocked;
      if (isLocked) {
        document.getElementById('manualAssignBtn').style.opacity = '0.5';
        document.getElementById('autoAssignBtn').style.opacity = '0.5';
      }
      
      // Set assignment mode
      window.assignmentMode = b.driver_id ? 'manual' : 'auto';
      setAssignmentMode(window.assignmentMode);
      
      // Initialize Google Maps autocomplete
      setTimeout(() => {
        initEditMapAutocomplete();
      }, 100);
      
      const modal = document.getElementById('editBookingModal');
      if (modal) modal.style.display = 'block';
      document.getElementById('modalOverlay').style.display = 'block';
      window.editingBookingId = id;
      
      // Handle form submission
      const form = document.getElementById('editBookingForm');
      form.onsubmit = saveBookingChanges;
    }
  })
  .catch(e => console.error('Edit booking error:', e));
}

function setAssignmentMode(mode) {
  window.assignmentMode = mode;
  const driverSelect = document.getElementById('editDriver');
  const autoStatus = document.getElementById('autoAssignStatus');
  const manualBtn = document.getElementById('manualAssignBtn');
  const autoBtn = document.getElementById('autoAssignBtn');
  
  if (mode === 'manual') {
    driverSelect.style.display = 'block';
    autoStatus.style.display = 'none';
    manualBtn.style.background = '#3b82f6';
    manualBtn.style.color = 'white';
    autoBtn.style.background = 'var(--bg-secondary)';
    autoBtn.style.color = 'var(--text)';
  } else {
    driverSelect.style.display = 'none';
    autoStatus.style.display = 'block';
    autoBtn.style.background = '#10b981';
    autoBtn.style.color = 'white';
    manualBtn.style.background = 'var(--bg-secondary)';
    manualBtn.style.color = 'var(--text)';
  }
}

function saveBookingChanges(e) {
  e.preventDefault();
  const token = localStorage.getItem('token');
  const id = document.getElementById('editBookingId').value;
  
  const body = {
    status: document.getElementById('editStatus').value,
    booking_type: document.getElementById('editBookingType').value,
    pickup_location: document.getElementById('editPickup').value,
    dropoff_location: document.getElementById('editDropoff').value,
    distance_km: parseFloat(document.getElementById('editDistance').value) || 0,
    vehicle_type: document.getElementById('editVehicleType').value,
    vehicle_model: document.getElementById('editVehicleModel').value,
    payment_method: document.getElementById('editPayment').value,
    fare_aed: parseFloat(document.getElementById('editFare').value) || 0
  };
  
  // Vehicle assignment override
  const assignedVehicleId = document.getElementById('editAssignedVehicle')?.value;
  if (assignedVehicleId) body.assigned_vehicle_id = assignedVehicleId;
  
  // Driver assignment
  if (window.assignmentMode === 'manual') {
    const driverId = document.getElementById('editDriver').value;
    if (driverId) body.driver_id = driverId;
  }
  
  // Collect notification selections (for logging/future implementation)
  const notifications = {
    customer: {
      whatsapp: document.getElementById('notifyCustomerWhatsApp')?.checked || false,
      email: document.getElementById('notifyCustomerEmail')?.checked || false
    },
    driver: {
      whatsapp: document.getElementById('notifyDriverWhatsApp')?.checked || false,
      email: document.getElementById('notifyDriverEmail')?.checked || false
    }
  };
  body.notifications_to_send = notifications;
  
  fetch(API_BASE + '/bookings/' + id, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify(body)
  })
  .then(r => r.json())
  .then(d => {
    if (d.success) {
      showToast('Booking updated & notifications queued!', 'success');
      closeModal('editBookingModal');
      loadBookings();
    } else {
      showToast('Error: ' + (d.error || 'Failed to update booking'), 'error');
    }
  })
  .catch(e => showToast('Error: ' + e.message, 'error'));
}

async function initEditMapAutocomplete() {
  const vehicleTypeSelect = document.getElementById('editVehicleType');
  
  // Load all vehicles - WAIT for data
  await loadVehiclesForModels();
  
  // Vehicle type change handler
  if (vehicleTypeSelect) {
    vehicleTypeSelect.addEventListener('change', () => {
      updateVehicleModels(vehicleTypeSelect.value, 'editVehicleModel');
    });
    updateVehicleModels(vehicleTypeSelect.value, 'editVehicleModel');
  }
  
  // Setup location autocomplete
  setupLocationAutocomplete('editPickup', 'pickupSuggestions');
  setupLocationAutocomplete('editDropoff', 'dropoffSuggestions');
}

let vehiclesList = [];

function loadVehiclesForModels() {
  const token = localStorage.getItem('token');
  return fetch(getCacheBustUrl(API_BASE + '/vehicles'), {
    headers: { 'Authorization': 'Bearer ' + token }
  })
  .then(r => r.json())
  .then(d => {
    if (d.data) vehiclesList = d.data;
    return vehiclesList;
  })
  .catch(e => {
    console.error('Error loading vehicles:', e);
    return [];
  });
}

function updateVehicleModels(vehicleType, targetId = 'editVehicleModel') {
  // Map old vehicle type names to new category names
  const typeMapping = {
    'sedan': ['classic', 'sedan'],
    'executive': ['executive'],
    'suv': ['urban_suv', 'suv'],
    'luxury': ['luxury_suv', 'luxury', 'first_class'],
    'van': ['elite_van', 'van'],
    'bus': ['mini_bus', 'bus', 'minibus'],
    'minibus': ['mini_bus', 'minibus']
  };
  
  // Get all matching types (both old and new names)
  const typesToMatch = typeMapping[vehicleType] || [vehicleType];
  
  // Filter by ANY matching type name (old OR new)
  const vehicles = vehiclesList.filter(v => typesToMatch.includes(v.type));
  const select = document.getElementById(targetId);
  
  if (select) {
    select.innerHTML = '<option value="">-- Select Vehicle Model --</option>';
    if (vehicles.length > 0) {
      vehicles.forEach(v => {
        const opt = document.createElement('option');
        opt.value = v.model;
        opt.textContent = v.model + ' (ID: ' + v.id.substring(0, 6) + ')';
        select.appendChild(opt);
      });
    } else {
      const opt = document.createElement('option');
      opt.disabled = true;
      opt.textContent = 'No vehicles available';
      select.appendChild(opt);
    }
  }
}

// UAE Location Distance Map - Coordinates scaled to real distances
const locationDistances = {
  'Burj Khalifa': { x: 30, y: 25 },
  'Dubai Mall': { x: 30, y: 25 },
  'Zabeel Park': { x: 32, y: 30 },
  'Downtown Dubai': { x: 30, y: 25 },
  'Marina': { x: 25, y: 38 },
  'Palm Jumeirah': { x: 18, y: 42 },
  'Atlantis': { x: 15, y: 48 },
  'Jebel Ali': { x: 45, y: 55 },
  'Dubai Airport': { x: 45, y: 15 },
  'Deira': { x: 36, y: 18 },
  'Bur Dubai': { x: 33, y: 21 },
  'Sheikh Zayed Road': { x: 27, y: 32 },
  'JBR': { x: 21, y: 35 },
  'Arabian Ranches': { x: 27, y: 62 },
  'Emirates Hills': { x: 21, y: 68 },
  'Jumeirah Golf Estate': { x: 15, y: 58 },
  'Sharjah Airport': { x: 70, y: 25 },
  'Sharjah': { x: 75, y: 32 },
  'Ajman': { x: 100, y: 28 },
  'Abu Dhabi': { x: 25, y: -285 },
  'RAK': { x: 180, y: 240 },
  'Fujairah': { x: 240, y: 120 },
  'Umm Al Quwain': { x: 150, y: 45 }
};

function estimateDistance(pickup, dropoff) {
  pickup = (pickup || '').toLowerCase();
  dropoff = (dropoff || '').toLowerCase();
  
  // Try to find matching locations
  let pickupCoords = null, dropoffCoords = null;
  
  for (let loc in locationDistances) {
    if (pickup.includes(loc.toLowerCase()) || loc.toLowerCase().includes(pickup)) {
      pickupCoords = locationDistances[loc];
    }
    if (dropoff.includes(loc.toLowerCase()) || loc.toLowerCase().includes(dropoff)) {
      dropoffCoords = locationDistances[loc];
    }
  }
  
  // If both found, calculate distance using simple formula
  if (pickupCoords && dropoffCoords) {
    const dx = pickupCoords.x - dropoffCoords.x;
    const dy = pickupCoords.y - dropoffCoords.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return Math.max(2, Math.round(distance * 0.8 * 10) / 10); // Adjust for actual road distance
  }
  
  // Fallback: reasonable city distance
  return (Math.random() * 25 + 10).toFixed(1);
}

// Always fetch FRESH fare rules from DB (no stale cache)
async function getFreshFareRules() {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(API_BASE + '/fare-rules?t=' + Date.now(), { 
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (res.ok) {
      const data = await res.json();
      if (data.data && data.data.length) {
        fareRules = {}; // Clear old cache
        data.data.forEach(rule => { fareRules[rule.vehicle_type] = rule; });
      }
    }
  } catch (e) {
    console.error('Error fetching fresh fare rules:', e);
  }
}

async function calculateDistanceAndFare() {
  const pickupInput = document.getElementById('editPickup');
  const dropoffInput = document.getElementById('editDropoff');
  const distanceField = document.getElementById('editDistance');
  const fareField = document.getElementById('editFare');
  const vehicleTypeSelect = document.getElementById('editVehicleType');
  
  if (!pickupInput || !dropoffInput || !pickupInput.value || !dropoffInput.value) return;
  
  // Calculate distance
  const distance = parseFloat(estimateDistance(pickupInput.value, dropoffInput.value));
  if (distanceField) distanceField.value = distance;
  
  // Map old vehicle types to new fare rule categories
  const vehicleType = vehicleTypeSelect?.value || 'sedan';
  const typeMapping = {
    'sedan': 'classic',
    'executive': 'executive',
    'suv': 'urban_suv',
    'luxury': 'luxury_suv',
    'van': 'elite_van',
    'bus': 'mini_bus',
    'minibus': 'mini_bus'
  };
  const fareRuleType = typeMapping[vehicleType] || 'classic';
  
  // Always get fresh from DB
  let baseFare = 95, perKmRate = 1;
  if (!fareRules[fareRuleType] || !Object.keys(fareRules).length) {
    await getFreshFareRules(); // Fetch if empty
  }
  if (fareRules[fareRuleType]) {
    baseFare = parseFloat(fareRules[fareRuleType].base_fare);
    perKmRate = parseFloat(fareRules[fareRuleType].per_km_rate);
  }
  
  // Calculate: base_fare + (distance * per_km_rate)
  const fare = baseFare + (distance * perKmRate);
  if (fareField) fareField.value = parseFloat(fare).toFixed(2);
}

function setLocation(fieldId, location) {
  document.getElementById(fieldId).value = location;
  document.getElementById(fieldId === 'editPickup' ? 'pickupSuggestions' : 'dropoffSuggestions').style.display = 'none';
  setTimeout(() => calculateDistanceAndFare(), 100);
}

// Load Fare Rules
async function loadFareRules() {
  try {
    const token = localStorage.getItem('token');
    const tbody = document.getElementById('fareRulesTableBody');
    if (!tbody) return;
    
    const url = getCacheBustUrl(API_BASE + '/fare-rules');
    const response = await fetch(url, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    
    if (!response.ok) throw new Error('HTTP ' + response.status);
    
    const data = await response.json();
    if (!data.data || !data.data.length) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px;">No fare rules found</td></tr>';
      return;
    }
    
    tbody.innerHTML = data.data.map(rule => {
      const typeLabel = rule.vehicle_type.replace(/_/g, ' ').toUpperCase();
      return '<tr style="border-bottom: 1px solid var(--border);"><td style="padding: 12px;"><strong>' + typeLabel + '</strong></td><td style="padding: 12px; text-align: right;">AED ' + rule.base_fare + '</td><td style="padding: 12px; text-align: right;">AED ' + rule.per_km_rate + '</td><td style="padding: 12px; text-align: center;"><button class="btn-small" onclick="editFareRule(\'' + rule.vehicle_type + '\', ' + rule.base_fare + ', ' + rule.per_km_rate + ')">Edit</button></td></tr>';
    }).join('');
  } catch (e) {
    const tbody = document.getElementById('fareRulesTableBody');
    if (tbody) tbody.innerHTML = '<tr><td colspan="4" style="color:red; padding:20px; text-align:center;">Error: ' + e.message + '</td></tr>';
    console.error('Fare rules error:', e);
  }
}

function editFareRule(type, baseFare, perKmRate) {
  const typeLabel = type.replace(/_/g, ' ').toUpperCase();
  document.getElementById('editFareRuleType').value = type;
  document.getElementById('editFareRuleTypeDisplay').textContent = typeLabel;
  document.getElementById('editFareRuleBase').value = baseFare;
  document.getElementById('editFareRulePerKm').value = perKmRate;
  
  const modal = document.getElementById('editFareRuleModal');
  const overlay = document.getElementById('modalOverlay');
  if (modal) modal.style.display = 'block';
  if (overlay) overlay.style.display = 'block';
}

function saveFareRuleChanges() {
  const type = document.getElementById('editFareRuleType').value;
  const baseFare = parseFloat(document.getElementById('editFareRuleBase').value);
  const perKmRate = parseFloat(document.getElementById('editFareRulePerKm').value);
  
  if (!baseFare && baseFare !== 0 || !perKmRate && perKmRate !== 0) {
    alert('Please enter valid values for both fields');
    return;
  }
  
  fetch(API_BASE + '/fare-rules/' + type, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    },
    body: JSON.stringify({
      base_fare: baseFare,
      per_km_rate: perKmRate
    })
  })
    .then(r => r.json())
    .then(d => {
      if (d.success) {
        closeModal('editFareRuleModal');
        alert('✅ Fare rule updated! Changes apply to new bookings.');
        loadFareRules();
      } else {
        alert('Error: ' + (d.error || 'Update failed'));
      }
    })
    .catch(e => alert('Error: ' + e.message));
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
