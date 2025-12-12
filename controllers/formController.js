const { query } = require("../config/db");

// UAE COMPREHENSIVE Locations for Autocomplete (850+ Locations - Popular Areas, Hotels, Restaurants, Shops, Hospitals, etc.)
const UAE_LOCATIONS = [
  // AIRPORTS & TRANSPORT
  "Dubai International Airport", "DXB", "Al Maktoum Airport", "DWC",
  "Dubai Airport Terminal 1", "Dubai Airport Terminal 2", "Dubai Airport Terminal 3",
  "Abu Dhabi International Airport", "AUH", "Sharjah International Airport",
  "RAK Airport", "Fujairah Airport", "Ajman Airport",
  
  // DUBAI - LANDMARKS
  "Burj Khalifa", "Dubai Marina", "Downtown Dubai", "Dubai Mall", "Business Bay",
  "Palm Jumeirah", "Dubai Creek", "Deira", "Bur Dubai", "JBR Beach", "Jumeirah Beach",
  "Dubai Hills Estate", "Emirates Hills", "Arabian Ranches", "Dubai Silicon Oasis",
  "Dubai Festival City", "Dubai Creek Harbour", "World Trade Centre",
  
  // DUBAI - SHOPPING MALLS
  "The Dubai Mall", "Mall of the Emirates", "Ibn Battuta Mall", "Dubai Marina Mall",
  "Deira City Centre", "The Galleria", "Uptown Downtown", "Marina Mall",
  "Emporium Mall", "City Centre Deira", "Lulu Hypermarket", "Carrefour", "Spinneys",
  
  // ABU DHABI
  "Abu Dhabi Downtown", "Etihad Tower", "Sheikh Zayed Grand Mosque", "Emirates Palace",
  "Al Reem Island", "Al Mina", "Khalifa City", "Al Bateen", "Yas Island", "Yas Mall",
  "Ferrari World", "Saadiyat Island", "Louvre Abu Dhabi", "Marina Mall Abu Dhabi",
  
  // SHARJAH
  "Sharjah Corniche", "Al Majaz Waterfront", "Sharjah Museum", "Mega Mall Sharjah",
  "City Center Sharjah", "Al Qasba", "Sharjah Hills", "Al Nahda", "Khorfakkan",
  "Khorfakkan Beach", "Kalba", "Dibba",
  
  // OTHER EMIRATES
  "Ajman Corniche", "Ajman City Centre", "Ajman Museum", "Umm Al Quwain",
  "Ras Al Khaimah", "RAK Corniche", "Jebel Jais", "Khatt Hot Springs",
  "Fujairah", "Fujairah Corniche", "Al Aqah Beach", "Dibba Beach", "Khor Fakkan",
  "Al Ain", "Al Ain Zoo", "Wadi Adventure Al Ain", "Hatta", "Hatta Dam",
  
  // HOTELS & RESORTS (100+)
  "Atlantis The Palm", "Burj Al Arab", "Jumeirah Beach Hotel", "Jumeirah Zabeel Saray",
  "Jumeirah Creekside Hotel", "Emirates Palace Abu Dhabi", "St Regis Abu Dhabi",
  "Park Hyatt Abu Dhabi", "Anantara Eastern Mangroves", "Radisson Blu Hotel Dubai",
  "Sofitel Dubai Downtown", "Fairmont The Palm", "Raffles The Palm Dubai",
  "One&Only Royal Mirage", "Mandarin Oriental Dubai", "Mina A'Salam", "Le Méridien Dubai",
  "Hilton Dubai", "Sheraton Dubai", "Dusit Thani Dubai", "Novotel Dubai", "Ibis Dubai",
  "Four Seasons Dubai", "Ritz Carlton Dubai", "Banyan Tree Dubai", "Arabian Ranches Hotel",
  "Rixos The Palm", "Rotana Hotels Dubai", "Apartments by Marriott Dubai",
  
  // RESTAURANTS & CAFES (120+)
  "Cafe de Palma", "Al Mallah Restaurant", "Arabian Tea House Cafe", "Bu Qtair Restaurant",
  "Em Sherif Restaurant", "Al Reef Bakery", "Zaroob Restaurant", "Hummus FZ", "Loloma Cafe",
  "Costa Coffee Dubai", "Starbucks Dubai", "Pret A Manger", "Shake Shack Dubai",
  "Nando's Dubai", "McDonald's Dubai", "Burger King Dubai", "KFC Dubai", "Pizza Hut Dubai",
  "Subway Dubai", "Dunkin' Donuts Dubai", "Cafe Coffee Day", "Espresso Lab",
  "Caffe Nero", "Department of Cafe Affairs", "Cafe Bateel", "Milos Dubai",
  "Nusr-Et Dubai", "Nobu Dubai", "Zuma Dubai", "Italian Kitchen Restaurant",
  "Locanda Restaurant", "Bella Donna Restaurant", "Tom Yum Restaurant",
  "Blue Jade Thai Restaurant", "Thai Kitchen Restaurant", "Pho Ca Dao",
  "Noodle House Dubai", "Ramen Ya Restaurant", "Ichiban Ramen", "Wagamama Dubai",
  "Din Tai Fung Dubai", "Fogo De Chao Dubai", "Bab Al Yaman", "Arabian Court",
  "Bastakiya Nights", "Kariya Sushi Restaurant", "Sumo Sushi and Bento",
  "Mosquito Coast Dubai", "Sadaf Restaurant", "Seafood Market", "Fish Beach Dubai",
  "Arabian Appetizers", "Arabian Kitchen Restaurant", "Zaroob Al Manara",
  "Wild Peeta Restaurant", "Fold Dubai", "Marzipan Cafe & Restaurant",
  "Lime Tree Cafe", "Matcha Cafe", "Poutine House Dubai", "Munch Burger",
  "Falafel House", "Shawarma House", "Lebanese Grill", "Persian Grille",
  "Turkish House", "Moroccan Tagine House", "Indian Spice House", "Curry House Dubai",
  "Taj Mahal Restaurant",
  
  // SHOPPING & RETAIL (80+)
  "Saks Fifth Avenue Dubai", "Bloomingdale's Dubai", "Galeries Lafayette Abu Dhabi",
  "Harvey Nichols Dubai", "Virgin Megastore Dubai", "Borders Books Dubai", "BookWorm UAE",
  "Ace Hardware Dubai", "Organic Foods & Cafe", "City Flower Shop", "Flora House",
  "Blooms Florist", "Al Fardan Exchange", "UAE Exchange", "Al Ansari Exchange",
  "ADIB Bank", "FAB Bank", "DIB Bank", "ENBD Bank", "Emirates NBD",
  "First Abu Dhabi Bank", "RAK Bank", "Mashreq Bank", "Adidas Store Dubai",
  "Nike Store Dubai", "Puma Store Dubai", "Reebok Store", "Lacoste Boutique",
  "Tommy Hilfiger Store", "Calvin Klein Dubai", "Gucci Dubai", "Louis Vuitton Dubai",
  "Chanel Dubai", "Hermès Dubai", "Dior Dubai", "Prada Dubai",
  
  // ENTERTAINMENT & LEISURE (60+)
  "Dubai Aquarium", "Dubai Underwater Zoo", "Lost Chambers Aquarium", "Madame Tussauds Dubai",
  "Dubai Reptile Zoo", "Big Bus Tours Dubai", "Dune Bashing Dubai", "Desert Safari Dubai",
  "Hot Air Balloon Dubai", "Helicopter Tour Dubai", "Yacht Cruise Dubai", "Jet Ski Dubai",
  "Parasailing Dubai", "Scuba Diving Dubai", "Snorkeling Dubai", "Surfing Dubai",
  "Kayaking Dubai", "Fishing Tour Dubai", "Yacht Rental Dubai", "Speedboat Tour Dubai",
  "Catamaran Cruise Dubai", "Sunset Cruise Dubai", "Dinner Cruise Dubai",
  "Spa & Wellness Dubai", "Hammam Dubai", "Turkish Bath Dubai", "Massage Center Dubai",
  "Yoga Studio Dubai", "Fitness Gym Dubai", "Swimming Pool Dubai", "Tennis Court Dubai",
  "Golf Course Dubai", "Bowling Alley Dubai", "Arcade Dubai", "Cinema Dubai",
  "Theatre Dubai", "Concert Hall Dubai", "Art Gallery Dubai", "Museum Dubai",
  
  // TRANSPORTATION & SERVICES (40+)
  "Dubai Taxi Stand", "Bus Station Dubai", "Train Station Dubai", "Uber Pick up Point",
  "Careem Pick up Point", "Car Rental Agency Dubai", "Avis Car Rental", "Hertz Car Rental",
  "Budget Car Rental", "Europcar Car Rental", "Thrifty Car Rental", "Sixt Car Rental",
  "Petrol Station Dubai", "Fuel Station Dubai", "Car Wash Dubai", "Auto Service Center Dubai",
  "Mercedes Service Center", "BMW Service Center", "Audi Service Center",
  "Toyota Service Center", "Nissan Service Center", "Honda Service Center",
  
  // HOSPITALS & MEDICAL (50+)
  "American Hospital Dubai", "Medicana International Dubai", "NMC Hospital Dubai",
  "Aster Hospital Dubai", "Burjeel Hospital Dubai", "Zayed Hospital Dubai",
  "Tawam Hospital Abu Dhabi", "Al Jahara Hospital Abu Dhabi", "Mafraq Hospital Abu Dhabi",
  "Sheikh Khalifa Medical City", "Cleveland Clinic Abu Dhabi", "Medical Center Dubai",
  "Clinic Dubai", "Dental Center Dubai", "Eye Clinic Dubai", "Orthopedic Center Dubai",
  "Physical Therapy Dubai", "Dermatology Clinic Dubai", "Pediatric Clinic Dubai",
  "Pharmacy Dubai", "Medical Laboratory Dubai"
];

