const { query } = require('../config/db');

// Popular UAE locations
const UAE_LOCATIONS = [
  // Dubai - Popular Areas
  'Dubai International Airport',
  'Dubai Airport Terminal 1',
  'Dubai Airport Terminal 2',
  'Dubai Airport Terminal 3',
  'Burj Khalifa',
  'Dubai Marina',
  'Downtown Dubai',
  'Dubai Mall',
  'Mall of Emirates',
  'The Dubai Mall',
  'Jumeirah Beach Hotel',
  'Palm Jumeirah',
  'Dubai Creek Harbour',
  'JBR Beach',
  'Deira',
  'Bur Dubai',
  'Dubai Festival City',
  'Dubai Hills Estate',
  'Emirates Hills',
  'Al Barsha',
  'Jumeirah',
  'Dubai Silicon Oasis',
  'Business Bay',
  'DIFC',
  'Dubai International Financial Centre',
  'Dubai South',
  'Jebel Ali',
  'World Trade Centre',
  'Zabeel Park',
  'Al Safa',
  'Manara',
  'Satwa',
  'Al Karama',
  'Baniyas',
  'Al Manara',
  'Oud Metha',
  'Karama',
  'Naif',
  'Al Khaleej',
  'Al Reef',
  'Mirdif',
  'Muhaisnah',
  'Warsan',
  'Nad Al Sheba',
  'Hatta',
  'Meadows',
  'Springs',
  'Arabian Ranches',
  'Emirates Living',
  'Jumeirah Islands',
  'Jumeirah Heights',
  'The Hills',
  'Madinat Jumeirah',
  'Mall of the Emirates',
  'Ibn Battuta Mall',
  'Deira City Centre',
  'The Galleria',
  
  // Abu Dhabi
  'Abu Dhabi International Airport',
  'Etihad Tower',
  'Sheikh Zayed Grand Mosque',
  'Emirates Palace',
  'Yas Island',
  'Yas Mall',
  'Ferrari World',
  'Saadiyat Island',
  'Louvre Abu Dhabi',
  'Al Bateen',
  'Marina Mall Abu Dhabi',
  'Abu Dhabi Downtown',
  'Al Mina',
  'Khalifa City',
  'Al Reem Island',
  'Al Manara',
  'Al Marjan Island',
  'Corniche Abu Dhabi',
  'Sheikh Shakhbout City',
  'Al Ain',
  'Masdar City',
  
  // Sharjah
  'Sharjah International Airport',
  'Sharjah Corniche',
  'Al Majaz Waterfront',
  'Sharjah Museum',
  'Mega Mall Sharjah',
  'City Center Sharjah',
  'Al Qasba',
  'Sharjah Hills',
  'Al Furjan',
  'Muwailih',
  'Buhaira',
  'Al Nahda',
  'Al Reef',
  
  // Ajman
  'Ajman Corniche',
  'Ajman Museum',
  'Ajman City Centre',
  'Al Zahara',
  'Ajman Marina',
  
  // Umm Al Quwain
  'Umm Al Quwain',
  'Umm Al Quwain Corniche',
  'UAQ Marina',
  
  // Ras Al Khaimah
  'Ras Al Khaimah',
  'RAK Airport',
  'Ras Al Khaimah Corniche',
  'RAK Mall',
  'Al Noor Island',
  
  // Fujairah
  'Fujairah',
  'Fujairah Corniche',
  'Al Aqah Beach',
  'Fujairah Airport'
];

