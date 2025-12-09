const { query } = require('../config/db');

// Popular UAE locations
const UAE_LOCATIONS = [
  'Dubai International Airport', 'Dubai Airport Terminal 1', 'Dubai Airport Terminal 2', 'Dubai Airport Terminal 3',
  'Burj Khalifa', 'Dubai Marina', 'Downtown Dubai', 'Dubai Mall', 'Mall of Emirates', 'The Dubai Mall',
  'Jumeirah Beach Hotel', 'Palm Jumeirah', 'Dubai Creek Harbour', 'JBR Beach', 'Deira', 'Bur Dubai',
  'Dubai Festival City', 'Dubai Hills Estate', 'Emirates Hills', 'Al Barsha', 'Jumeirah', 'Dubai Silicon Oasis',
  'Business Bay', 'DIFC', 'Dubai International Financial Centre', 'Dubai South', 'Jebel Ali', 'World Trade Centre',
  'Zabeel Park', 'Al Safa', 'Manara', 'Satwa', 'Al Karama', 'Baniyas', 'Al Manara', 'Oud Metha', 'Karama',
  'Naif', 'Al Khaleej', 'Al Reef', 'Mirdif', 'Muhaisnah', 'Warsan', 'Nad Al Sheba', 'Hatta', 'Meadows',
  'Springs', 'Arabian Ranches', 'Emirates Living', 'Jumeirah Islands', 'Jumeirah Heights', 'The Hills',
  'Madinat Jumeirah', 'Mall of the Emirates', 'Ibn Battuta Mall', 'Deira City Centre', 'The Galleria',
  'Abu Dhabi International Airport', 'Etihad Tower', 'Sheikh Zayed Grand Mosque', 'Emirates Palace',
  'Yas Island', 'Yas Mall', 'Ferrari World', 'Saadiyat Island', 'Louvre Abu Dhabi', 'Al Bateen',
  'Marina Mall Abu Dhabi', 'Abu Dhabi Downtown', 'Al Mina', 'Khalifa City', 'Al Reem Island', 'Al Ain', 'Masdar City',
  'Sharjah International Airport', 'Sharjah Corniche', 'Al Majaz Waterfront', 'Sharjah Museum', 'Mega Mall Sharjah',
  'City Center Sharjah', 'Al Qasba', 'Sharjah Hills', 'Al Nahda', 'Ajman Corniche', 'Ajman Museum', 'Ajman City Centre',
  'Umm Al Quwain', 'Umm Al Quwain Corniche', 'Ras Al Khaimah', 'RAK Airport', 'Ras Al Khaimah Corniche', 'RAK Mall',
  'Fujairah', 'Fujairah Corniche', 'Al Aqah Beach', 'Fujairah Airport'
];

// Vehicle data with images
const VEHICLES = [
  {
    id: 'classic',
    name: 'Classic',
    badge: 'MOST POPULAR',
    passengers: 3,
    suitcases: 2,
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=300&h=150&fit=crop',
    baseFare: 99,
    perKm: 3.5,
    discount: 30,
    features: ['Private Transfer', 'Meet & Greet', 'Free Cancellation']
  },
  {
    id: 'executive',
    name: 'Executive',
    badge: 'BEST VALUE',
    passengers: 3,
    suitcases: 2,
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=300&h=150&fit=crop',
    baseFare: 129,
    perKm: 4.2,
    discount: 50,
    features: ['Private Transfer', 'Meet & Greet', 'Free Cancellation', 'Premium Service']
  },
  {
    id: 'urban_suv',
    name: 'Urban SUV',
    badge: 'NEW',
    passengers: 5,
    suitcases: 4,
    image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=300&h=150&fit=crop',
    baseFare: 149,
    perKm: 4.8,
    discount: 50,
    features: ['Private Transfer', 'Meet & Greet', 'Free Cancellation', 'Extra Luggage Space']
  },
  {
    id: 'elite_van',
    name: 'Elite Van',
    badge: '',
    passengers: 7,
    suitcases: 7,
    image: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=300&h=150&fit=crop',
    baseFare: 199,
    perKm: 5.5,
    discount: 30,
    features: ['Private Transfer', 'Meet & Greet', 'Free Cancellation', 'Group Travel']
  },
  {
    id: 'luxury_suv',
    name: 'Luxury SUV',
    badge: '',
    passengers: 5,
    suitcases: 4,
    image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=300&h=150&fit=crop',
    baseFare: 249,
    perKm: 6.5,
    discount: 30,
    features: ['Private Transfer', 'Meet & Greet', 'Free Cancellation', 'Premium Luxury']
  },
  {
    id: 'first_class',
    name: 'First Class',
    badge: 'LUXURY',
    passengers: 3,
    suitcases: 2,
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=300&h=150&fit=crop',
    baseFare: 399,
    perKm: 8.5,
    discount: 30,
    features: ['Private Transfer', 'Meet & Greet', 'Free Cancellation', 'VIP Experience', 'Refreshments']
  }
];