// Vehicle data with images - RATES FROM DATABASE fare_rules
const VEHICLES = [
  {
    id: "classic",
    name: "Classic",
    badge: "MOST POPULAR",
    passengers: 3,
    suitcases: 2,
    image:
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=300&h=150&fit=crop",
    baseFare: 95,
    perKm: 1.0,
    includedKm: 20,
    discount: 0,
    features: ["Private Transfer", "Meet & Greet", "Free Cancellation"],
  },
  {
    id: "executive",
    name: "Executive",
    badge: "BEST VALUE",
    passengers: 3,
    suitcases: 2,
    image:
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=300&h=150&fit=crop",
    baseFare: 105,
    perKm: 1.0,
    includedKm: 20,
    discount: 0,
    features: [
      "Private Transfer",
      "Meet & Greet",
      "Free Cancellation",
      "Premium Service",
    ],
  },
  {
    id: "urban_suv",
    name: "Urban SUV",
    badge: "NEW",
    passengers: 5,
    suitcases: 4,
    image:
      "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=300&h=150&fit=crop",
    baseFare: 108,
    perKm: 1.0,
    includedKm: 20,
    discount: 0,
    features: [
      "Private Transfer",
      "Meet & Greet",
      "Free Cancellation",
      "Extra Luggage Space",
    ],
  },
  {
    id: "elite_van",
    name: "Elite Van",
    badge: "",
    passengers: 7,
    suitcases: 7,
    image:
      "https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=300&h=150&fit=crop",
    baseFare: 165,
    perKm: 2.0,
    includedKm: 20,
    discount: 0,
    features: [
      "Private Transfer",
      "Meet & Greet",
      "Free Cancellation",
      "Group Travel",
    ],
  },
  {
    id: "luxury_suv",
    name: "Luxury SUV",
    badge: "",
    passengers: 5,
    suitcases: 4,
    image:
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=300&h=150&fit=crop",
    baseFare: 170,
    perKm: 1.8,
    includedKm: 20,
    discount: 0,
    features: [
      "Private Transfer",
      "Meet & Greet",
      "Free Cancellation",
      "Premium Luxury",
    ],
  },
  {
    id: "first_class",
    name: "First Class",
    badge: "LUXURY",
    passengers: 3,
    suitcases: 2,
    image:
      "https://images.unsplash.com/photo-1563720223185-11003d516935?w=300&h=150&fit=crop",
    baseFare: 450,
    perKm: 1.75,
    includedKm: 40,
    discount: 0,
    features: [
      "Private Transfer",
      "Meet & Greet",
      "Free Cancellation",
      "VIP Experience",
      "Refreshments",
    ],
  },
];

