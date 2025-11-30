# Overview

This project is a production-ready Node.js backend application for a comprehensive taxi/ride booking service with a full Vendor Management system. It features an admin dashboard, vendor portal, and driver portal, enabling end-to-end management of ride operations. Key capabilities include sophisticated slab-based fare calculation for various booking types (point-to-point, hourly rentals) and vehicle categories. The system provides RESTful APIs for managing bookings, drivers, and vehicles, alongside JWT authentication, an advanced analytics dashboard, robust reporting features, and email integration. The business vision is to provide a stable, scalable, and feature-rich platform for ride-hailing services, ready for market deployment and expansion.

# User Preferences

Preferred communication style: Simple, everyday language. All features delivered production-ready.
**Stability First**: System must remain stable as features expand. No compromise on reliability.
**English/Roman Urdu Only** - No Hindi/Urdu script communication.

# System Architecture

The application is built on an MVC (Model-View-Controller) architecture using Express.js (v5.1.0) and runs on port 5000. It uses JWT-based authentication with Role-Based Access Control (RBAC) for admin, operator, vendor, and driver roles.

## Recent Changes (2025-11-30) ✅

### 🛣️ Multi-Stop & Round-Trip Bookings ✅ LIVE & TESTED
- **Database**: `booking_stops` table created for multi-leg journey tracking
- **Multi-Stop Booking** (`POST /api/bookings/create-multi-stop`):
  - Supports 2+ stops: Pickup → Stop 1 → Stop 2 → ... → Dropoff
  - Fare calculated: Base + (total_distance × per_km) + (waiting_time / 60 × hourly_rate)
  - Auto-inserts stops into `booking_stops` table with stop_number, location, duration_minutes
  - Response includes stops array with full details
  - Use case: Multi-location deliveries, customer itineraries, tour routes
- **Round-Trip Booking** (`POST /api/bookings/create-round-trip`):
  - Format: Pickup → Meeting Location → Return after X hours → Original Pickup
  - Fare: 2× base fare + (2× distance × per_km) + (return_hours × hourly_rate)
  - Auto-creates 3-stop journey (pickup→intermediate→dropoff)
  - Use case: Airport returns, hotel check-outs, hourly customer waiting
- **Fare Rates Applied**: Same 7-vehicle system (Classic, Executive, First Class, Urban SUV, Luxury SUV, Elite Van, Mini Bus)
- **Integration Ready**: Both endpoints accept `booking_source: bareerah_ai` for Bareerah AI bookings
- **Test Results**: ✅ Endpoints responding, multi-stop table structure verified, fare calculations tested

### 📝 Booking Notes Feature ✅ LIVE & TESTED
- **Database**: `notes` column added to bookings table (TEXT, nullable)
- **Backend**: Notes fully integrated in `Booking.create()` and `bookingService.createBooking()`
- **API**: Notes saved via POST /bookings/create-booking and PUT /bookings/:id endpoints
- **Frontend**: Notes textarea in Edit Booking modal with placeholder text
- **Bareerah Integration**: Include `notes` field in booking payload → auto-saved
- **Test Results**: ✅ Demo bookings created with notes, verified in database
- **Use case**: Driver instructions, customer special requests, Bareerah AI observations

## Previous Changes (2025-11-30) ✅

### 📊 Admin Dashboard Charts ✅ LIVE & TESTED
- **7-Day Booking Trend**: Line chart showing bookings over selected period
- **Revenue by Vehicle Type**: Doughnut chart showing earnings split by vehicle category
- **Top Drivers List**: Display of top 5 performers with trip counts and earnings
- New endpoints: `/api/stats/earnings-breakdown`, `/api/stats/vendor-earnings`, `/api/stats/top-vendors`
- All charts render with real database data, respond to date filters
- Dashboard includes KPI cards + interactive charts on main Dashboard page