const formController = {
  /**
   * Serve complete WordPress booking form
   */
  async getBookingForm(req, res, next) {
    try {
      // Get the origin from request (handles both dev and production)
      const protocol = req.protocol || 'https';
      const host = req.get('host') || 'localhost:5000';
      const apiBase = `${protocol}://${host}`;

      // Get vehicle types from fare_rules
      const vehiclesResult = await query(`
        SELECT DISTINCT vehicle_type, base_fare, per_km_rate
        FROM fare_rules
        WHERE active = true
        ORDER BY base_fare ASC
      `);
      const vehicles = vehiclesResult.rows;

      // Build location JSON for JavaScript autocomplete
      const locationsJSON = JSON.stringify(UAE_LOCATIONS);

      // Build vehicle options
      const vehicleOptions = vehicles
        .map(v => `<option value="${v.vehicle_type}">
          ${v.vehicle_type.replace(/_/g, ' ').toUpperCase()} - Base AED ${parseFloat(v.base_fare).toFixed(2)}
        </option>`)
        .join('');

      // Build HTML form
      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Luxury Limo Booking</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }

    .container {
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      max-width: 600px;
      width: 100%;
      padding: 40px;
      animation: slideIn 0.5s ease-out;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .header {
      text-align: center;
      margin-bottom: 30px;
    }

    .header h1 {
      color: #333;
      font-size: 28px;
      margin-bottom: 8px;
    }

    .header p {
      color: #666;
      font-size: 14px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      color: #333;
      font-weight: 600;
      margin-bottom: 8px;
      font-size: 14px;
    }

    input[type="text"],
    input[type="email"],
    input[type="tel"],
    input[type="number"],
    select,
    textarea {
      width: 100%;
      padding: 12px 15px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 14px;
      font-family: inherit;
      transition: all 0.3s ease;
    }

    input[type="text"]:focus,
    input[type="email"]:focus,
    input[type="tel"]:focus,
    input[type="number"]:focus,
    select:focus,
    textarea:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    /* Autocomplete dropdown styling */
    .form-group {
      position: relative;
    }

    .autocomplete-suggestions {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border: 2px solid #e0e0e0;
      border-top: none;
      border-radius: 0 0 8px 8px;
      max-height: 250px;
      overflow-y: auto;
      display: none;
      z-index: 1000;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .autocomplete-suggestions.active {
      display: block;
    }

    .autocomplete-suggestions div {
      padding: 12px 15px;
      cursor: pointer;
      transition: all 0.2s ease;
      border-bottom: 1px solid #f0f0f0;
      font-size: 14px;
      color: #333;
    }

    .autocomplete-suggestions div:last-child {
      border-bottom: none;
    }

    .autocomplete-suggestions div:hover {
      background: #f5f5f5;
      color: #667eea;
      padding-left: 20px;
    }

    .autocomplete-suggestions div.highlighted {
      background: #667eea;
      color: white;
    }

    select {
      appearance: none;
      background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
      background-repeat: no-repeat;
      background-position: right 10px center;
      background-size: 20px;
      padding-right: 40px;
      cursor: pointer;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }

    .form-row.full {
      grid-template-columns: 1fr;
    }

    .fare-display {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 12px;
      text-align: center;
      margin: 20px 0;
      font-size: 16px;
    }

    .fare-display .label {
      font-size: 12px;
      opacity: 0.9;
      margin-bottom: 5px;
    }

    .fare-display .amount {
      font-size: 32px;
      font-weight: bold;
    }

    .counter-group {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }

    .counter {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #f5f5f5;
      padding: 10px;
      border-radius: 8px;
    }

    .counter button {
      width: 35px;
      height: 35px;
      border: none;
      background: #667eea;
      color: white;
      border-radius: 6px;
      cursor: pointer;
      font-size: 18px;
      font-weight: bold;
      transition: all 0.3s ease;
    }

    .counter button:hover {
      background: #764ba2;
      transform: scale(1.05);
    }

    .counter input {
      width: 50px;
      text-align: center;
      border: none;
      background: transparent;
      font-size: 18px;
      font-weight: bold;
    }

    .btn-submit {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-top: 10px;
    }

    .btn-submit:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
    }

    .btn-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .success-message {
      display: none;
      background: #4caf50;
      color: white;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
      animation: slideIn 0.3s ease-out;
    }

    .error-message {
      display: none;
      background: #f44336;
      color: white;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
      animation: slideIn 0.3s ease-out;
    }

    .loading {
      display: none;
      text-align: center;
      color: #667eea;
      font-weight: 600;
    }

    .spinner {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 3px solid #f3f3f3;
      border-top: 3px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .note {
      font-size: 12px;
      color: #999;
      margin-top: 5px;
    }

    @media (max-width: 600px) {
      .container {
        padding: 25px;
      }

      .header h1 {
        font-size: 22px;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .form-row.full {
        grid-template-columns: 1fr;
      }

      .fare-display .amount {
        font-size: 28px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚗 Book Your Ride</h1>
      <p>Premium Limo Service Across UAE</p>
    </div>

    <div class="success-message" id="successMessage">
      ✅ Booking confirmed! Your ride will arrive soon.
    </div>

    <div class="error-message" id="errorMessage"></div>

    <form id="bookingForm">
      <!-- Customer Details -->
      <div class="form-row full">
        <div class="form-group">
          <label for="name">Full Name *</label>
          <input type="text" id="name" name="name" placeholder="Ahmed Mohammed" required>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="email">Email *</label>
          <input type="email" id="email" name="email" placeholder="ahmed@example.com" required>
        </div>
        <div class="form-group">
          <label for="phone">Phone *</label>
          <input type="tel" id="phone" name="phone" placeholder="+971501234567" required>
        </div>
      </div>

      <!-- Locations with Smart Autocomplete -->
      <div class="form-row">
        <div class="form-group">
          <label for="pickup">Pickup Location *</label>
          <input type="text" id="pickup" name="pickup" placeholder="Type location..." required autocomplete="off">
          <div id="pickup-suggestions" class="autocomplete-suggestions"></div>
        </div>
        <div class="form-group">
          <label for="dropoff">Dropoff Location *</label>
          <input type="text" id="dropoff" name="dropoff" placeholder="Type location..." required autocomplete="off">
          <div id="dropoff-suggestions" class="autocomplete-suggestions"></div>
        </div>
      </div>

      <!-- Vehicle & Distance -->
      <div class="form-row">
        <div class="form-group">
          <label for="vehicle">Vehicle Type *</label>
          <select id="vehicle" name="vehicle" required>
            <option value="">Select vehicle...</option>
            ${vehicleOptions}
          </select>
        </div>
        <div class="form-group">
          <label for="distance">Distance (km) *</label>
          <input type="number" id="distance" name="distance" placeholder="30" min="1" step="0.1" value="15" required>
        </div>
      </div>

      <!-- Passengers & Luggage -->
      <label style="margin-top: 20px; display: block; font-weight: 600; color: #333; margin-bottom: 15px;">Passengers & Luggage</label>
      <div class="counter-group">
        <div class="counter">
          <label for="passengers" style="margin: 0;">👥 Passengers</label>
          <div style="display: flex; gap: 5px; align-items: center;">
            <button type="button" onclick="decreasePassengers()">−</button>
            <input type="number" id="passengers" value="1" min="1" readonly>
            <button type="button" onclick="increasePassengers()">+</button>
          </div>
        </div>
        <div class="counter">
          <label for="luggage" style="margin: 0;">🧳 Luggage</label>
          <div style="display: flex; gap: 5px; align-items: center;">
            <button type="button" onclick="decreaseLuggage()">−</button>
            <input type="number" id="luggage" value="0" min="0" readonly>
            <button type="button" onclick="increaseLuggage()">+</button>
          </div>
        </div>
      </div>

      <!-- Payment Method -->
      <div class="form-row full" style="margin-top: 20px;">
        <div class="form-group">
          <label for="payment">Payment Method *</label>
          <select id="payment" name="payment" required>
            <option value="cash">💵 Cash</option>
            <option value="card">💳 Card</option>
          </select>
        </div>
      </div>

      <!-- Special Notes -->
      <div class="form-row full">
        <div class="form-group">
          <label for="notes">Special Instructions</label>
          <textarea id="notes" name="notes" placeholder="Any special requests?" rows="3"></textarea>
          <div class="note">Optional - e.g., "Call 10 mins before", "Extra luggage", etc.</div>
        </div>
      </div>

      <!-- Fare Display -->
      <div class="fare-display">
        <div class="label">Estimated Fare</div>
        <div class="amount">AED <span id="fareAmount">0.00</span></div>
      </div>

      <!-- Loading & Submit -->
      <div class="loading" id="loading">
        <div class="spinner"></div>
        <p>Processing your booking...</p>
      </div>

      <button type="submit" class="btn-submit" id="submitBtn">Book Now</button>
    </form>
  </div>

  <script>
    const API_BASE = '${apiBase}';
    const ALL_LOCATIONS = ${locationsJSON};
    
    // Counter functions
    function increasePassengers() {
      const input = document.getElementById('passengers');
      input.value = Math.min(parseInt(input.value) + 1, 6);
      calculateFare();
    }
    
    function decreasePassengers() {
      const input = document.getElementById('passengers');
      input.value = Math.max(parseInt(input.value) - 1, 1);
      calculateFare();
    }
    
    function increaseLuggage() {
      const input = document.getElementById('luggage');
      input.value = Math.min(parseInt(input.value) + 1, 8);
      calculateFare();
    }
    
    function decreaseLuggage() {
      const input = document.getElementById('luggage');
      input.value = Math.max(parseInt(input.value) - 1, 0);
      calculateFare();
    }

    // Debounce timer for fare calculation
    let fareTimeout;

    // Calculate fare when inputs change
    function calculateFare() {
      const vehicle = document.getElementById('vehicle').value;
      const distance = parseFloat(document.getElementById('distance').value) || 0;

      // Clear previous timeout
      clearTimeout(fareTimeout);

      if (!vehicle || distance < 1) {
        document.getElementById('fareAmount').textContent = '0.00';
        return;
      }

      // Debounce the API call
      fareTimeout = setTimeout(() => {
        fetch(API_BASE + '/api/bookings/wordpress-calculate-fare', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vehicle_type: vehicle,
            booking_type: 'point_to_point',
            distance_km: distance
          })
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            const fare = parseFloat(data.data.final_fare);
            document.getElementById('fareAmount').textContent = fare.toFixed(2);
          } else {
            console.warn('Fare calculation warning:', data.error);
            document.getElementById('fareAmount').textContent = '---';
          }
        })
        .catch(err => {
          console.error('Fare calculation error:', err);
          document.getElementById('fareAmount').textContent = '---';
        });
      }, 500); // Wait 500ms after user stops typing
    }

    // Event listeners
    document.getElementById('vehicle').addEventListener('change', calculateFare);
    document.getElementById('distance').addEventListener('input', calculateFare);
    document.getElementById('distance').addEventListener('blur', calculateFare);

    // Form submission
    document.getElementById('bookingForm').addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = document.getElementById('submitBtn');
      const loading = document.getElementById('loading');
      const errorMsg = document.getElementById('errorMessage');
      const successMsg = document.getElementById('successMessage');

      submitBtn.disabled = true;
      loading.style.display = 'block';
      errorMsg.style.display = 'none';
      successMsg.style.display = 'none';

      const bookingData = {
        customer_name: document.getElementById('name').value,
        customer_email: document.getElementById('email').value,
        customer_phone: document.getElementById('phone').value,
        pickup_location: document.getElementById('pickup').value,
        dropoff_location: document.getElementById('dropoff').value,
        vehicle_type: document.getElementById('vehicle').value,
        booking_type: 'point_to_point',
        passengers_count: parseInt(document.getElementById('passengers').value),
        luggage_count: parseInt(document.getElementById('luggage').value),
        distance_km: parseFloat(document.getElementById('distance').value),
        payment_method: document.getElementById('payment').value,
        notes: document.getElementById('notes').value || null,
        wordpress_booking_id: 'WP-' + Date.now()
      };

      try {
        const response = await fetch(API_BASE + '/api/bookings/wordpress-booking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookingData)
        });

        const data = await response.json();

        if (data.success) {
          successMsg.innerHTML = \`✅ Booking Confirmed! ID: <strong>\${data.data.booking_id}</strong><br>Fare: AED \${parseFloat(data.data.fare_aed).toFixed(2)}\`;
          successMsg.style.display = 'block';
          document.getElementById('bookingForm').reset();
          document.getElementById('fareAmount').textContent = '0.00';
          
          // Scroll to success message
          successMsg.scrollIntoView({ behavior: 'smooth' });
        } else {
          errorMsg.textContent = '❌ Error: ' + (data.error || 'Failed to create booking');
          errorMsg.style.display = 'block';
        }
      } catch (error) {
        errorMsg.textContent = '❌ Error: ' + error.message;
        errorMsg.style.display = 'block';
      } finally {
        submitBtn.disabled = false;
        loading.style.display = 'none';
      }
    });

    // Autocomplete function
    function setupAutocomplete(inputId, suggestionsId) {
      const input = document.getElementById(inputId);
      const suggestionsBox = document.getElementById(suggestionsId);

      input.addEventListener('input', function() {
        const value = this.value.toLowerCase().trim();

        if (value.length < 1) {
          suggestionsBox.innerHTML = '';
          suggestionsBox.classList.remove('active');
          return;
        }

        // Filter locations that match the input
        const matches = ALL_LOCATIONS.filter(location =>
          location.toLowerCase().includes(value)
        );

        if (matches.length === 0) {
          suggestionsBox.innerHTML = '';
          suggestionsBox.classList.remove('active');
          return;
        }

        // Show top 8 suggestions
        const suggestions = matches.slice(0, 8);
        suggestionsBox.innerHTML = suggestions
          .map(location => \`<div onclick="selectLocation('\${inputId}', '\${location}')">\${location}</div>\`)
          .join('');
        suggestionsBox.classList.add('active');
      });

      // Hide suggestions when input loses focus
      input.addEventListener('blur', function() {
        setTimeout(() => {
          suggestionsBox.classList.remove('active');
        }, 200);
      });

      // Show suggestions on focus if input has value
      input.addEventListener('focus', function() {
        if (this.value.length > 0) {
          suggestionsBox.classList.add('active');
        }
      });
    }

    // Select location from suggestions
    function selectLocation(inputId, location) {
      const input = document.getElementById(inputId);
      input.value = location;
      document.getElementById(inputId + '-suggestions').classList.remove('active');
      input.focus();
    }

    // Setup autocomplete for both fields
    setupAutocomplete('pickup', 'pickup-suggestions');
    setupAutocomplete('dropoff', 'dropoff-suggestions');

    // Initial fare calculation
    calculateFare();
  </script>
</body>
</html>
      `;

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(html);
    } catch (error) {
      console.error('Form generation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate form',
        message: error.message
      });
    }
  }
};

module.exports = formController;