const formController = {
  /**
   * Screen 1: Initial Booking Form
   */
  async getBookingForm(req, res, next) {
    try {
      const protocol = req.get("x-forwarded-proto") || req.protocol || "https";
      const host = req.get("host") || "localhost:5000";
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
      // background: url('https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1920') center/cover no-repeat fixed;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }
    input[type="date"]::-webkit-calendar-picker-indicator, input[type="time"]::-webkit-calendar-picker-indicator {
        filter: invert(1);
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
    
    /* ===== RESPONSIVE DESIGN ===== */
    /* MOBILE SMALL (320px - 480px) */
    @media (max-width: 480px) {
      body { padding: 10px; }
      .glass-container { 
        padding: 20px 15px; 
        max-width: 100%;
        border-radius: 15px;
      }
      .tabs { 
        gap: 10px;
        margin-bottom: 25px;
        flex-wrap: wrap;
        justify-content: center;
      }
      .tab { 
        font-size: 12px;
        letter-spacing: 1px;
        padding-bottom: 6px;
      }
      .form-group { margin-bottom: 18px; }
      .form-group label { font-size: 10px; margin-bottom: 8px; }
      .form-group input { 
        font-size: 14px;
        padding: 8px 0;
      }
      .datetime-field { flex-direction: column; gap: 15px; }
      .datetime-field input { width: 100%; }
      .buttons-row { 
        flex-direction: column;
        gap: 12px;
        margin-top: 25px;
      }
      .btn-primary, .btn-link { font-size: 12px; }
      .btn-primary { padding-bottom: 3px; }
      .footer-text { 
        font-size: 12px;
        margin-top: 20px;
      }
      .footer-text span { font-size: 16px; }
      .hours-selector { gap: 8px; }
      .hour-option { 
        padding: 8px 12px;
        font-size: 12px;
        flex: 1;
        min-width: 70px;
      }
      .autocomplete-suggestions { 
        max-height: 150px;
        font-size: 13px;
      }
      .autocomplete-suggestions div { padding: 10px 12px; }
    }
    
    /* MOBILE MEDIUM (480px - 768px) */
    @media (min-width: 481px) and (max-width: 768px) {
      body { padding: 15px; }
      .glass-container { 
        padding: 28px 22px;
        max-width: 100%;
        border-radius: 18px;
      }
      .tabs { 
        gap: 20px;
        margin-bottom: 30px;
      }
      .tab { 
        font-size: 13px;
        letter-spacing: 1.2px;
      }
      .form-group { margin-bottom: 20px; }
      .form-group label { font-size: 10.5px; margin-bottom: 9px; }
      .form-group input { 
        font-size: 14px;
        padding: 9px 0;
      }
      .datetime-field { gap: 12px; }
      .buttons-row { 
        flex-direction: column;
        gap: 15px;
        margin-top: 28px;
      }
      .btn-primary, .btn-link { font-size: 12.5px; }
      .footer-text { font-size: 12.5px; }
      .footer-text span { font-size: 17px; }
      .hours-selector { gap: 9px; }
      .hour-option { 
        padding: 9px 16px;
        font-size: 13px;
      }
      .autocomplete-suggestions { 
        max-height: 180px;
        font-size: 13.5px;
      }
    }
    
    /* TABLETS (768px - 1024px) */
    @media (min-width: 769px) and (max-width: 1024px) {
      body { padding: 20px; }
      .glass-container { 
        padding: 35px 35px;
        max-width: 650px;
      }
      .tabs { gap: 40px; }
      .tab { font-size: 15px; }
      .form-group { margin-bottom: 22px; }
      .datetime-field { gap: 15px; }
      .buttons-row { margin-top: 32px; }
      .footer-text { font-size: 13px; }
    }
    
    /* DESKTOP (1024px+) */
    @media (min-width: 1025px) {
      body { padding: 30px; }
      .glass-container { 
        padding: 40px 50px;
        max-width: 700px;
      }
      .tabs { gap: 50px; }
      .datetime-field { gap: 15px; }
      .buttons-row { margin-top: 35px; }
      .footer-text { font-size: 14px; }
    }
    
    /* UNIVERSAL IMPROVEMENTS */
    @media (max-width: 768px) {
      /* Better touch targets */
      .hour-option { min-height: 40px; display: flex; align-items: center; justify-content: center; }
      .btn-primary, .btn-link { min-height: 44px; display: flex; align-items: center; }
      /* Fix date/time inputs on mobile */
      input[type="date"], input[type="time"] { font-size: 16px; }
      /* Better autocomplete on mobile */
      .autocomplete-suggestions { 
        max-height: 200px;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
      }
    }
    /* Beautiful Toast Notifications */
    .toast-container { position: fixed; top: 20px; right: 20px; z-index: 10000; display: flex; flex-direction: column; gap: 10px; }
    .toast { background: rgba(30, 40, 50, 0.95); border-radius: 12px; padding: 16px 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.3); display: flex; align-items: center; gap: 12px; min-width: 320px; max-width: 420px; animation: slideIn 0.3s ease; border-left: 4px solid #f44336; }
    .toast.success { border-left-color: #4caf50; }
    .toast.warning { border-left-color: #ff9800; }
    .toast.error { border-left-color: #f44336; }
    .toast-icon { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 16px; }
    .toast.error .toast-icon { background: rgba(244,67,54,0.2); color: #f44336; }
    .toast.success .toast-icon { background: rgba(76,175,80,0.2); color: #4caf50; }
    .toast.warning .toast-icon { background: rgba(255,152,0,0.2); color: #ff9800; }
    .toast-content { flex: 1; }
    .toast-title { font-size: 14px; font-weight: 600; color: #fff; margin-bottom: 2px; }
    .toast-message { font-size: 13px; color: rgba(255,255,255,0.8); line-height: 1.4; }
    .toast-close { background: none; border: none; color: rgba(255,255,255,0.6); cursor: pointer; padding: 5px; font-size: 18px; }
    .toast-close:hover { color: #fff; }
    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
  </style>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
  <div id="toastContainer" class="toast-container"></div>
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
    // Beautiful Toast Notification Function
    function showToast(message, type = 'error', title = '') {
      const container = document.getElementById('toastContainer');
      const toast = document.createElement('div');
      toast.className = 'toast ' + type;
      const icons = { error: 'fa-exclamation-circle', success: 'fa-check-circle', warning: 'fa-exclamation-triangle' };
      const titles = { error: 'Oops!', success: 'Success!', warning: 'Warning' };
      toast.innerHTML = '<div class="toast-icon"><i class="fas ' + icons[type] + '"></i></div><div class="toast-content"><div class="toast-title">' + (title || titles[type]) + '</div><div class="toast-message">' + message + '</div></div><button class="toast-close" onclick="this.parentElement.remove()">&times;</button>';
      container.appendChild(toast);
      setTimeout(() => { toast.style.animation = 'slideOut 0.3s ease forwards'; setTimeout(() => toast.remove(), 300); }, 4000);
    }

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
        if (!pickup || !dropoff) { showToast('Please enter pickup and dropoff locations', 'error', 'Missing Location'); return; }

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
        if (!pickup) { showToast('Please enter pickup location', 'error', 'Missing Location'); return; }
        if (!selectedHours) { showToast('Please select rental hours', 'warning', 'Select Hours'); return; }

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
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.send(html);
    } catch (error) {
      console.error("Form generation error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to generate form",
        message: error.message,
      });
    }
  },

  /**
   * Screen 2: Vehicle Details Page
   */
  async getVehicleDetails(req, res, next) {
    try {
      const {
        type,
        pickup,
        dropoff,
        date,
        time,
        returnDate,
        returnTime,
        hours,
      } = req.query;
      const protocol = req.get("x-forwarded-proto") || req.protocol || "https";
      const host = req.get("host") || "localhost:5000";
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

    /* Navigation Buttons */
    .button-group {
      display: flex;
      gap: 15px;
      margin-top: 40px;
      justify-content: center;
    }
    .btn-back {
      flex: 1;
      max-width: 300px;
      background: #f0f0f0;
      color: #333;
      border: 1px solid #ddd;
      padding: 14px 30px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      font-family: 'Montserrat', sans-serif;
    }
    .btn-back:hover {
      background: #e0e0e0;
      border-color: #999;
    }

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
      <h1 class="page-title">${type === "round_trip" ? "Book a Return Ride" : type === "hourly" ? "Book Hourly Rental" : "Book a Ride"}</h1>
      
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
            <div class="journey-text">${pickup || "Pickup Location"}</div>
          </div>
          <div class="journey-connector"></div>
          <div class="journey-point">
            <div class="journey-icon end"></div>
            <div class="journey-text">${dropoff || pickup || "Dropoff Location"}</div>
          </div>
        </div>

        ${
          type === "round_trip"
            ? `
        <!-- Return Journey -->
        <div class="journey-section">
          <div class="journey-label">Return Journey</div>
          <div class="journey-point">
            <div class="journey-icon"></div>
            <div class="journey-text">${dropoff || "Return From"}</div>
          </div>
          <div class="journey-connector"></div>
          <div class="journey-point">
            <div class="journey-icon end"></div>
            <div class="journey-text">${pickup || "Return To"}</div>
          </div>
        </div>
        `
            : ""
        }

        ${
          type === "hourly"
            ? `
        <div class="info-item">
          <i class="fas fa-clock"></i>
          <span>${hours} Hours Rental</span>
        </div>
        `
            : ""
        }

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
      <!-- Navigation Buttons -->
      <div class="button-group">
        <button class="btn-back" onclick="goBack()">BACK</button>
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
      pickup: '${pickup || ""}',
      dropoff: '${dropoff || ""}',
      date: '${date}',
      time: '${time}',
      returnDate: '${returnDate || ""}',
      returnTime: '${returnTime || ""}',
      hours: ${hours || 0}
    };

    function goBack() {
      const params = new URLSearchParams({
        type: bookingData.type,
        pickup: bookingData.pickup,
        ...(bookingData.dropoff && { dropoff: bookingData.dropoff }),
        date: bookingData.date,
        time: bookingData.time,
        ...(bookingData.returnDate && { returnDate: bookingData.returnDate }),
        ...(bookingData.returnTime && { returnTime: bookingData.returnTime }),
        ...(bookingData.hours && { hours: bookingData.hours })
      });
      window.location.href = API_BASE + '/api/bookings/wordpress-form?' + params.toString();
    }

    function calculatePrice(vehicle) {
      let price;
      const includedKm = vehicle.includedKm || 20;
      
      if (BOOKING_TYPE === 'hourly') {
        price = vehicle.baseFare * HOURS;
      } else if (BOOKING_TYPE === 'round_trip') {
        const totalDistance = DISTANCE * 2;
        if (totalDistance > includedKm) {
          price = vehicle.baseFare + ((totalDistance - includedKm) * vehicle.perKm);
        } else {
          price = vehicle.baseFare;
        }
      } else {
        if (DISTANCE > includedKm) {
          price = vehicle.baseFare + ((DISTANCE - includedKm) * vehicle.perKm);
        } else {
          price = vehicle.baseFare;
        }
      }
      return { original: Math.round(price), final: Math.round(price) };
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
              <div class="price-label">Total Price</div>
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

      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.send(html);
    } catch (error) {
      console.error("Vehicle details error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to load vehicle details",
        message: error.message,
      });
    }
  },

  /**
   * Screen 3: Schedule & Guest Info Page - Starsky Line Limousine Style
   */
  async getGuestInfo(req, res, next) {
    try {
      const {
        type,
        pickup,
        dropoff,
        date,
        time,
        returnDate,
        returnTime,
        hours,
        vehicle,
        price,
      } = req.query;
      const protocol = req.get("x-forwarded-proto") || req.protocol || "https";
      const host = req.get("host") || "localhost:5000";
      const apiBase = `${protocol}://${host}`;

      const selectedVehicle =
        VEHICLES.find((v) => v.id === vehicle) || VEHICLES[0];
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
    body { font-family: 'Montserrat', sans-serif; background: #f5f5f5; min-height: 100vh; color: #333; }
    .container { max-width: 1100px; margin: 0 auto; padding: 20px; }
    .page-header { text-align: center; margin-bottom: 30px; }
    .page-title { font-size: 24px; font-weight: 600; color: #333; margin-bottom: 20px; }
    .progress-steps { display: flex; justify-content: center; gap: 30px; margin-bottom: 30px; }
    .step { display: flex; align-items: center; gap: 10px; color: #999; font-size: 12px; }
    .step.completed { color: #4caf50; }
    .step.active { color: #333; }
    .step-icon { width: 28px; height: 28px; border-radius: 50%; background: #e0e0e0; display: flex; align-items: center; justify-content: center; font-size: 11px; }
    .step.completed .step-icon { background: #4caf50; color: #fff; }
    .step.active .step-icon { background: #1a1a1a; color: #fff; }
    .step-line { width: 50px; height: 2px; background: #e0e0e0; }
    .step-line.completed { background: #4caf50; }
    .main-layout { display: grid; grid-template-columns: 1fr 350px; gap: 25px; }
    .form-section { background: #fff; border-radius: 12px; padding: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
    .section-title { font-size: 16px; font-weight: 600; margin-bottom: 20px; color: #333; padding-bottom: 10px; border-bottom: 1px solid #eee; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .form-group { margin-bottom: 15px; }
    .form-group.full-width { grid-column: span 2; }
    .form-group label { display: block; font-size: 11px; font-weight: 500; color: #888; margin-bottom: 6px; text-transform: uppercase; }
    .form-group input { width: 100%; padding: 12px 15px; border: 1px solid #e0e0e0; border-radius: 0; font-size: 14px; font-family: 'Montserrat', sans-serif; background: #fff; }
    .form-group input:focus { outline: none; border-color: #333; }
    .form-group input::placeholder { color: #bbb; }
    
    /* Starsky Line Limousine Phone Input with Flags */
    .phone-wrapper { position: relative; }
    .phone-input-group { display: flex; border: 1px solid #e0e0e0; }
    .country-select-btn { display: flex; align-items: center; gap: 8px; padding: 12px 15px; background: #fff; border: none; border-right: 1px solid #e0e0e0; cursor: pointer; min-width: 140px; font-family: 'Montserrat', sans-serif; font-size: 13px; }
    .country-select-btn img { width: 24px; height: 16px; object-fit: cover; border-radius: 2px; }
    .country-select-btn .code { color: #333; font-weight: 500; }
    .country-select-btn i { margin-left: auto; color: #999; font-size: 10px; }
    .phone-input-group input { flex: 1; border: none; padding: 12px 15px; font-size: 14px; }
    .phone-input-group input:focus { outline: none; }
    
    /* Country Dropdown */
    .country-dropdown { position: absolute; top: 100%; left: 0; right: 0; background: #fff; border: 1px solid #e0e0e0; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 1000; max-height: 250px; overflow-y: auto; display: none; }
    .country-dropdown.open { display: block; }
    .country-option { display: flex; align-items: center; gap: 10px; padding: 10px 15px; cursor: pointer; font-size: 13px; }
    .country-option:hover { background: #f5f5f5; }
    .country-option img { width: 24px; height: 16px; object-fit: cover; border-radius: 2px; }
    .country-option .name { flex: 1; color: #333; }
    .country-option .dial { color: #666; }
    
    .form-note { font-size: 11px; color: #999; margin-top: 15px; display: flex; align-items: center; gap: 5px; }
    .form-note i { color: #4caf50; }
    
    /* Extras Section */
    .extras-section { margin-top: 25px; }
    .extra-row { display: flex; justify-content: space-between; align-items: flex-start; padding: 15px 0; border-bottom: 1px solid #eee; }
    .extra-left { display: flex; align-items: flex-start; gap: 12px; }
    .extra-checkbox { width: 18px; height: 18px; border: 2px solid #ddd; border-radius: 3px; cursor: pointer; display: flex; align-items: center; justify-content: center; margin-top: 2px; }
    .extra-checkbox.checked { background: #333; border-color: #333; color: #fff; }
    .extra-checkbox i { font-size: 10px; display: none; }
    .extra-checkbox.checked i { display: block; }
    .extra-name { font-size: 14px; font-weight: 500; color: #333; }
    .extra-desc { font-size: 11px; color: #999; margin-top: 3px; }
    .extra-price { font-size: 14px; font-weight: 600; color: #333; }
    
    /* Stop Location Field */
    .stop-field { margin-top: 15px; padding: 15px; background: #fafafa; border: 1px solid #e0e0e0; display: none; }
    .stop-field.visible { display: block; }
    .stop-field-label { font-size: 12px; font-weight: 500; color: #333; margin-bottom: 8px; }
    .stop-field input { width: 100%; padding: 12px 15px; border: 1px solid #e0e0e0; font-size: 14px; font-family: 'Montserrat', sans-serif; }
    .stop-field input::placeholder { color: #bbb; }
    .stop-note { font-size: 11px; color: #888; margin-top: 8px; }
    
    /* Child Seat Section */
    .child-seat-section { padding: 15px 0; display: none; }
    .child-seat-section.visible { display: block; }
    .seat-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f0f0f0; }
    .seat-label { font-size: 13px; color: #666; }
    .seat-label span { font-size: 11px; color: #999; }
    
    /* Starsky Line Limousine Yellow Quantity Buttons */
    .qty-control { display: flex; align-items: center; gap: 0; }
    .qty-btn { width: 32px; height: 32px; border: 1px solid #ffc107; background: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 500; color: #333; transition: all 0.2s; }
    .qty-btn:hover { background: #ffc107; }
    .qty-btn.minus { border-radius: 4px 0 0 4px; }
    .qty-btn.plus { border-radius: 0 4px 4px 0; background: #ffc107; }
    .qty-value { width: 40px; height: 32px; border-top: 1px solid #ffc107; border-bottom: 1px solid #ffc107; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 600; background: #fff; }
    
    .info-box { background: #f8f9fa; border-radius: 4px; padding: 12px 15px; margin-top: 15px; display: none; font-size: 12px; color: #666; line-height: 1.5; }
    .info-box.visible { display: flex; align-items: flex-start; gap: 10px; }
    .info-box i { color: #999; margin-top: 2px; }
    
    /* Sidebar */
    .sidebar { display: flex; flex-direction: column; gap: 15px; }
    .sidebar-card { background: #fff; border-radius: 8px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
    .sidebar-title { font-size: 14px; font-weight: 600; margin-bottom: 15px; color: #333; }
    .trip-point { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 8px; }
    .trip-dot { width: 10px; height: 10px; border-radius: 50%; margin-top: 4px; flex-shrink: 0; }
    .trip-dot.green { background: #4caf50; }
    .trip-dot.red { background: #f44336; }
    .trip-text { font-size: 12px; color: #333; line-height: 1.4; }
    .trip-datetime { display: flex; gap: 20px; margin-top: 12px; padding-top: 12px; border-top: 1px solid #eee; }
    .trip-datetime div { font-size: 11px; }
    .trip-datetime label { color: #999; display: flex; align-items: center; gap: 5px; margin-bottom: 3px; }
    .trip-datetime span { color: #333; font-weight: 500; }
    
    /* Vehicle Summary Card - Yellow Header */
    .vehicle-card-summary { border: 2px solid #ffc107; border-radius: 8px; overflow: hidden; }
    .vehicle-card-header { background: #ffc107; padding: 12px 15px; display: flex; justify-content: space-between; align-items: center; }
    .vehicle-card-header .name { font-size: 14px; font-weight: 600; color: #333; }
    .vehicle-card-header .badge { font-size: 10px; color: #666; display: flex; align-items: center; gap: 4px; }
    .vehicle-card-body { padding: 15px; background: #fff; }
    .vehicle-specs { display: flex; gap: 15px; margin-bottom: 10px; font-size: 11px; color: #666; }
    .vehicle-specs span { display: flex; align-items: center; gap: 4px; }
    .vehicle-img { width: 100%; height: 70px; object-fit: contain; margin: 10px 0; }
    
    /* Extras Summary */
    .extras-summary { border-top: 1px solid #eee; padding-top: 15px; margin-top: 10px; }
    .extras-summary-title { font-size: 13px; font-weight: 600; margin-bottom: 10px; color: #333; }
    .extras-line { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; font-size: 12px; }
    .extras-line .label { color: #666; }
    .extras-line .calc { color: #999; font-size: 11px; }
    .extras-line .arrow { color: #ffc107; margin: 0 8px; }
    .extras-line .price { font-weight: 600; color: #333; }
    
    /* Total Price */
    .total-line { display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-top: 2px solid #eee; margin-top: 10px; }
    .total-label { font-size: 14px; font-weight: 600; color: #333; display: flex; align-items: center; gap: 5px; }
    .total-label .arrow { color: #ffc107; }
    .total-amount { text-align: right; }
    .total-amount .currency { font-size: 11px; color: #999; }
    .total-amount .price { font-size: 22px; font-weight: 700; color: #333; }
    
    /* Buttons */
    .buttons-row { display: flex; gap: 15px; margin-top: 25px; }
    .btn-back { flex: 1; padding: 14px; border: 1px solid #ddd; border-radius: 0; background: #fff; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'Montserrat', sans-serif; }
    .btn-back:hover { background: #f5f5f5; }
    .btn-next { flex: 2; padding: 14px; border: none; border-radius: 0; background: #1a8b6e; color: #fff; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'Montserrat', sans-serif; }
    .btn-next:hover { background: #157a5e; }
    
    @media (max-width: 800px) {
      .main-layout { grid-template-columns: 1fr; }
      .form-grid { grid-template-columns: 1fr; }
      .form-group.full-width { grid-column: span 1; }
      .sidebar { order: -1; }
    }
    
    /* Beautiful Toast Notifications */
    .toast-container { position: fixed; top: 20px; right: 20px; z-index: 10000; display: flex; flex-direction: column; gap: 10px; }
    .toast { 
      background: #fff; 
      border-radius: 12px; 
      padding: 16px 20px; 
      box-shadow: 0 10px 40px rgba(0,0,0,0.15); 
      display: flex; 
      align-items: center; 
      gap: 12px; 
      min-width: 320px; 
      max-width: 420px;
      animation: slideIn 0.3s ease;
      border-left: 4px solid #f44336;
    }
    .toast.success { border-left-color: #4caf50; }
    .toast.warning { border-left-color: #ff9800; }
    .toast.error { border-left-color: #f44336; }
    .toast-icon { 
      width: 36px; 
      height: 36px; 
      border-radius: 50%; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      flex-shrink: 0;
      font-size: 16px;
    }
    .toast.error .toast-icon { background: #ffebee; color: #f44336; }
    .toast.success .toast-icon { background: #e8f5e9; color: #4caf50; }
    .toast.warning .toast-icon { background: #fff3e0; color: #ff9800; }
    .toast-content { flex: 1; }
    .toast-title { font-size: 14px; font-weight: 600; color: #333; margin-bottom: 2px; }
    .toast-message { font-size: 13px; color: #666; line-height: 1.4; }
    .toast-close { 
      background: none; 
      border: none; 
      color: #999; 
      cursor: pointer; 
      padding: 5px;
      font-size: 18px;
    }
    .toast-close:hover { color: #333; }
    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
  </style>
</head>
<body>
  <div id="toastContainer" class="toast-container"></div>
  <div class="container">
    <div class="page-header">
      <h1 class="page-title">Book a ${type === "round_trip" ? "City Tour" : "Private Transfer"}</h1>
      <div class="progress-steps">
        <div class="step completed"><div class="step-icon"><i class="fas fa-check"></i></div><span>Vehicle Details</span></div>
        <div class="step-line completed"></div>
        <div class="step active"><div class="step-icon"><i class="fas fa-check"></i></div><span>Schedule & Guest Info</span></div>
        <div class="step-line"></div>
        <div class="step"><div class="step-icon"><i class="fas fa-file-invoice"></i></div><span>Billing Details</span></div>
      </div>
    </div>

    <div class="main-layout">
      <div class="form-section">
        <h2 class="section-title">Passenger Details</h2>
        <div class="form-grid">
          <div class="form-group">
            <label>Full Name</label>
            <input type="text" id="fullName" placeholder="Full Name" required>
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" id="email" placeholder="Email Address" required>
          </div>
          <div class="form-group">
            <label>Contact Number</label>
            <div class="phone-wrapper">
              <div class="phone-input-group">
                <button type="button" class="country-select-btn" id="contactCountryBtn" onclick="toggleDropdown('contact')">
                  <img src="https://flagcdn.com/w40/ae.png" id="contactFlag">
                  <span class="code" id="contactCode">+971</span>
                  <i class="fas fa-chevron-down"></i>
                </button>
                <input type="tel" id="contactNumber" placeholder="e.g. 50 123 4567">
              </div>
              <div class="country-dropdown" id="contactDropdown"></div>
            </div>
          </div>
          <div class="form-group">
            <label>WhatsApp Number</label>
            <div class="phone-wrapper">
              <div class="phone-input-group">
                <button type="button" class="country-select-btn" id="whatsappCountryBtn" onclick="toggleDropdown('whatsapp')">
                  <img src="https://flagcdn.com/w40/ae.png" id="whatsappFlag">
                  <span class="code" id="whatsappCode">+971</span>
                  <i class="fas fa-chevron-down"></i>
                </button>
                <input type="tel" id="whatsappNumber" placeholder="e.g. 50 123 4567">
              </div>
              <div class="country-dropdown" id="whatsappDropdown"></div>
            </div>
          </div>
        </div>
        <div class="form-note"><i class="fas fa-info-circle"></i> We need this email and contact number for urgent communication on the transfer day</div>

        <!-- Extras Section -->
        <div class="extras-section">
          <h2 class="section-title">Extra's</h2>
          
          <div class="extra-row">
            <div class="extra-left">
              <div class="extra-checkbox" id="stopCheckbox" onclick="toggleExtra('stop')"><i class="fas fa-check"></i></div>
              <div><div class="extra-name">Stop on the way</div></div>
            </div>
            <div class="extra-price">AED 38.12</div>
          </div>
          
          <div class="stop-field" id="stopField">
            <div class="stop-field-label">The place you need to stop in</div>
            <input type="text" id="stopLocation" placeholder="Enter stop location">
            <div class="stop-note">To stop can be made within 10km from the main route. The maximum time is 30 minutes.</div>
          </div>

          <div class="extra-row">
            <div class="extra-left">
              <div class="extra-checkbox" id="childSeatCheckbox" onclick="toggleExtra('childSeat')"><i class="fas fa-check"></i></div>
              <div>
                <div class="extra-name">Child Seat</div>
                <div class="extra-desc">This is required if children are travelling with you</div>
              </div>
            </div>
            <div class="extra-price">AED 27.22</div>
          </div>

          <div class="child-seat-section" id="childSeatSection">
            <div class="seat-row">
              <div class="seat-label">Seat <span>0-18 kg</span></div>
              <div class="qty-control">
                <button class="qty-btn minus" onclick="updateCount('seat', -1)">-</button>
                <div class="qty-value" id="seat-count">0</div>
                <button class="qty-btn plus" onclick="updateCount('seat', 1)">+</button>
              </div>
            </div>
            <div class="seat-row">
              <div class="seat-label">Booster <span>15-36 kg</span></div>
              <div class="qty-control">
                <button class="qty-btn minus" onclick="updateCount('booster', -1)">-</button>
                <div class="qty-value" id="booster-count">0</div>
                <button class="qty-btn plus" onclick="updateCount('booster', 1)">+</button>
              </div>
            </div>
            <div class="seat-row">
              <div class="seat-label">Infant seat <span>Up to 9 kg</span></div>
              <div class="qty-control">
                <button class="qty-btn minus" onclick="updateCount('infant', -1)">-</button>
                <div class="qty-value" id="infant-count">0</div>
                <button class="qty-btn plus" onclick="updateCount('infant', 1)">+</button>
              </div>
            </div>
            <div class="info-box" id="childSeatInfo">
              <i class="fas fa-info-circle"></i>
              <p>You may bring your own child seat. In this case, you don't need to add a child seat rent to your booking.</p>
            </div>
          </div>
        </div>

        <div class="buttons-row">
          <button class="btn-back" onclick="goBack()">BACK</button>
          <button class="btn-next" onclick="goNext()">NEXT</button>
        </div>
      </div>

      <div class="sidebar">
        ${
          type === "round_trip"
            ? `
        <div class="sidebar-card">
          <div class="sidebar-title">Return Ride Trip</div>
          <div class="trip-point"><div class="trip-dot green"></div><div class="trip-text">${dropoff || "Return From"}</div></div>
          <div class="trip-point"><div class="trip-dot red"></div><div class="trip-text">${pickup || "Return To"}</div></div>
          <div class="trip-datetime">
            <div><label><i class="far fa-calendar"></i> Pickup Date</label><span>${returnDate || date}</span></div>
            <div><label><i class="far fa-clock"></i> Pickup Time</label><span>${returnTime || time}</span></div>
          </div>
        </div>
        `
            : `
        <div class="sidebar-card">
          <div class="sidebar-title">One Way Trip</div>
          <div class="trip-point"><div class="trip-dot green"></div><div class="trip-text">${pickup || "Pickup Location"}</div></div>
          <div class="trip-point"><div class="trip-dot red"></div><div class="trip-text">${dropoff || "Dropoff Location"}</div></div>
          <div class="trip-datetime">
            <div><label><i class="far fa-calendar"></i> Pickup Date</label><span>${date || "Not set"}</span></div>
            <div><label><i class="far fa-clock"></i> Pickup Time</label><span>${time || "Not set"}</span></div>
          </div>
        </div>
        `
        }

        <div class="sidebar-card">
          <div class="vehicle-card-summary">
            <div class="vehicle-card-header">
              <span class="name">${selectedVehicle.name}</span>
              <span class="badge"><i class="far fa-clock"></i> Free Waiting Time</span>
            </div>
            <div class="vehicle-card-body">
              <div class="vehicle-specs">
                <span><i class="fas fa-suitcase"></i> Up to ${selectedVehicle.suitcases} Suitcases</span>
                <span><i class="fas fa-users"></i> Up to ${selectedVehicle.passengers} Passengers</span>
              </div>
              <img src="${selectedVehicle.image}" alt="${selectedVehicle.name}" class="vehicle-img">
            </div>
          </div>

          <div class="extras-summary">
            <div class="extras-summary-title">Extra's</div>
            <div id="extrasListSummary"></div>
          </div>

          <div class="total-line">
            <div class="total-label"><span class="arrow"><i class="fas fa-arrow-right"></i></span> Total Price</div>
            <div class="total-amount">
              <span class="currency">AED</span>
              <span class="price" id="totalPrice">${price || "0"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    // Beautiful Toast Notification Function
    function showToast(message, type = 'error', title = '') {
      const container = document.getElementById('toastContainer');
      const toast = document.createElement('div');
      toast.className = 'toast ' + type;
      
      const icons = { error: 'fa-exclamation-circle', success: 'fa-check-circle', warning: 'fa-exclamation-triangle' };
      const titles = { error: 'Oops!', success: 'Success!', warning: 'Warning' };
      
      toast.innerHTML = \`
        <div class="toast-icon"><i class="fas \${icons[type]}"></i></div>
        <div class="toast-content">
          <div class="toast-title">\${title || titles[type]}</div>
          <div class="toast-message">\${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
      \`;
      
      container.appendChild(toast);
      setTimeout(() => { toast.style.animation = 'slideOut 0.3s ease forwards'; setTimeout(() => toast.remove(), 300); }, 4000);
    }

    const API_BASE = '${apiBase}';
    const VEHICLES = ${vehiclesJSON};
    
    const bookingData = {
      type: '${type}',
      pickup: '${pickup || ""}',
      dropoff: '${dropoff || ""}',
      date: '${date}',
      time: '${time}',
      returnDate: '${returnDate || ""}',
      returnTime: '${returnTime || ""}',
      hours: ${hours || 0},
      vehicle: '${vehicle}',
      basePrice: ${price || 0}
    };

    const COUNTRIES = [
      { code: '+971', name: 'United Arab Emirates', flag: 'ae' },
      { code: '+1', name: 'United States', flag: 'us' },
      { code: '+44', name: 'United Kingdom', flag: 'gb' },
      { code: '+91', name: 'India', flag: 'in' },
      { code: '+92', name: 'Pakistan', flag: 'pk' },
      { code: '+966', name: 'Saudi Arabia', flag: 'sa' },
      { code: '+93', name: 'Afghanistan', flag: 'af' },
      { code: '+355', name: 'Albania', flag: 'al' },
      { code: '+49', name: 'Germany', flag: 'de' },
      { code: '+33', name: 'France', flag: 'fr' },
      { code: '+39', name: 'Italy', flag: 'it' },
      { code: '+34', name: 'Spain', flag: 'es' },
      { code: '+86', name: 'China', flag: 'cn' },
      { code: '+81', name: 'Japan', flag: 'jp' },
      { code: '+82', name: 'South Korea', flag: 'kr' },
      { code: '+7', name: 'Russia', flag: 'ru' },
      { code: '+61', name: 'Australia', flag: 'au' },
      { code: '+55', name: 'Brazil', flag: 'br' },
      { code: '+52', name: 'Mexico', flag: 'mx' },
      { code: '+27', name: 'South Africa', flag: 'za' }
    ];

    const EXTRAS = { stop: { price: 38.12, selected: false }, childSeat: { price: 27.22, selected: false } };
    const seatCounts = { seat: 0, booster: 0, infant: 0 };
    const selectedCountry = { contact: COUNTRIES[0], whatsapp: COUNTRIES[0] };

    function initDropdowns() {
      ['contact', 'whatsapp'].forEach(type => {
        const dropdown = document.getElementById(type + 'Dropdown');
        dropdown.innerHTML = COUNTRIES.map(c => 
          \`<div class="country-option" onclick="selectCountry('\${type}', '\${c.code}')">
            <img src="https://flagcdn.com/w40/\${c.flag}.png">
            <span class="name">\${c.name}</span>
            <span class="dial">\${c.code}</span>
          </div>\`
        ).join('');
      });
    }

    function toggleDropdown(type) {
      const dropdown = document.getElementById(type + 'Dropdown');
      document.querySelectorAll('.country-dropdown').forEach(d => {
        if (d.id !== type + 'Dropdown') d.classList.remove('open');
      });
      dropdown.classList.toggle('open');
    }

    function selectCountry(type, code) {
      const country = COUNTRIES.find(c => c.code === code);
      if (country) {
        selectedCountry[type] = country;
        document.getElementById(type + 'Flag').src = 'https://flagcdn.com/w40/' + country.flag + '.png';
        document.getElementById(type + 'Code').textContent = country.code;
        document.getElementById(type + 'Dropdown').classList.remove('open');
      }
    }

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.phone-wrapper')) {
        document.querySelectorAll('.country-dropdown').forEach(d => d.classList.remove('open'));
      }
    });

    function toggleExtra(extraId) {
      EXTRAS[extraId].selected = !EXTRAS[extraId].selected;
      const checkbox = document.getElementById(extraId + 'Checkbox');
      checkbox.classList.toggle('checked');
      
      if (extraId === 'stop') {
        document.getElementById('stopField').classList.toggle('visible', EXTRAS.stop.selected);
      }
      if (extraId === 'childSeat') {
        document.getElementById('childSeatSection').classList.toggle('visible', EXTRAS.childSeat.selected);
        document.getElementById('childSeatInfo').classList.toggle('visible', EXTRAS.childSeat.selected);
      }
      updateTotal();
    }

    function updateCount(seatType, delta) {
      seatCounts[seatType] = Math.max(0, seatCounts[seatType] + delta);
      document.getElementById(seatType + '-count').textContent = seatCounts[seatType];
      updateTotal();
    }

    function updateTotal() {
      let total = bookingData.basePrice;
      let extrasHtml = '';
      
      if (EXTRAS.stop.selected) {
        total += EXTRAS.stop.price;
        extrasHtml += '<div class="extras-line"><span class="label">Add Stop</span><span class="arrow"><i class="fas fa-arrow-right"></i></span><span class="price">AED 38.12</span></div>';
      }
      
      const totalSeats = seatCounts.seat + seatCounts.booster + seatCounts.infant;
      if (EXTRAS.childSeat.selected && totalSeats > 0) {
        if (seatCounts.seat > 0) {
          const seatTotal = 27.22 * seatCounts.seat;
          total += seatTotal;
          extrasHtml += \`<div class="extras-line"><span class="label">Seat</span><span class="calc">AED 27.22 x \${seatCounts.seat}</span><span class="arrow"><i class="fas fa-arrow-right"></i></span><span class="price">AED \${seatTotal.toFixed(2)}</span></div>\`;
        }
        if (seatCounts.booster > 0) {
          const boosterTotal = 27.22 * seatCounts.booster;
          total += boosterTotal;
          extrasHtml += \`<div class="extras-line"><span class="label">Booster</span><span class="calc">AED 27.22 x \${seatCounts.booster}</span><span class="arrow"><i class="fas fa-arrow-right"></i></span><span class="price">AED \${boosterTotal.toFixed(2)}</span></div>\`;
        }
        if (seatCounts.infant > 0) {
          const infantTotal = 27.22 * seatCounts.infant;
          total += infantTotal;
          extrasHtml += \`<div class="extras-line"><span class="label">Infant seat</span><span class="calc">AED 27.22 x \${seatCounts.infant}</span><span class="arrow"><i class="fas fa-arrow-right"></i></span><span class="price">AED \${infantTotal.toFixed(2)}</span></div>\`;
        }
      }
      
      document.getElementById('extrasListSummary').innerHTML = extrasHtml || '<div class="extras-line"><span class="label">No extras selected</span></div>';
      document.getElementById('totalPrice').textContent = total.toFixed(2);
    }

    function goBack() { window.history.back(); }

    function goNext() {
      const fullName = document.getElementById('fullName').value;
      const email = document.getElementById('email').value;
      const contactNumber = document.getElementById('contactNumber').value;
      const whatsappNumber = document.getElementById('whatsappNumber').value;

      if (!fullName || !email || !contactNumber) {
        showToast('Please fill in all required fields', 'error', 'Required Fields');
        return;
      }

      let total = bookingData.basePrice;
      if (EXTRAS.stop.selected) total += EXTRAS.stop.price;
      const totalSeats = seatCounts.seat + seatCounts.booster + seatCounts.infant;
      if (EXTRAS.childSeat.selected) total += 27.22 * totalSeats;

      const params = new URLSearchParams({
        ...bookingData,
        fullName,
        email,
        phone: selectedCountry.contact.code + contactNumber,
        whatsapp: selectedCountry.whatsapp.code + whatsappNumber,
        stopOnWay: EXTRAS.stop.selected,
        stopLocation: document.getElementById('stopLocation').value,
        childSeats: totalSeats,
        seatCount: seatCounts.seat,
        boosterCount: seatCounts.booster,
        infantCount: seatCounts.infant,
        totalPrice: total.toFixed(2)
      });

      window.location.href = API_BASE + '/api/bookings/billing?' + params.toString();
    }

    initDropdowns();
    updateTotal();
  </script>
</body>
</html>`;

      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.send(html);
    } catch (error) {
      console.error("Guest info error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to load guest info",
        message: error.message,
      });
    }
  },

  /**
   * Screen 4: Billing Details Page
   */
  async getBillingDetails(req, res, next) {
    try {
      const {
        type,
        pickup,
        dropoff,
        date,
        time,
        returnDate,
        returnTime,
        vehicle,
        price,
        fullName,
        email,
        phone,
        whatsapp,
        stopOnWay,
        stopLocation,
        childSeats,
        seatCount,
        boosterCount,
        infantCount,
        totalPrice,
      } = req.query;
      const protocol = req.get("x-forwarded-proto") || req.protocol || "https";
      const host = req.get("host") || "localhost:5000";
      const apiBase = `${protocol}://${host}`;

      const selectedVehicle =
        VEHICLES.find((v) => v.id === vehicle) || VEHICLES[0];
      const basePrice = parseFloat(price) || 0;
      const stopCost = stopOnWay === "true" ? 38.12 : 0;
      const seatCost = 27.22 * (parseInt(seatCount) || 0);
      const boosterCost = 27.22 * (parseInt(boosterCount) || 0);
      const infantCost = 27.22 * (parseInt(infantCount) || 0);
      const subtotal =
        basePrice + stopCost + seatCost + boosterCost + infantCost;
      const vat = 0;
      const total = subtotal + vat;

      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Billing Details - Luxury Limo</title>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Montserrat', sans-serif; background: #f5f5f5; min-height: 100vh; color: #333; }
    .container { max-width: 1100px; margin: 0 auto; padding: 20px; }
    .page-header { text-align: center; margin-bottom: 30px; }
    .page-title { font-size: 24px; font-weight: 600; color: #333; margin-bottom: 20px; }
    .progress-steps { display: flex; justify-content: center; gap: 30px; margin-bottom: 30px; }
    .step { display: flex; align-items: center; gap: 10px; color: #999; font-size: 12px; }
    .step.completed { color: #4caf50; }
    .step.active { color: #333; }
    .step-icon { width: 28px; height: 28px; border-radius: 50%; background: #e0e0e0; display: flex; align-items: center; justify-content: center; font-size: 11px; }
    .step.completed .step-icon { background: #4caf50; color: #fff; }
    .step.active .step-icon { background: #1a1a1a; color: #fff; }
    .step-line { width: 50px; height: 2px; background: #e0e0e0; }
    .step-line.completed { background: #4caf50; }
    .main-layout { display: grid; grid-template-columns: 1fr 350px; gap: 25px; }
    .form-section { background: #fff; border-radius: 8px; padding: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
    .section-title { font-size: 16px; font-weight: 600; margin-bottom: 20px; color: #333; }
    
    /* Price Breakdown */
    .breakdown-header { display: flex; align-items: center; gap: 15px; padding: 15px; background: #f8f9fa; border-radius: 8px; margin-bottom: 20px; }
    .breakdown-header img { width: 100px; height: 60px; object-fit: contain; }
    .breakdown-header .info { flex: 1; }
    .breakdown-header .name { font-size: 14px; font-weight: 600; margin-bottom: 5px; }
    .breakdown-header .specs { display: flex; gap: 15px; font-size: 11px; color: #666; }
    .breakdown-header .specs span { display: flex; align-items: center; gap: 4px; }
    
    .breakdown-lines { border-top: 1px solid #eee; padding-top: 15px; }
    .breakdown-line { display: flex; justify-content: space-between; padding: 10px 0; font-size: 13px; }
    .breakdown-line.total { border-top: 2px solid #eee; margin-top: 10px; padding-top: 15px; font-weight: 600; font-size: 14px; }
    .breakdown-line .label { color: #333; }
    .breakdown-line .value { font-weight: 500; }
    .breakdown-line.total .value { font-size: 18px; color: #1a8b6e; }
    .breakdown-line .arrow { color: #ffc107; margin-right: 8px; }
    
    /* Payment Methods */
    .payment-section { margin-top: 25px; }
    .payment-option { display: flex; align-items: center; gap: 15px; padding: 15px; border: 2px solid #e0e0e0; border-radius: 8px; margin-bottom: 10px; cursor: pointer; transition: all 0.3s; }
    .payment-option.selected { border-color: #1a8b6e; background: #f8fdfb; }
    .payment-radio { width: 20px; height: 20px; border: 2px solid #ddd; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
    .payment-option.selected .payment-radio { border-color: #1a8b6e; }
    .payment-option.selected .payment-radio::after { content: ''; width: 10px; height: 10px; border-radius: 50%; background: #1a8b6e; }
    .payment-icon { width: 24px; color: #666; }
    .payment-info { flex: 1; }
    .payment-name { font-size: 14px; font-weight: 500; }
    .payment-desc { font-size: 11px; color: #999; }
    .payment-cards { display: flex; gap: 5px; }
    .payment-cards img { height: 20px; }
    
    .terms { display: flex; align-items: flex-start; gap: 10px; margin-top: 20px; font-size: 12px; color: #666; }
    .terms input { margin-top: 3px; }
    .terms a { color: #1a8b6e; }
    
    .buttons-row { display: flex; gap: 15px; margin-top: 25px; }
    .btn-back { flex: 1; padding: 14px; border: 1px solid #ddd; background: #fff; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'Montserrat', sans-serif; }
    .btn-next { flex: 2; padding: 14px; border: none; background: #1a8b6e; color: #fff; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'Montserrat', sans-serif; }
    .btn-next:hover { background: #157a5e; }
    
    /* Sidebar */
    .sidebar { display: flex; flex-direction: column; gap: 15px; }
    .sidebar-card { background: #fff; border-radius: 8px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
    .sidebar-title { font-size: 14px; font-weight: 600; margin-bottom: 15px; color: #333; }
    .trip-point { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 8px; }
    .trip-dot { width: 10px; height: 10px; border-radius: 50%; margin-top: 4px; }
    .trip-dot.green { background: #4caf50; }
    .trip-dot.red { background: #f44336; }
    .trip-text { font-size: 12px; color: #333; line-height: 1.4; }
    .trip-datetime { display: flex; gap: 20px; margin-top: 12px; padding-top: 12px; border-top: 1px solid #eee; font-size: 11px; }
    .trip-datetime label { color: #999; display: flex; align-items: center; gap: 5px; margin-bottom: 3px; }
    .trip-datetime span { color: #333; font-weight: 500; }
    
    .passenger-info { font-size: 12px; }
    .passenger-info .row { display: flex; flex-direction: column; margin-bottom: 12px; }
    .passenger-info label { color: #999; font-size: 11px; margin-bottom: 3px; }
    .passenger-info span { color: #333; font-weight: 500; }
    
    @media (max-width: 800px) {
      .main-layout { grid-template-columns: 1fr; }
      .sidebar { order: -1; }
    }
    
    /* Beautiful Toast Notifications */
    .toast-container { position: fixed; top: 20px; right: 20px; z-index: 10000; display: flex; flex-direction: column; gap: 10px; }
    .toast { background: #fff; border-radius: 12px; padding: 16px 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.15); display: flex; align-items: center; gap: 12px; min-width: 320px; max-width: 420px; animation: slideIn 0.3s ease; border-left: 4px solid #f44336; }
    .toast.success { border-left-color: #4caf50; }
    .toast.warning { border-left-color: #ff9800; }
    .toast.error { border-left-color: #f44336; }
    .toast-icon { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 16px; }
    .toast.error .toast-icon { background: #ffebee; color: #f44336; }
    .toast.success .toast-icon { background: #e8f5e9; color: #4caf50; }
    .toast.warning .toast-icon { background: #fff3e0; color: #ff9800; }
    .toast-content { flex: 1; }
    .toast-title { font-size: 14px; font-weight: 600; color: #333; margin-bottom: 2px; }
    .toast-message { font-size: 13px; color: #666; line-height: 1.4; }
    .toast-close { background: none; border: none; color: #999; cursor: pointer; padding: 5px; font-size: 18px; }
    .toast-close:hover { color: #333; }
    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
  </style>
</head>
<body>
  <div id="toastContainer" class="toast-container"></div>
  <div class="container">
    <div class="page-header">
      <h1 class="page-title">Book a ${type === "round_trip" ? "City Tour" : "Private Transfer"}</h1>
      <div class="progress-steps">
        <div class="step completed"><div class="step-icon"><i class="fas fa-check"></i></div><span>Vehicle Details</span></div>
        <div class="step-line completed"></div>
        <div class="step completed"><div class="step-icon"><i class="fas fa-check"></i></div><span>Schedule & Guest Info</span></div>
        <div class="step-line completed"></div>
        <div class="step active"><div class="step-icon"><i class="fas fa-file-invoice"></i></div><span>Billing Details</span></div>
      </div>
    </div>

    <div class="main-layout">
      <div class="form-section">
        <h2 class="section-title">Price Breakdown</h2>
        
        <div class="breakdown-header">
          <img src="${selectedVehicle.image}" alt="${selectedVehicle.name}">
          <div class="info">
            <div class="name">${selectedVehicle.name}</div>
            <div class="specs">
              <span><i class="fas fa-users"></i> Up to ${selectedVehicle.passengers} Passengers</span>
              <span><i class="fas fa-suitcase"></i> Up to ${selectedVehicle.suitcases} Luggages</span>
              <span><i class="far fa-clock"></i> Free Waiting Time</span>
            </div>
          </div>
        </div>

        <div class="breakdown-lines">
          <div class="breakdown-line"><span class="label">One Way Trip</span><span class="value">AED ${(basePrice / (type === "round_trip" ? 2 : 1)).toFixed(2)}</span></div>
          ${type === "round_trip" ? '<div class="breakdown-line"><span class="label">Return Route</span><span class="value">AED ' + (basePrice / 2).toFixed(2) + "</span></div>" : ""}
          ${stopOnWay === "true" ? '<div class="breakdown-line"><span class="label">Add Stop</span><span class="value">AED 38.12</span></div>' : ""}
          ${parseInt(seatCount) > 0 ? '<div class="breakdown-line"><span class="label">Regular Child Seat (' + seatCount + ')</span><span class="value">AED ' + seatCost.toFixed(2) + "</span></div>" : ""}
          ${parseInt(boosterCount) > 0 ? '<div class="breakdown-line"><span class="label">Booster Child Seat (' + boosterCount + ')</span><span class="value">AED ' + boosterCost.toFixed(2) + "</span></div>" : ""}
          ${parseInt(infantCount) > 0 ? '<div class="breakdown-line"><span class="label">Infant Child Seat (' + infantCount + ')</span><span class="value">AED ' + infantCost.toFixed(2) + "</span></div>" : ""}
          <div class="breakdown-line"><span class="label">Subtotal</span><span class="value">AED ${subtotal.toFixed(2)}</span></div>
          <div class="breakdown-line"><span class="label">VAT (0.00%)</span><span class="value">AED ${vat.toFixed(2)}</span></div>
          <div class="breakdown-line total"><span class="label"><span class="arrow"><i class="fas fa-arrow-right"></i></span> Total Amount</span><span class="value">AED ${total.toFixed(2)}</span></div>
        </div>

        <div class="payment-section">
          <h2 class="section-title">Payment Method</h2>
          <div class="payment-option selected" onclick="selectPayment('cash')">
            <div class="payment-radio"></div>
            <i class="fas fa-dollar-sign payment-icon"></i>
            <div class="payment-info">
              <div class="payment-name">Pay by Cash/Bank Transfer (No Fee)</div>
            </div>
          </div>
          <div class="payment-option" onclick="selectPayment('card')">
            <div class="payment-radio"></div>
            <i class="far fa-credit-card payment-icon"></i>
            <div class="payment-info">
              <div class="payment-name">Pay by Card (+4% Fee)</div>
            </div>
            <div class="payment-cards">
              <img src="https://upload.wikimedia.org/wikipedia/commons/d/d6/Visa_2021.svg
" alt="Visa" style="height:16px;">
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/b7/MasterCard_Logo.svg" alt="Mastercard" style="height:16px;">
            </div>
          </div>
        </div>

        <div class="terms">
          <input type="checkbox" id="termsCheck">
          <label for="termsCheck">By proceeding, I agree to Starsky Line Limousine <a href="#">terms and conditions</a> and <a href="#">privacy policy</a>.</label>
        </div>

        <div class="buttons-row">
          <button class="btn-back" onclick="goBack()">BACK</button>
          <button class="btn-next" onclick="submitBooking()">NEXT</button>
        </div>
      </div>

      <div class="sidebar">
        <div class="sidebar-card">
          <div class="sidebar-title">One Way Trip</div>
          <div class="trip-point"><div class="trip-dot green"></div><div class="trip-text">${pickup}</div></div>
          <div class="trip-point"><div class="trip-dot red"></div><div class="trip-text">${dropoff}</div></div>
          <div class="trip-datetime">
            <div><label><i class="far fa-calendar"></i> Pickup Date</label><span>${date}</span></div>
            <div><label><i class="far fa-clock"></i> Pickup Time</label><span>${time}</span></div>
          </div>
        </div>

        ${
          type === "round_trip"
            ? `
        <div class="sidebar-card">
          <div class="sidebar-title">Return Ride Trip</div>
          <div class="trip-point"><div class="trip-dot green"></div><div class="trip-text">${dropoff}</div></div>
          <div class="trip-point"><div class="trip-dot red"></div><div class="trip-text">${pickup}</div></div>
          <div class="trip-datetime">
            <div><label><i class="far fa-calendar"></i> Pickup Date</label><span>${returnDate || date}</span></div>
            <div><label><i class="far fa-clock"></i> Pickup Time</label><span>${returnTime || time}</span></div>
          </div>
        </div>
        `
            : ""
        }

        <div class="sidebar-card">
          <div class="sidebar-title">Passenger Details</div>
          <div class="passenger-info">
            <div class="row"><label>Full Name</label><span>${fullName}</span></div>
            <div class="row"><label>Email</label><span>${email}</span></div>
            <div class="row"><label>Contact Number</label><span>${phone}</span></div>
            <div class="row"><label>WhatsApp Number</label><span>${whatsapp || phone}</span></div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    // Beautiful Toast Notification Function
    function showToast(message, type = 'error', title = '') {
      const container = document.getElementById('toastContainer');
      const toast = document.createElement('div');
      toast.className = 'toast ' + type;
      const icons = { error: 'fa-exclamation-circle', success: 'fa-check-circle', warning: 'fa-exclamation-triangle' };
      const titles = { error: 'Oops!', success: 'Success!', warning: 'Warning' };
      toast.innerHTML = '<div class="toast-icon"><i class="fas ' + icons[type] + '"></i></div><div class="toast-content"><div class="toast-title">' + (title || titles[type]) + '</div><div class="toast-message">' + message + '</div></div><button class="toast-close" onclick="this.parentElement.remove()">&times;</button>';
      container.appendChild(toast);
      setTimeout(() => { toast.style.animation = 'slideOut 0.3s ease forwards'; setTimeout(() => toast.remove(), 300); }, 4000);
    }

    const API_BASE = '${apiBase}';
    let selectedPayment = 'cash';
    let isSubmitting = false;
    
    const bookingData = {
      type: '${type}',
      pickup: '${pickup}',
      dropoff: '${dropoff}',
      date: '${date}',
      time: '${time}',
      returnDate: '${returnDate || ""}',
      returnTime: '${returnTime || ""}',
      vehicle: '${vehicle}',
      vehicleName: '${selectedVehicle.name}',
      vehicleImage: '${selectedVehicle.image}',
      passengers: ${selectedVehicle.passengers},
      suitcases: ${selectedVehicle.suitcases},
      fullName: '${fullName}',
      email: '${email}',
      phone: '${phone}',
      whatsapp: '${whatsapp || phone}',
      stopOnWay: ${stopOnWay === "true"},
      stopLocation: '${stopLocation || ""}',
      childSeats: ${parseInt(childSeats) || 0},
      seatCount: ${parseInt(seatCount) || 0},
      boosterCount: ${parseInt(boosterCount) || 0},
      infantCount: ${parseInt(infantCount) || 0},
      basePrice: ${basePrice},
      totalPrice: ${total}
    };
    
    function selectPayment(method) {
      selectedPayment = method;
      document.querySelectorAll('.payment-option').forEach(opt => opt.classList.remove('selected'));
      event.currentTarget.classList.add('selected');
    }
    
    function goBack() { window.history.back(); }
    
    async function submitBooking() {
      if (!document.getElementById('termsCheck').checked) {
        showToast('Please accept the terms and conditions before proceeding', 'warning', 'Terms Required');
        return;
      }
      
      if (isSubmitting) return;
      isSubmitting = true;
      
      const submitBtn = document.querySelector('.btn-next');
      submitBtn.textContent = 'SUBMITTING...';
      submitBtn.disabled = true;
      
      try {
        const response = await fetch(API_BASE + '/api/bookings/wordpress-booking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer_name: bookingData.fullName,
            customer_email: bookingData.email,
            customer_phone: bookingData.phone,
            customer_whatsapp: bookingData.whatsapp,
            pickup_location: bookingData.pickup,
            dropoff_location: bookingData.dropoff,
            pickup_date: bookingData.date,
            pickup_time: bookingData.time,
            return_date: bookingData.returnDate,
            return_time: bookingData.returnTime,
            vehicle_type: bookingData.vehicle,
            booking_type: bookingData.type,
            passengers_count: bookingData.passengers,
            luggage_count: bookingData.suitcases,
            payment_method: selectedPayment,
            fare_aed: bookingData.totalPrice,
            stop_on_way: bookingData.stopOnWay,
            stop_location: bookingData.stopLocation,
            child_seats: bookingData.childSeats,
            notes: 'Child Seats: ' + bookingData.childSeats + ' (Seat: ' + bookingData.seatCount + ', Booster: ' + bookingData.boosterCount + ', Infant: ' + bookingData.infantCount + ')'
          })
        });
        
        const result = await response.json();
        
        if (result.success) {
          const successParams = new URLSearchParams({
            bookingId: result.booking_id,
            ...bookingData,
            paymentMethod: selectedPayment
          });
          window.location.href = API_BASE + '/api/bookings/success?' + successParams.toString();
        } else {
          showToast(result.error || 'Failed to submit booking. Please try again.', 'error', 'Booking Failed');
          submitBtn.textContent = 'NEXT';
          submitBtn.disabled = false;
          isSubmitting = false;
        }
      } catch (error) {
        console.error('Booking error:', error);
        showToast('Network error. Please check your connection and try again.', 'error', 'Connection Error');
        submitBtn.textContent = 'NEXT';
        submitBtn.disabled = false;
        isSubmitting = false;
      }
    }
  </script>
</body>
</html>`;

      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.send(html);
    } catch (error) {
      console.error("Billing details error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to load billing details",
        message: error.message,
      });
    }
  },

  /**
   * Screen 5: Booking Success Page
   */
  async getSuccessPage(req, res, next) {
    try {
      const {
        bookingId,
        type,
        pickup,
        dropoff,
        date,
        time,
        returnDate,
        returnTime,
        vehicle,
        vehicleName,
        fullName,
        email,
        phone,
        whatsapp,
        totalPrice,
        paymentMethod,
      } = req.query;
      const protocol = req.get("x-forwarded-proto") || req.protocol || "https";
      const host = req.get("host") || "localhost:5000";
      const apiBase = `${protocol}://${host}`;

      const selectedVehicle =
        VEHICLES.find((v) => v.id === vehicle) || VEHICLES[0];

      const returnTripHtml =
        type === "round_trip"
          ? `
        <div class="sidebar-card">
          <div class="sidebar-title">Return Ride Trip</div>
          <div class="trip-point"><div class="trip-dot green"></div><div class="trip-text">${dropoff}</div></div>
          <div class="trip-point"><div class="trip-dot red"></div><div class="trip-text">${pickup}</div></div>
          <div class="trip-datetime">
            <div><label><i class="far fa-calendar"></i> Pickup Date</label><span>${returnDate || date}</span></div>
            <div><label><i class="far fa-clock"></i> Pickup Time</label><span>${returnTime || time}</span></div>
          </div>
        </div>`
          : "";

      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmed - Luxury Limo</title>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Montserrat', sans-serif; background: #f5f5f5; min-height: 100vh; color: #333; }
    .container { max-width: 1100px; margin: 0 auto; padding: 20px; }
    .main-layout { display: grid; grid-template-columns: 1fr 350px; gap: 25px; }
    .success-card { background: #fff; border-radius: 12px; padding: 40px; text-align: center; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
    .success-icon { width: 80px; height: 80px; background: #e8f5e9; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
    .success-icon i { font-size: 40px; color: #4caf50; }
    .success-title { font-size: 22px; font-weight: 600; color: #333; margin-bottom: 10px; }
    .success-subtitle { font-size: 14px; color: #666; margin-bottom: 20px; }
    .confirmation-note { display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 13px; color: #4caf50; margin-bottom: 30px; }
    .confirmation-note i { font-size: 16px; }
    .info-boxes { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px; }
    .info-box { background: #f0fdf4; border: 1px solid #c8e6c9; border-radius: 8px; padding: 15px; text-align: left; }
    .info-box i { color: #4caf50; margin-right: 8px; }
    .info-box-title { font-size: 12px; font-weight: 600; color: #333; margin-bottom: 5px; }
    .track-note { font-size: 12px; color: #666; margin-bottom: 15px; }
    .help-section { background: #1a8b6e; border-radius: 12px; padding: 25px; margin-top: 20px; display: flex; justify-content: space-between; align-items: center; }
    .help-left h3 { color: #fff; font-size: 18px; font-weight: 600; margin-bottom: 5px; }
    .help-left p { color: rgba(255,255,255,0.8); font-size: 13px; }
    .btn-contact { display: inline-flex; align-items: center; gap: 8px; padding: 12px 25px; background: #fff; color: #1a8b6e; border: none; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; text-decoration: none; font-family: 'Montserrat', sans-serif; }
    .btn-contact:hover { background: #f5f5f5; }
    .btn-contact i { font-size: 12px; }
    .sidebar { display: flex; flex-direction: column; gap: 15px; }
    .sidebar-card { background: #fff; border-radius: 8px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
    .sidebar-title { font-size: 14px; font-weight: 600; margin-bottom: 15px; color: #333; }
    .trip-point { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 8px; }
    .trip-dot { width: 10px; height: 10px; border-radius: 50%; margin-top: 4px; }
    .trip-dot.green { background: #4caf50; }
    .trip-dot.red { background: #f44336; }
    .trip-text { font-size: 12px; color: #333; line-height: 1.4; }
    .trip-datetime { display: flex; gap: 20px; margin-top: 12px; padding-top: 12px; border-top: 1px solid #eee; font-size: 11px; }
    .trip-datetime label { color: #999; display: flex; align-items: center; gap: 5px; margin-bottom: 3px; }
    .trip-datetime span { color: #333; font-weight: 500; }
    .passenger-info { font-size: 12px; }
    .passenger-info .row { display: flex; flex-direction: column; margin-bottom: 12px; }
    .passenger-info label { color: #999; font-size: 11px; margin-bottom: 3px; }
    .passenger-info span { color: #333; font-weight: 500; }
    .vehicle-card { border: 2px solid #ffc107; border-radius: 8px; overflow: hidden; }
    .vehicle-header { background: #ffc107; padding: 10px 15px; display: flex; justify-content: space-between; align-items: center; }
    .vehicle-header .name { font-size: 14px; font-weight: 600; }
    .vehicle-header .badge { font-size: 10px; color: #666; display: flex; align-items: center; gap: 4px; }
    .vehicle-body { padding: 15px; background: #fff; }
    .vehicle-specs { display: flex; gap: 15px; font-size: 11px; color: #666; margin-bottom: 10px; }
    .vehicle-specs span { display: flex; align-items: center; gap: 4px; }
    .vehicle-img { width: 100%; height: 60px; object-fit: contain; }
    .total-line { display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-top: 2px solid #eee; margin-top: 10px; }
    .total-label { font-size: 13px; font-weight: 500; color: #666; display: flex; align-items: center; gap: 5px; }
    .total-label .paid { color: #4caf50; }
    .total-amount { text-align: right; }
    .total-amount .currency { font-size: 10px; color: #999; }
    .total-amount .price { font-size: 20px; font-weight: 700; color: #333; }
    @media (max-width: 800px) {
      .main-layout { grid-template-columns: 1fr; }
      .info-boxes { grid-template-columns: 1fr; }
      .help-section { flex-direction: column; text-align: center; gap: 15px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="main-layout">
      <div>
        <div class="success-card">
          <div class="success-icon"><i class="fas fa-check"></i></div>
          <h1 class="success-title">Booking Submitted Successfully!</h1>
          <p class="success-subtitle">Our team is currently reviewing your booking request.</p>
          <div class="confirmation-note"><i class="fas fa-check-circle"></i> You will receive a confirmation email with your booking details shortly.</div>
          <div class="info-boxes">
            <div class="info-box">
              <div class="info-box-title"><i class="fas fa-info-circle"></i> You will receive the driver's details before your trip</div>
            </div>
            <div class="info-box">
              <div class="info-box-title"><i class="fas fa-envelope"></i> A confirmation email has been sent to the admin team.</div>
            </div>
          </div>
        </div>
        <div class="help-section">
          <div class="help-left">
            <h3>Need some help?</h3>
            <p>Our customer service team is available 24/7 to answer your queries!</p>
          </div>
          <a href="https://wa.me/971501234567" class="btn-contact">Contact Now <i class="fas fa-arrow-right"></i></a>
        </div>
      </div>
      <div class="sidebar">
        <div class="sidebar-card">
          <div class="sidebar-title">One Way Trip</div>
          <div class="trip-point"><div class="trip-dot green"></div><div class="trip-text">${pickup}</div></div>
          <div class="trip-point"><div class="trip-dot red"></div><div class="trip-text">${dropoff}</div></div>
          <div class="trip-datetime">
            <div><label><i class="far fa-calendar"></i> Pickup Date</label><span>${date}</span></div>
            <div><label><i class="far fa-clock"></i> Pickup Time</label><span>${time}</span></div>
          </div>
        </div>
        ${returnTripHtml}
        <div class="sidebar-card">
          <div class="sidebar-title">Passenger Details</div>
          <div class="passenger-info">
            <div class="row"><label>Full Name</label><span>${fullName}</span></div>
            <div class="row"><label>Email</label><span>${email}</span></div>
            <div class="row"><label>Contact Number</label><span>${phone}</span></div>
            <div class="row"><label>WhatsApp Number</label><span>${whatsapp || phone}</span></div>
          </div>
        </div>
        <div class="sidebar-card">
          <div class="vehicle-card">
            <div class="vehicle-header">
              <span class="name">${selectedVehicle.name}</span>
              <span class="badge"><i class="far fa-clock"></i> Free Waiting Time</span>
            </div>
            <div class="vehicle-body">
              <div class="vehicle-specs">
                <span><i class="fas fa-users"></i> Up to ${selectedVehicle.passengers} Passengers</span>
                <span><i class="fas fa-suitcase"></i> Up to ${selectedVehicle.suitcases} Luggages</span>
              </div>
              <img src="${selectedVehicle.image}" alt="${selectedVehicle.name}" class="vehicle-img">
            </div>
          </div>
          <div class="total-line">
            <div class="total-label"><i class="fas fa-check-circle paid"></i> Paid Amount</div>
            <div class="total-amount">
              <span class="currency">AED</span>
              <span class="price">${parseFloat(totalPrice || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.send(html);
    } catch (error) {
      console.error("Success page error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to load success page",
        message: error.message,
      });
    }
  },
};

module.exports = formController;