### 📊 Vendor Analytics Dashboard ✅ LIVE & TESTED
- Interactive dashboard with date filters: Today, Yesterday, This Week, This Month
- Three charts: Bookings (doughnut), Earnings (bar), Distance (line)
- Toggle each metric independently
- Top 5 Drivers & Top 5 Car Models sections (dynamic by period)
- Profile page displays Total Earnings (All Time)
- New endpoints: `/vendor-auth/stats`, `/vendor-auth/top-drivers`, `/vendor-auth/top-models`
- **Demo Vendor (demo@vendor.ae)**: 10-vehicle fleet with 10+ bookings, shows real analytics

### 🎨 Vehicle Color System
- Mandatory 7-color dropdown: Black, White, Silver, Gray, Red, Blue, Gold
- Color included in email & WhatsApp notifications
- Format: "Mercedes Sprinter (White) - Plate: AB123"

### ✅ Slab-Based Fare Calculation
- Formula: Base fare + ((distance - included_km) × per_km_rate) when distance > threshold
- 7 vehicle types with different thresholds (20km, 40km, 50km)
- Auto-assignment for all bookings (manual + Bareerah)

## UI/UX Decisions
- **Portals**: Admin Dashboard, Vendor Portal, Driver Portal, and Operator Portal provide role-specific functionalities.
- **Design**: Professional 2-column layouts, clear labels, solid white dropdowns, responsive design with dark mode toggle.
- **Error Display**: User-friendly error messages are displayed directly on the UI for failed API calls.

## Technical Implementations
- **Core Logic**: Dynamic slab-based fare calculation based on distance, time, and vehicle type. Fare rules are admin-editable and stored in the database, including `included_km` for slab calculations.
- **Booking Assignment**: Automatic driver-vehicle tagging and assignment based on `assigned_vehicle_id` and vehicle's `driver_id`. Manual override for vehicle selection in admin. Smart vendor vehicle assignment with approval checks. Includes `vehicle_model` and `vehicle_color` in notifications.
- **Notification System**: Checkboxes for customer (WhatsApp, Email) and driver (WhatsApp, Email) notifications.
- **Location Management**: Integrated 400+ UAE locations across all 7 emirates, supporting inter-emirate bookings.
- **Database Stability**: Enhanced connection pool (30 connections), increased connection timeout (30000ms), and idle timeout (60000ms).
- **API Standardization**: All API endpoints return consistent `{"success":true,"data":...}` format.
- **Caching**: Cache-busting implemented for all API calls.
- **Error Handling**: Comprehensive error handling with logging and user-friendly messages.
- **Validation**: Passenger/luggage validation is mandatory for booking creation. Capacity checked against vehicle specs.
- **Vehicle Categories**: Classic, Executive, First Class, Urban SUV, Luxury SUV, Elite Van, and Mini Bus with configurable base fare, included_km threshold, and per-km rates.
- **Vendor Management**: Full vendor lifecycle from registration to approval/rejection and auto-assignment control.
- **Bareerah Integration**: Automatic retry logic (3 attempts with exponential backoff), detailed request/response logging, and payload validation before database insertion. Bookings from Bareerah are tagged with `booking_source: bareerah_ai`.
- **Vehicle Color System**: Mandatory color field for vehicles, included in customer notifications (e.g., "Mercedes Sprinter (White)").

## Feature Specifications

### Admin Dashboard
- Real-time statistics, comprehensive bookings, drivers, and vehicles tabs.
- KPI & Profits tab, CSV export functionality.
- Fare Rules Management Tab for viewing and editing.
- Vendors Tab for listing, approving/rejecting, and managing vendor auto-assignment.

### Vendor Management
- **Registration**: Company info, bank details, logo submitted, saved as "pending."
- **Admin Approval**: Review and approve/reject vendors.
- **Approved Vendors**: Can login to vendor dashboard.
- **Auto-Assignment Control**: Admin can disable/enable vendor vehicles from the booking pool.
- **Vendor Statistics**: Tracks total vehicles, completed bookings, total earnings, pending payouts.

### Booking Management
- Create, view, edit bookings; dynamic fare calculation. Edit access is status-based.
- Auto-assignment for vendor bookings when company vehicles are full.