const formController = {
  /**
   * Screen 1: Initial Booking Form
   */
  async getBookingForm(req, res, next) {
    try {
      const protocol = req.get('x-forwarded-proto') || req.protocol || 'https';
      const host = req.get('host') || 'localhost:5000';
      const apiBase = `${protocol}://${host}`;
      const locationsJSON = JSON.stringify(UAE_LOCATIONS);

      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Luxury Limo Booking</title>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Montserrat', sans-serif;
      min-height: 100vh;
      background: url('https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1920') center/cover no-repeat fixed;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }
    .glass-container {
      background: rgba(30, 40, 50, 0.75);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 20px;
      padding: 40px 50px;
      max-width: 700px;
      width: 100%;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
    }
    .tabs { display: flex; justify-content: center; gap: 50px; margin-bottom: 40px; }
    .tab {
      color: rgba(255, 255, 255, 0.6);
      font-size: 16px;
      font-weight: 600;
      letter-spacing: 2px;
      text-transform: uppercase;
      cursor: pointer;
      padding-bottom: 8px;
      border-bottom: 2px solid transparent;
      transition: all 0.3s ease;
    }
    .tab:hover { color: rgba(255, 255, 255, 0.9); }
    .tab.active { color: #fff; border-bottom: 2px solid #fff; }
    .form-group { margin-bottom: 25px; position: relative; }
    .form-group label {
      display: block;
      color: rgba(255, 255, 255, 0.7);
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin-bottom: 10px;
    }
    .form-group input {
      width: 100%;
      background: transparent;
      border: none;
      border-bottom: 1px solid rgba(255, 255, 255, 0.3);
      color: #fff;
      font-size: 15px;
      font-family: 'Montserrat', sans-serif;
      padding: 10px 0;
      outline: none;
      transition: all 0.3s ease;
    }
    .form-group input::placeholder { color: rgba(255, 255, 255, 0.5); }
    .form-group input:focus { border-bottom-color: rgba(255, 255, 255, 0.8); }
    .autocomplete-suggestions {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: rgba(20, 30, 40, 0.95);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      max-height: 200px;
      overflow-y: auto;
      display: none;
      z-index: 1000;
      margin-top: 5px;
    }
    .autocomplete-suggestions.active { display: block; }
    .autocomplete-suggestions div {
      padding: 12px 15px;
      color: rgba(255, 255, 255, 0.8);
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    .autocomplete-suggestions div:last-child { border-bottom: none; }
    .autocomplete-suggestions div:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
      padding-left: 20px;
    }
    .datetime-field { display: flex; gap: 15px; }
    .datetime-field input { flex: 1; }
    .buttons-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 35px;
      padding-top: 20px;
    }
    .btn-link {
      color: rgba(255, 255, 255, 0.8);
      font-size: 13px;
      font-weight: 500;
      letter-spacing: 1px;
      text-transform: uppercase;
      background: none;
      border: none;
      cursor: pointer;
      transition: all 0.3s ease;
      font-family: 'Montserrat', sans-serif;
    }
    .btn-link:hover { color: #fff; }
    .btn-primary {
      color: #fff;
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      background: none;
      border: none;
      border-bottom: 2px solid #fff;
      padding-bottom: 5px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-family: 'Montserrat', sans-serif;
    }
    .btn-primary:hover { opacity: 0.8; }
    .footer-text {
      text-align: center;
      margin-top: 30px;
      color: rgba(255, 255, 255, 0.9);
      font-size: 14px;
      letter-spacing: 2px;
      text-transform: uppercase;
    }
    .footer-text span { font-weight: 700; font-size: 18px; }
    .return-section { display: none; margin-top: 25px; padding-top: 25px; border-top: 1px solid rgba(255, 255, 255, 0.1); }
    .return-section.active { display: block; }
    .hourly-section { display: none; }
    .hourly-section.active { display: block; }
    .transfer-section { display: block; }
    .transfer-section.hidden { display: none; }
    .hours-selector { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 15px; }
    .hour-option {
      padding: 10px 20px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      color: rgba(255, 255, 255, 0.8);
      font-size: 14px;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .hour-option:hover { background: rgba(255, 255, 255, 0.2); color: #fff; }
    .hour-option.selected { background: rgba(255, 255, 255, 0.25); border-color: #fff; color: #fff; }
    @media (max-width: 600px) {
      .glass-container { padding: 30px 25px; }
      .tabs { gap: 30px; }
      .tab { font-size: 14px; }
      .buttons-row { flex-direction: column; gap: 20px; }
      .datetime-field { flex-direction: column; gap: 20px; }
    }
  </style>
</head>
<body>
  <div class="glass-container">
    <div class="tabs">
      <div class="tab active" id="tab-transfer" onclick="switchTab('transfer')">Private Transfer</div>
      <div class="tab" id="tab-hourly" onclick="switchTab('hourly')">Hourly</div>
    </div>
    <form id="bookingForm">
      <div class="transfer-section" id="transfer-section">
        <div class="form-group">
          <label>From</label>
          <input type="text" id="pickup" name="pickup" placeholder="Enter a pickup location" autocomplete="off" required>
          <div id="pickup-suggestions" class="autocomplete-suggestions"></div>
        </div>
        <div class="form-group">
          <label>To</label>
          <input type="text" id="dropoff" name="dropoff" placeholder="Enter a dropoff location" autocomplete="off" required>
          <div id="dropoff-suggestions" class="autocomplete-suggestions"></div>
        </div>
      </div>
      <div class="hourly-section" id="hourly-section">
        <div class="form-group">
          <label>Pickup Location</label>
          <input type="text" id="hourly-pickup" name="hourly-pickup" placeholder="Enter pickup location" autocomplete="off">
          <div id="hourly-pickup-suggestions" class="autocomplete-suggestions"></div>
        </div>
        <div class="form-group">
          <label>Select Hours</label>
          <div class="hours-selector">
            <div class="hour-option" data-hours="3" onclick="selectHours(3)">3 Hours</div>
            <div class="hour-option" data-hours="4" onclick="selectHours(4)">4 Hours</div>
            <div class="hour-option" data-hours="5" onclick="selectHours(5)">5 Hours</div>
            <div class="hour-option" data-hours="6" onclick="selectHours(6)">6 Hours</div>
            <div class="hour-option" data-hours="8" onclick="selectHours(8)">8 Hours</div>
            <div class="hour-option" data-hours="10" onclick="selectHours(10)">10 Hours</div>
            <div class="hour-option" data-hours="12" onclick="selectHours(12)">12 Hours</div>
            <div class="hour-option" data-hours="14" onclick="selectHours(14)">14 Hours</div>
          </div>
          <input type="hidden" id="selected-hours" name="hours" value="">
        </div>
      </div>
      <div class="form-group">
        <label>Pickup Date & Time</label>
        <div class="datetime-field">
          <input type="date" id="pickup-date" name="pickup-date" required>
          <input type="time" id="pickup-time" name="pickup-time" required>
        </div>
      </div>
      <div class="return-section" id="return-section">
        <div class="form-group">
          <label>Return Date & Time</label>
          <div class="datetime-field">
            <input type="date" id="return-date" name="return-date">
            <input type="time" id="return-time" name="return-time">
          </div>
        </div>
      </div>
      <div class="buttons-row">
        <button type="button" class="btn-link" id="add-return-btn" onclick="toggleReturn()">+ Add Return</button>
        <button type="button" class="btn-primary" onclick="checkFare()">Check Fare</button>
      </div>
    </form>
  </div>
  <div class="footer-text">Hire a limousine in Dubai from just <span>AED 99</span></div>

  <script>
    const API_BASE = '${apiBase}';
    const ALL_LOCATIONS = ${locationsJSON};
    let currentTab = 'transfer';
    let isReturnAdded = false;
    let selectedHours = 0;

    const now = new Date();
    document.getElementById('pickup-date').value = now.toISOString().split('T')[0];
    document.getElementById('pickup-time').value = now.toTimeString().slice(0,5);

    function switchTab(tab) {
      currentTab = tab;
      document.getElementById('tab-transfer').classList.toggle('active', tab === 'transfer');
      document.getElementById('tab-hourly').classList.toggle('active', tab === 'hourly');
      document.getElementById('transfer-section').classList.toggle('hidden', tab !== 'transfer');
      document.getElementById('hourly-section').classList.toggle('active', tab === 'hourly');
      if (tab === 'hourly') {
        document.getElementById('return-section').classList.remove('active');
        document.getElementById('add-return-btn').style.display = 'none';
      } else {
        document.getElementById('add-return-btn').style.display = 'block';
      }
    }

    function toggleReturn() {
      isReturnAdded = !isReturnAdded;
      document.getElementById('return-section').classList.toggle('active', isReturnAdded);
      document.getElementById('add-return-btn').textContent = isReturnAdded ? '- Remove Return' : '+ Add Return';
    }

    function selectHours(hours) {
      selectedHours = hours;
      document.getElementById('selected-hours').value = hours;
      document.querySelectorAll('.hour-option').forEach(el => {
        el.classList.toggle('selected', parseInt(el.dataset.hours) === hours);
      });
    }

    function setupAutocomplete(inputId, suggestionsId) {
      const input = document.getElementById(inputId);
      const suggestionsBox = document.getElementById(suggestionsId);
      if (!input || !suggestionsBox) return;
      input.addEventListener('input', function() {
        const value = this.value.toLowerCase().trim();
        if (value.length < 1) {
          suggestionsBox.innerHTML = '';
          suggestionsBox.classList.remove('active');
          return;
        }
        const matches = ALL_LOCATIONS.filter(loc => loc.toLowerCase().includes(value));
        if (matches.length === 0) {
          suggestionsBox.innerHTML = '';
          suggestionsBox.classList.remove('active');
          return;
        }
        const suggestions = matches.slice(0, 8);
        suggestionsBox.innerHTML = suggestions.map(loc => \`<div onclick="selectLocation('\${inputId}', '\${loc}')">\${loc}</div>\`).join('');
        suggestionsBox.classList.add('active');
      });
      input.addEventListener('blur', () => setTimeout(() => suggestionsBox.classList.remove('active'), 200));
    }

    function selectLocation(inputId, location) {
      document.getElementById(inputId).value = location;
      document.getElementById(inputId + '-suggestions').classList.remove('active');
    }

    setupAutocomplete('pickup', 'pickup-suggestions');
    setupAutocomplete('dropoff', 'dropoff-suggestions');
    setupAutocomplete('hourly-pickup', 'hourly-pickup-suggestions');

    function checkFare() {
      const pickupDate = document.getElementById('pickup-date').value;
      const pickupTime = document.getElementById('pickup-time').value;

      if (currentTab === 'transfer') {
        const pickup = document.getElementById('pickup').value;
        const dropoff = document.getElementById('dropoff').value;
        if (!pickup || !dropoff) { alert('Please enter pickup and dropoff locations'); return; }

        const params = new URLSearchParams({
          type: isReturnAdded ? 'round_trip' : 'point_to_point',
          pickup: pickup,
          dropoff: dropoff,
          date: pickupDate,
          time: pickupTime,
          returnDate: isReturnAdded ? document.getElementById('return-date').value : '',
          returnTime: isReturnAdded ? document.getElementById('return-time').value : ''
        });
        window.location.href = API_BASE + '/api/bookings/vehicle-details?' + params.toString();
      } else {
        const pickup = document.getElementById('hourly-pickup').value;
        if (!pickup) { alert('Please enter pickup location'); return; }
        if (!selectedHours) { alert('Please select rental hours'); return; }

        const params = new URLSearchParams({
          type: 'hourly',
          pickup: pickup,
          hours: selectedHours,
          date: pickupDate,
          time: pickupTime
        });
        window.location.href = API_BASE + '/api/bookings/vehicle-details?' + params.toString();
      }
    }
  </script>
</body>
</html>`;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.send(html);
    } catch (error) {
      console.error('Form generation error:', error);
      res.status(500).json({ success: false, error: 'Failed to generate form', message: error.message });
    }
  },

  /**
   * Screen 2: Vehicle Details Page
   */
  async getVehicleDetails(req, res, next) {
    try {
      const { type, pickup, dropoff, date, time, returnDate, returnTime, hours } = req.query;
      const protocol = req.get('x-forwarded-proto') || req.protocol || 'https';
      const host = req.get('host') || 'localhost:5000';
      const apiBase = `${protocol}://${host}`;

      // Calculate estimated distance (mock - in production use real API)
      const estimatedDistance = 14.4; // km
      const vehiclesJSON = JSON.stringify(VEHICLES);

      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Select Vehicle - Luxury Limo</title>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Montserrat', sans-serif;
      background: #f5f5f5;
      min-height: 100vh;
      color: #333;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    
    /* Header */
    .page-header {
      text-align: center;
      margin-bottom: 30px;
    }
    .page-title {
      font-size: 24px;
      font-weight: 600;
      color: #333;
      margin-bottom: 20px;
    }
    
    /* Progress Steps */
    .progress-steps {
      display: flex;
      justify-content: center;
      gap: 40px;
      margin-bottom: 30px;
    }
    .step {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #999;
      font-size: 13px;
    }
    .step.active { color: #333; }
    .step-icon {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: #e0e0e0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
    }
    .step.active .step-icon { background: #1a1a1a; color: #fff; }
    .step-line { width: 60px; height: 2px; background: #e0e0e0; }

    /* Main Layout */
    .main-layout {
      display: grid;
      grid-template-columns: 1fr 350px;
      gap: 30px;
    }

    /* Vehicle Cards */
    .vehicles-section { }
    .vehicle-card {
      background: #fff;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 15px;
      display: grid;
      grid-template-columns: 180px 1fr auto;
      gap: 20px;
      align-items: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      transition: all 0.3s ease;
    }
    .vehicle-card:hover {
      box-shadow: 0 5px 20px rgba(0,0,0,0.1);
      transform: translateY(-2px);
    }
    .vehicle-image {
      width: 180px;
      height: 100px;
      object-fit: cover;
      border-radius: 8px;
      background: #f0f0f0;
    }
    .vehicle-info { }
    .vehicle-name {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .vehicle-badge {
      background: #e8f5e9;
      color: #2e7d32;
      font-size: 10px;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 4px;
      text-transform: uppercase;
    }
    .vehicle-badge.new { background: #e3f2fd; color: #1565c0; }
    .vehicle-badge.luxury { background: #fce4ec; color: #c2185b; }
    .vehicle-specs {
      display: flex;
      gap: 15px;
      margin-bottom: 8px;
      color: #666;
      font-size: 13px;
    }
    .vehicle-specs span { display: flex; align-items: center; gap: 5px; }
    .vehicle-type {
      color: #999;
      font-size: 12px;
    }
    .vehicle-pricing { text-align: right; min-width: 150px; }
    .discount-badge {
      display: inline-block;
      background: #4caf50;
      color: #fff;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 4px;
      margin-bottom: 8px;
    }
    .discount-badge.gold { background: #ff9800; }
    .price-label {
      color: #999;
      font-size: 11px;
      margin-bottom: 3px;
    }
    .price-original {
      color: #999;
      font-size: 14px;
      text-decoration: line-through;
    }
    .price-final {
      font-size: 24px;
      font-weight: 700;
      color: #333;
    }
    .price-final small { font-size: 14px; font-weight: 400; }
    .price-note {
      color: #999;
      font-size: 11px;
      margin-top: 3px;
    }
    .btn-select {
      display: block;
      width: 100%;
      background: #1a1a1a;
      color: #fff;
      border: none;
      padding: 12px 30px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      margin-top: 10px;
      transition: all 0.3s ease;
      font-family: 'Montserrat', sans-serif;
    }
    .btn-select:hover { background: #333; }

    /* Booking Details Sidebar */
    .sidebar {
      background: #fff;
      border-radius: 12px;
      padding: 25px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      height: fit-content;
      position: sticky;
      top: 20px;
    }
    .sidebar-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 25px;
      color: #333;
    }
    .journey-section {
      margin-bottom: 25px;
    }
    .journey-label {
      font-size: 12px;
      font-weight: 600;
      color: #999;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .journey-point {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 15px;
    }
    .journey-icon {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #4caf50;
      margin-top: 5px;
      flex-shrink: 0;
    }
    .journey-icon.end { background: #f44336; }
    .journey-text {
      font-size: 13px;
      color: #333;
      line-height: 1.5;
    }
    .journey-connector {
      width: 2px;
      height: 30px;
      background: #e0e0e0;
      margin-left: 4px;
      margin-bottom: 10px;
    }

    .info-list {
      border-top: 1px solid #eee;
      padding-top: 20px;
      margin-top: 20px;
    }
    .info-item {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 15px;
      font-size: 13px;
      color: #666;
    }
    .info-item i {
      width: 20px;
      color: #4caf50;
    }

    .payment-methods {
      border-top: 1px solid #eee;
      padding-top: 20px;
      margin-top: 20px;
    }
    .payment-title {
      font-size: 12px;
      color: #666;
      margin-bottom: 12px;
    }
    .payment-icons {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .payment-icons img {
      height: 24px;
      opacity: 0.7;
    }

    .help-section {
      border-top: 1px solid #eee;
      padding-top: 20px;
      margin-top: 20px;
    }
    .help-title {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 15px;
      color: #333;
    }
    .help-item {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
      font-size: 13px;
      color: #666;
    }
    .help-item i { color: #4caf50; width: 20px; }

    .trust-badge {
      border-top: 1px solid #eee;
      padding-top: 20px;
      margin-top: 20px;
      text-align: center;
    }
    .trust-title {
      font-size: 12px;
      color: #666;
      margin-bottom: 8px;
    }
    .trust-stars {
      color: #4caf50;
      font-size: 16px;
      margin-bottom: 5px;
    }
    .trust-rating {
      font-size: 12px;
      color: #666;
    }

    /* Responsive */
    @media (max-width: 900px) {
      .main-layout {
        grid-template-columns: 1fr;
      }
      .vehicle-card {
        grid-template-columns: 1fr;
        text-align: center;
      }
      .vehicle-image {
        width: 100%;
        height: 150px;
      }
      .vehicle-pricing {
        text-align: center;
      }
      .vehicle-specs {
        justify-content: center;
      }
      .sidebar {
        position: relative;
        order: -1;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="page-header">
      <h1 class="page-title">${type === 'round_trip' ? 'Book a Return Ride' : type === 'hourly' ? 'Book Hourly Rental' : 'Book a Ride'}</h1>
      
      <!-- Progress Steps -->
      <div class="progress-steps">
        <div class="step active">
          <div class="step-icon"><i class="fas fa-car"></i></div>
          <span>Vehicle Details</span>
        </div>
        <div class="step-line"></div>
        <div class="step">
          <div class="step-icon"><i class="fas fa-user"></i></div>
          <span>Schedule & Guest Info</span>
        </div>
        <div class="step-line"></div>
        <div class="step">
          <div class="step-icon"><i class="fas fa-credit-card"></i></div>
          <span>Billing Details</span>
        </div>
      </div>
    </div>

    <!-- Main Layout -->
    <div class="main-layout">
      <!-- Vehicle Cards -->
      <div class="vehicles-section" id="vehicles-list">
        <!-- Vehicles will be rendered here by JS -->
      </div>

      <!-- Sidebar -->
      <div class="sidebar">
        <h2 class="sidebar-title">Booking Details</h2>
        
        <!-- Outward Journey -->
        <div class="journey-section">
          <div class="journey-label">Outward Journey</div>
          <div class="journey-point">
            <div class="journey-icon"></div>
            <div class="journey-text">${pickup || 'Pickup Location'}</div>
          </div>
          <div class="journey-connector"></div>
          <div class="journey-point">
            <div class="journey-icon end"></div>
            <div class="journey-text">${dropoff || pickup || 'Dropoff Location'}</div>
          </div>
        </div>

        ${type === 'round_trip' ? `
        <!-- Return Journey -->
        <div class="journey-section">
          <div class="journey-label">Return Journey</div>
          <div class="journey-point">
            <div class="journey-icon"></div>
            <div class="journey-text">${dropoff || 'Return From'}</div>
          </div>
          <div class="journey-connector"></div>
          <div class="journey-point">
            <div class="journey-icon end"></div>
            <div class="journey-text">${pickup || 'Return To'}</div>
          </div>
        </div>
        ` : ''}

        ${type === 'hourly' ? `
        <div class="info-item">
          <i class="fas fa-clock"></i>
          <span>${hours} Hours Rental</span>
        </div>
        ` : ''}

        <!-- Info List -->
        <div class="info-list">
          <div class="info-item">
            <i class="fas fa-route"></i>
            <span>${estimatedDistance} km (Each Way)</span>
          </div>
          <div class="info-item">
            <i class="fas fa-stopwatch"></i>
            <span>~30 mins (Approx)</span>
          </div>
          <div class="info-item">
            <i class="fas fa-users"></i>
            <span>6,818 Passengers Transported</span>
          </div>
          <div class="info-item">
            <i class="fas fa-bolt"></i>
            <span>Instant Confirmation</span>
          </div>
          <div class="info-item">
            <i class="fas fa-check-circle"></i>
            <span>All Inclusive Pricing</span>
          </div>
        </div>

        <!-- Payment Methods -->
        <div class="payment-methods">
          <div class="payment-title">Secure Payments by Credit Card, Debit card or Paypal</div>
          <div class="payment-icons">
            <span style="font-weight:600;color:#1a1a80;">VISA</span>
            <span style="font-weight:600;color:#eb001b;">Master</span>
            <span style="font-weight:600;color:#ff5f00;">G Pay</span>
            <span style="font-weight:600;color:#003087;">PayPal</span>
            <span style="font-weight:600;color:#000;">Apple</span>
          </div>
        </div>

        <!-- Help Section -->
        <div class="help-section">
          <div class="help-title">Need Help?</div>
          <div class="help-item">
            <i class="fas fa-comments"></i>
            <div>
              <strong>Start a Chat</strong><br>
              <small style="color:#999;">We are always online</small>
            </div>
          </div>
          <div class="help-item">
            <i class="fas fa-question-circle"></i>
            <div>
              <strong>Help Centre</strong><br>
              <small style="color:#999;">Frequently asked questions</small>
            </div>
          </div>
          <div class="help-item">
            <i class="fas fa-phone"></i>
            <div>
              <strong>Call us</strong><br>
              <small style="color:#999;">24/7</small>
            </div>
          </div>
        </div>

        <!-- Trust Badge -->
        <div class="trust-badge">
          <div class="trust-title">Trustpilot</div>
          <div class="trust-stars">
            <i class="fas fa-star"></i>
            <i class="fas fa-star"></i>
            <i class="fas fa-star"></i>
            <i class="fas fa-star"></i>
            <i class="fas fa-star-half-alt"></i>
          </div>
          <div class="trust-rating">TrustScore 4.5 | 890 reviews</div>
        </div>
      </div>
    </div>
  </div>

  <script>
    const API_BASE = '${apiBase}';
    const VEHICLES = ${vehiclesJSON};
    const BOOKING_TYPE = '${type}';
    const DISTANCE = ${estimatedDistance};
    const HOURS = ${hours || 0};

    // Booking data
    const bookingData = {
      type: '${type}',
      pickup: '${pickup || ''}',
      dropoff: '${dropoff || ''}',
      date: '${date}',
      time: '${time}',
      returnDate: '${returnDate || ''}',
      returnTime: '${returnTime || ''}',
      hours: ${hours || 0}
    };

    function calculatePrice(vehicle) {
      let price;
      if (BOOKING_TYPE === 'hourly') {
        price = vehicle.baseFare * HOURS;
      } else if (BOOKING_TYPE === 'round_trip') {
        price = vehicle.baseFare + (vehicle.perKm * DISTANCE * 2);
      } else {
        price = vehicle.baseFare + (vehicle.perKm * DISTANCE);
      }
      const originalPrice = price / (1 - vehicle.discount/100);
      return { original: Math.round(originalPrice), final: Math.round(price) };
    }

    function renderVehicles() {
      const container = document.getElementById('vehicles-list');
      container.innerHTML = VEHICLES.map(v => {
        const prices = calculatePrice(v);
        const badgeClass = v.badge === 'NEW' ? 'new' : v.badge === 'LUXURY' ? 'luxury' : '';
        return \`
          <div class="vehicle-card">
            <img src="\${v.image}" alt="\${v.name}" class="vehicle-image">
            <div class="vehicle-info">
              <div class="vehicle-name">
                \${v.name}
                \${v.badge ? \`<span class="vehicle-badge \${badgeClass}">\${v.badge}</span>\` : ''}
              </div>
              <div class="vehicle-specs">
                <span><i class="fas fa-user"></i> \${v.passengers} Max</span>
                <span><i class="fas fa-suitcase"></i> \${v.suitcases} Suitcases</span>
                <span><i class="fas fa-users"></i> \${v.passengers + v.suitcases} Passengers</span>
              </div>
              <div class="vehicle-type">Private Transfer  <i class="fas fa-star" style="color:#ffc107;margin-left:5px;"></i> Porter Service</div>
            </div>
            <div class="vehicle-pricing">
              <div class="discount-badge \${v.discount >= 50 ? 'gold' : ''}">\${v.discount}% OFF</div>
              <div class="price-label">Total Return Price</div>
              <div class="price-original">AED \${prices.original}</div>
              <div class="price-final">AED \${prices.final}<small>.00</small></div>
              <div class="price-note">Includes VAT & Fees</div>
              <button class="btn-select" onclick="selectVehicle('\${v.id}', \${prices.final})">Select</button>
            </div>
          </div>
        \`;
      }).join('');
    }

    function selectVehicle(vehicleId, price) {
      const params = new URLSearchParams({
        ...bookingData,
        vehicle: vehicleId,
        price: price
      });
      window.location.href = API_BASE + '/api/bookings/guest-info?' + params.toString();
    }

    renderVehicles();
  </script>
</body>
</html>`;

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.send(html);
    } catch (error) {
      console.error('Vehicle details error:', error);
      res.status(500).json({ success: false, error: 'Failed to load vehicle details', message: error.message });
    }
  },

  /**
   * Screen 3: Schedule & Guest Info Page
   */
  async getGuestInfo(req, res, next) {
    try {
      const { type, pickup, dropoff, date, time, returnDate, returnTime, hours, vehicle, price } = req.query;
      const protocol = req.get('x-forwarded-proto') || req.protocol || 'https';
      const host = req.get('host') || 'localhost:5000';
      const apiBase = `${protocol}://${host}`;

      // Find selected vehicle
      const selectedVehicle = VEHICLES.find(v => v.id === vehicle) || VEHICLES[0];
      const vehiclesJSON = JSON.stringify(VEHICLES);

      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Guest Information - Luxury Limo</title>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Montserrat', sans-serif;
      background: #f5f5f5;
      min-height: 100vh;
      color: #333;
    }
    .container {
      max-width: 1100px;
      margin: 0 auto;
      padding: 20px;
    }
    
    /* Header */
    .page-header {
      text-align: center;
      margin-bottom: 30px;
    }
    .page-title {
      font-size: 24px;
      font-weight: 600;
      color: #333;
      margin-bottom: 20px;
    }
    
    /* Progress Steps */
    .progress-steps {
      display: flex;
      justify-content: center;
      gap: 30px;
      margin-bottom: 30px;
    }
    .step {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #999;
      font-size: 12px;
    }
    .step.completed { color: #4caf50; }
    .step.active { color: #333; }
    .step-icon {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #e0e0e0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
    }
    .step.completed .step-icon { background: #4caf50; color: #fff; }
    .step.active .step-icon { background: #1a1a1a; color: #fff; }
    .step-line { width: 50px; height: 2px; background: #e0e0e0; }
    .step-line.completed { background: #4caf50; }

    /* Main Layout */
    .main-layout {
      display: grid;
      grid-template-columns: 1fr 320px;
      gap: 25px;
    }

    /* Form Section */
    .form-section {
      background: #fff;
      border-radius: 12px;
      padding: 25px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }
    .section-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 20px;
      color: #333;
      padding-bottom: 10px;
      border-bottom: 1px solid #eee;
    }

    /* Form Grid */
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    .form-group {
      margin-bottom: 15px;
    }
    .form-group.full-width {
      grid-column: span 2;
    }
    .form-group label {
      display: block;
      font-size: 12px;
      font-weight: 500;
      color: #666;
      margin-bottom: 8px;
    }
    .form-group input, .form-group select {
      width: 100%;
      padding: 12px 15px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 14px;
      font-family: 'Montserrat', sans-serif;
      transition: all 0.3s ease;
    }
    .form-group input:focus, .form-group select:focus {
      outline: none;
      border-color: #333;
    }
    .form-group input::placeholder {
      color: #aaa;
    }
    .phone-input {
      display: flex;
      gap: 10px;
    }
    .phone-input select {
      width: 100px;
      flex-shrink: 0;
    }
    .form-note {
      font-size: 11px;
      color: #999;
      margin-top: 15px;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .form-note i { color: #4caf50; }

    /* Extras Section */
    .extras-section {
      margin-top: 25px;
    }
    .extra-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 0;
      border-bottom: 1px solid #eee;
    }
    .extra-item:last-child { border-bottom: none; }
    .extra-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .extra-checkbox {
      width: 20px;
      height: 20px;
      border: 2px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    }
    .extra-checkbox.checked {
      background: #4caf50;
      border-color: #4caf50;
      color: #fff;
    }
    .extra-name {
      font-size: 14px;
      font-weight: 500;
    }
    .extra-note {
      font-size: 11px;
      color: #999;
      margin-top: 3px;
    }
    .extra-price {
      font-size: 14px;
      font-weight: 600;
      color: #4caf50;
    }

    /* Child Seat Options */
    .seat-options {
      padding: 15px 0;
      border-bottom: 1px solid #eee;
    }
    .seat-title {
      font-size: 13px;
      font-weight: 500;
      margin-bottom: 10px;
      color: #666;
    }
    .seat-counts {
      display: flex;
      gap: 15px;
    }
    .seat-count {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .count-btn {
      width: 28px;
      height: 28px;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: #fff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      transition: all 0.3s ease;
    }
    .count-btn:hover { background: #f5f5f5; }
    .count-value {
      width: 30px;
      text-align: center;
      font-size: 14px;
      font-weight: 500;
    }

    /* Child Seat Info */
    .info-box {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 15px;
      margin-top: 15px;
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }
    .info-box i {
      color: #4caf50;
      margin-top: 2px;
    }
    .info-box p {
      font-size: 12px;
      color: #666;
      line-height: 1.5;
    }

    /* Sidebar */
    .sidebar {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .sidebar-card {
      background: #fff;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }
    .sidebar-title {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 15px;
      color: #333;
    }
    
    /* Trip Details */
    .trip-section {
      margin-bottom: 20px;
    }
    .trip-label {
      font-size: 11px;
      font-weight: 600;
      color: #999;
      margin-bottom: 10px;
      text-transform: uppercase;
    }
    .trip-point {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      margin-bottom: 10px;
    }
    .trip-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #4caf50;
      margin-top: 5px;
      flex-shrink: 0;
    }
    .trip-dot.end { background: #f44336; }
    .trip-text {
      font-size: 12px;
      color: #333;
      line-height: 1.4;
    }
    .trip-datetime {
      display: flex;
      gap: 15px;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #eee;
    }
    .trip-datetime div {
      font-size: 11px;
    }
    .trip-datetime label {
      color: #999;
      display: block;
      margin-bottom: 3px;
    }
    .trip-datetime span {
      color: #333;
      font-weight: 500;
    }

    /* Vehicle Card */
    .vehicle-summary {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 15px;
    }
    .vehicle-summary-name {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 10px;
    }
    .vehicle-summary-img {
      width: 100%;
      height: 80px;
      object-fit: cover;
      border-radius: 6px;
      margin-bottom: 10px;
    }
    .vehicle-summary-specs {
      display: flex;
      gap: 15px;
      font-size: 11px;
      color: #666;
    }
    .vehicle-summary-specs span {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    /* Extras Summary */
    .extras-summary {
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid #eee;
    }
    .extras-summary-title {
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .extras-summary-item {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      margin-bottom: 5px;
    }

    /* Total Price */
    .total-section {
      margin-top: 15px;
      padding-top: 15px;
      border-top: 2px solid #eee;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .total-label {
      font-size: 13px;
      font-weight: 500;
    }
    .total-price {
      font-size: 20px;
      font-weight: 700;
      color: #333;
    }
    .total-price small {
      font-size: 12px;
      font-weight: 400;
      color: #999;
    }

    /* Buttons */
    .buttons-row {
      display: flex;
      gap: 15px;
      margin-top: 25px;
    }
    .btn-back {
      flex: 1;
      padding: 14px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: #fff;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      font-family: 'Montserrat', sans-serif;
    }
    .btn-back:hover { background: #f5f5f5; }
    .btn-next {
      flex: 2;
      padding: 14px;
      border: none;
      border-radius: 8px;
      background: #1a8b6e;
      color: #fff;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      font-family: 'Montserrat', sans-serif;
    }
    .btn-next:hover { background: #157a5e; }

    /* Responsive */
    @media (max-width: 800px) {
      .main-layout { grid-template-columns: 1fr; }
      .form-grid { grid-template-columns: 1fr; }
      .form-group.full-width { grid-column: span 1; }
      .sidebar { order: -1; }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="page-header">
      <h1 class="page-title">Book a ${type === 'round_trip' ? 'Chauffeur Transfer' : 'One Way Transfer'}</h1>
      
      <!-- Progress Steps -->
      <div class="progress-steps">
        <div class="step completed">
          <div class="step-icon"><i class="fas fa-check"></i></div>
          <span>Vehicle Details</span>
        </div>
        <div class="step-line completed"></div>
        <div class="step active">
          <div class="step-icon">2</div>
          <span>Schedule & Guest Info</span>
        </div>
        <div class="step-line"></div>
        <div class="step">
          <div class="step-icon">3</div>
          <span>Billing Details</span>
        </div>
      </div>
    </div>

    <!-- Main Layout -->
    <div class="main-layout">
      <!-- Form Section -->
      <div class="form-section">
        <h2 class="section-title">Passenger Details</h2>
        
        <div class="form-grid">
          <div class="form-group">
            <label>Full Name *</label>
            <input type="text" id="fullName" placeholder="Full Name" required>
          </div>
          <div class="form-group">
            <label>Email Address *</label>
            <input type="email" id="email" placeholder="Email Address" required>
          </div>
          <div class="form-group">
            <label>Contact Number *</label>
            <div class="phone-input">
              <select id="countryCode">
                <option value="+971">+971</option>
                <option value="+1">+1</option>
                <option value="+44">+44</option>
                <option value="+91">+91</option>
                <option value="+92">+92</option>
                <option value="+966">+966</option>
              </select>
              <input type="tel" id="contactNumber" placeholder="e.g. 50 123 4567">
            </div>
          </div>
          <div class="form-group">
            <label>WhatsApp Number</label>
            <div class="phone-input">
              <select id="whatsappCode">
                <option value="+971">+971</option>
                <option value="+1">+1</option>
                <option value="+44">+44</option>
                <option value="+91">+91</option>
                <option value="+92">+92</option>
                <option value="+966">+966</option>
              </select>
              <input type="tel" id="whatsappNumber" placeholder="e.g. 50 123 4567">
            </div>
          </div>
        </div>
        
        <div class="form-note">
          <i class="fas fa-info-circle"></i>
          We need this email and contact number for urgent communication on the transfer day
        </div>

        <!-- Extras Section -->
        <div class="extras-section">
          <h2 class="section-title">Extra's</h2>
          
          <div class="extra-item">
            <div class="extra-left">
              <div class="extra-checkbox" id="stopCheckbox" onclick="toggleExtra('stop')">
                <i class="fas fa-check" style="display:none;font-size:12px;"></i>
              </div>
              <div>
                <div class="extra-name">Stop on the way</div>
              </div>
            </div>
            <div class="extra-price">AED 38.12</div>
          </div>

          <div class="extra-item">
            <div class="extra-left">
              <div class="extra-checkbox" id="childSeatCheckbox" onclick="toggleExtra('childSeat')">
                <i class="fas fa-check" style="display:none;font-size:12px;"></i>
              </div>
              <div>
                <div class="extra-name">Child Seat</div>
                <div class="extra-note">This is required if children are travelling with you</div>
              </div>
            </div>
            <div class="extra-price">AED 27.22</div>
          </div>

          <!-- Seat Options -->
          <div class="seat-options" id="seatOptions" style="display:none;">
            <div class="seat-title">Seat 0-36 kg</div>
            <div class="seat-counts">
              <div class="seat-count">
                <button class="count-btn" onclick="updateCount('seat36', -1)">-</button>
                <span class="count-value" id="seat36-count">0</span>
                <button class="count-btn" onclick="updateCount('seat36', 1)">+</button>
              </div>
            </div>
          </div>

          <div class="seat-options" id="boosterOptions" style="display:none;">
            <div class="seat-title">Booster 15-36 kg</div>
            <div class="seat-counts">
              <div class="seat-count">
                <button class="count-btn" onclick="updateCount('booster', -1)">-</button>
                <span class="count-value" id="booster-count">0</span>
                <button class="count-btn" onclick="updateCount('booster', 1)">+</button>
              </div>
            </div>
          </div>

          <div class="seat-options" id="infantOptions" style="display:none;">
            <div class="seat-title">Infant seat 0-9 kg</div>
            <div class="seat-counts">
              <div class="seat-count">
                <button class="count-btn" onclick="updateCount('infant', -1)">-</button>
                <span class="count-value" id="infant-count">0</span>
                <button class="count-btn" onclick="updateCount('infant', 1)">+</button>
              </div>
            </div>
          </div>

          <div class="info-box" id="childSeatInfo" style="display:none;">
            <i class="fas fa-info-circle"></i>
            <p>You may bring your own child seat. In this seat, you don't need to add a child seat rent to your booking.</p>
          </div>
        </div>

        <!-- Buttons -->
        <div class="buttons-row">
          <button class="btn-back" onclick="goBack()">BACK</button>
          <button class="btn-next" onclick="goNext()">NEXT</button>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="sidebar">
        <!-- One Way Trip -->
        <div class="sidebar-card">
          <div class="sidebar-title">One Way Trip</div>
          <div class="trip-section">
            <div class="trip-point">
              <div class="trip-dot"></div>
              <div class="trip-text">${pickup || 'Pickup Location'}</div>
            </div>
            <div class="trip-point">
              <div class="trip-dot end"></div>
              <div class="trip-text">${dropoff || 'Dropoff Location'}</div>
            </div>
            <div class="trip-datetime">
              <div>
                <label>Pickup Date</label>
                <span>${date || 'Not set'}</span>
              </div>
              <div>
                <label>Pickup Time</label>
                <span>${time || 'Not set'}</span>
              </div>
            </div>
          </div>
        </div>

        ${type === 'round_trip' ? `
        <!-- Return Trip -->
        <div class="sidebar-card">
          <div class="sidebar-title">Return Ride Trip</div>
          <div class="trip-section">
            <div class="trip-point">
              <div class="trip-dot"></div>
              <div class="trip-text">${dropoff || 'Return From'}</div>
            </div>
            <div class="trip-point">
              <div class="trip-dot end"></div>
              <div class="trip-text">${pickup || 'Return To'}</div>
            </div>
            <div class="trip-datetime">
              <div>
                <label>Pickup Date</label>
                <span>${returnDate || 'Not set'}</span>
              </div>
              <div>
                <label>Pickup Time</label>
                <span>${returnTime || 'Not set'}</span>
              </div>
            </div>
          </div>
        </div>
        ` : ''}

        <!-- Vehicle Summary -->
        <div class="sidebar-card">
          <div class="vehicle-summary">
            <div class="vehicle-summary-name">${selectedVehicle.name}</div>
            <img src="${selectedVehicle.image}" alt="${selectedVehicle.name}" class="vehicle-summary-img">
            <div class="vehicle-summary-specs">
              <span><i class="fas fa-suitcase"></i> ${selectedVehicle.suitcases} Suitcases</span>
              <span><i class="fas fa-users"></i> Up to ${selectedVehicle.passengers} Passengers</span>
            </div>
          </div>

          <div class="extras-summary" id="extrasSummary">
            <div class="extras-summary-title">Extra's</div>
            <div id="extrasListSummary">
              <!-- Will be populated by JS -->
            </div>
          </div>

          <div class="total-section">
            <div class="total-label">Total Price</div>
            <div class="total-price"><small>AED</small> <span id="totalPrice">${price || '0'}</span></div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    const API_BASE = '${apiBase}';
    const VEHICLES = ${vehiclesJSON};
    
    // Booking data from previous screens
    const bookingData = {
      type: '${type}',
      pickup: '${pickup || ''}',
      dropoff: '${dropoff || ''}',
      date: '${date}',
      time: '${time}',
      returnDate: '${returnDate || ''}',
      returnTime: '${returnTime || ''}',
      hours: ${hours || 0},
      vehicle: '${vehicle}',
      basePrice: ${price || 0}
    };

    // Extra prices
    const EXTRAS = {
      stop: { price: 38.12, selected: false },
      childSeat: { price: 27.22, selected: false }
    };

    // Seat counts
    const seatCounts = { seat36: 0, booster: 0, infant: 0 };

    function toggleExtra(extraId) {
      EXTRAS[extraId].selected = !EXTRAS[extraId].selected;
      const checkbox = document.getElementById(extraId + 'Checkbox');
      const checkIcon = checkbox.querySelector('i');
      
      if (EXTRAS[extraId].selected) {
        checkbox.classList.add('checked');
        checkIcon.style.display = 'block';
        if (extraId === 'childSeat') {
          document.getElementById('seatOptions').style.display = 'block';
          document.getElementById('boosterOptions').style.display = 'block';
          document.getElementById('infantOptions').style.display = 'block';
          document.getElementById('childSeatInfo').style.display = 'flex';
        }
      } else {
        checkbox.classList.remove('checked');
        checkIcon.style.display = 'none';
        if (extraId === 'childSeat') {
          document.getElementById('seatOptions').style.display = 'none';
          document.getElementById('boosterOptions').style.display = 'none';
          document.getElementById('infantOptions').style.display = 'none';
          document.getElementById('childSeatInfo').style.display = 'none';
        }
      }
      
      updateTotal();
    }

    function updateCount(seatType, delta) {
      seatCounts[seatType] = Math.max(0, seatCounts[seatType] + delta);
      document.getElementById(seatType + '-count').textContent = seatCounts[seatType];
    }

    function updateTotal() {
      let total = bookingData.basePrice;
      let extrasHtml = '';
      
      if (EXTRAS.stop.selected) {
        total += EXTRAS.stop.price;
        extrasHtml += '<div class="extras-summary-item"><span>Stop on the way</span><span>AED 38.12</span></div>';
      }
      if (EXTRAS.childSeat.selected) {
        total += EXTRAS.childSeat.price;
        extrasHtml += '<div class="extras-summary-item"><span>Child Seat</span><span>AED 27.22</span></div>';
      }
      
      document.getElementById('extrasListSummary').innerHTML = extrasHtml || '<div class="extras-summary-item"><span>No extras selected</span></div>';
      document.getElementById('totalPrice').textContent = total.toFixed(2);
    }

    function goBack() {
      window.history.back();
    }

    function goNext() {
      const fullName = document.getElementById('fullName').value;
      const email = document.getElementById('email').value;
      const countryCode = document.getElementById('countryCode').value;
      const contactNumber = document.getElementById('contactNumber').value;
      const whatsappCode = document.getElementById('whatsappCode').value;
      const whatsappNumber = document.getElementById('whatsappNumber').value;

      if (!fullName || !email || !contactNumber) {
        alert('Please fill in all required fields');
        return;
      }

      // Calculate total
      let total = bookingData.basePrice;
      if (EXTRAS.stop.selected) total += EXTRAS.stop.price;
      if (EXTRAS.childSeat.selected) total += EXTRAS.childSeat.price;

      const params = new URLSearchParams({
        ...bookingData,
        fullName,
        email,
        phone: countryCode + contactNumber,
        whatsapp: whatsappCode + whatsappNumber,
        stopOnWay: EXTRAS.stop.selected,
        childSeat: EXTRAS.childSeat.selected,
        totalPrice: total.toFixed(2)
      });

      // For now alert - Screen 4 (Billing) will handle this
      alert('Screen 4 (Billing Details) coming soon!\\n\\nName: ' + fullName + '\\nEmail: ' + email + '\\nTotal: AED ' + total.toFixed(2));
      // window.location.href = API_BASE + '/api/bookings/billing?' + params.toString();
    }

    // Initialize
    updateTotal();
  </script>
</body>
</html>`;

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.send(html);
    } catch (error) {
      console.error('Guest info error:', error);
      res.status(500).json({ success: false, error: 'Failed to load guest info', message: error.message });
    }
  }
};

module.exports = formController;