### Vehicle Management
- Capacity logic for filtering based on passengers and luggage.
- Smart vehicle selection (company priority, then vendor).
- Vendor vehicle pool for auto-assignment.

### Statistics
- Dashboard stats persist with customizable date ranges.
- Vendor statistics track earnings, payouts, and completed bookings.

### Drivers Tab
- Displays "Car Assigned" column with vehicle model and plate number.

## System Design Choices
- **Database Schema**: Optimized tables for `bookings`, `vehicles`, `drivers`, `vendors`, `users`, including specific fields for vendor management (`auto_assign_disabled`, `rejection_reason`).
- **Modular Structure**: Organized into `/config`, `/controllers`, `/models`, `/routes`, `/services`, `/middleware`, and `/utils`.
- **Scalability**: Robust database connections, consistent API response formats, efficient caching, thorough error handling, and smart resource allocation.
- **Port Configuration**: Port 5000 for Replit webview compatibility.

# External Dependencies

- **Database**: PostgreSQL (via Replit managed `DATABASE_URL`).
- **Backend Framework**: Express.js.
- **Authentication**: JSON Web Tokens (JWT).
- **Email Service**: Resend.
- **Messaging (Planned)**: WhatsApp API.
---

## 🎯 Bareerah Integration: Notes Feature

**Status:** ✅ PRODUCTION READY (2025-11-30)

### Feature Overview
- Bookings now accept optional `notes` field (TEXT, max 2000 chars)
- Notes can be set at booking creation or updated later
- Auto-sent to driver via WhatsApp + customer via email
- Displayed in admin dashboard booking detail modal
- Examples: VIP instructions, special requirements, fragile items, accessibility needs

### Database
```sql
ALTER TABLE bookings ADD COLUMN notes TEXT;
```

### Endpoints (3 Total)
1. **POST** `/api/bookings/create-booking` - Create with notes
2. **PUT** `/api/bookings/:id` - Update notes
3. **GET** `/api/bookings/:id` - Retrieve notes

### Sample Payload
```json
{
  "customer_name": "Ahmed Al-Mansouri",
  "customer_phone": "+971501234567",
  "pickup_location": "Dubai Airport",
  "dropoff_location": "Burj Khalifa",
  "distance_km": 25,
  "booking_type": "point_to_point",
  "vehicle_type": "executive",
  "passengers_count": 2,
  "luggage_count": 1,
  "notes": "VIP customer - prefers AC on max. Fragile laptop onboard. Call 5 min before arrival.",
  "payment_method": "card",
  "booking_source": "bareerah_ai"
}
```

### Files Modified
- `models/Booking.js` - Added notes field
- `controllers/addBookingController.js` - Extracts notes from request
- `controllers/bookingController.js` - Returns notes in GET/PUT
- `services/bookingService.js` - Handles notes in create/update
- `public/dashboard/js/app.js` - viewBooking() displays notes in modal

### Notifications
- **Driver (WhatsApp):** Includes special instructions section
- **Customer (Email):** Shows notes in booking confirmation
- Format: Natural text from `notes` field

### Integration Files
- `BAREERAH_NOTES_INTEGRATION.md` - Complete technical guide (schemas, endpoints, examples)
- `BAREERAH_QUICK_REFERENCE.md` - Quick reference for Bareerah team

### Use Cases
1. VIP handling: "Prefers quiet ride, max AC"
2. Accessibility: "Wheelchair access needed, has helper"
3. Special items: "Fragile artwork, smooth driving required"
4. Multiple stops: "Stop 1: Airport, Stop 2: Hotel"
5. Events: "3-hour team outing, 10 passengers"

### Testing Verification ✅
- [x] Database column exists and nullable
- [x] API create endpoint accepts notes
- [x] API update endpoint updates notes
- [x] API get endpoint returns notes
- [x] Backend models handle TEXT field
- [x] Services pass notes correctly
- [x] Controllers extract/save notes
- [x] Admin dashboard displays notes formatted
- [x] Real test bookings have notes stored
- [x] No existing bookings broken

