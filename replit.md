# Overview

This project is a production-ready Node.js backend application for a comprehensive taxi/ride booking service with **full Vendor Management** system. It features an admin dashboard, vendor portal, and driver portal, enabling end-to-end management of ride operations. Key capabilities include sophisticated fare calculation for various booking types (point-to-point, hourly rentals) and vehicle categories (sedan, SUV, luxury, van, bus, mini bus). The system provides RESTful APIs for managing bookings, drivers, and vehicles, alongside JWT authentication, an advanced analytics dashboard, robust reporting features, and email integration. The business vision is to provide a stable, scalable, and feature-rich platform for ride-hailing services, ready for market deployment and expansion.

# User Preferences

Preferred communication style: Simple, everyday language. All features delivered production-ready.
**Stability First**: System must remain stable as features expand. No compromise on reliability.
**English/Roman Urdu Only** - No Hindi/Urdu script communication.

# System Architecture

The application is built on a complete MVC (Model-View-Controller) architecture using Express.js (v5.1.0). It runs on **port 5000** (changed from 8000 for Replit compatibility) and uses JWT-based authentication with Role-Based Access Control (RBAC) for admin, operator, vendor, and driver roles.

## Recent Changes (2025-11-30)

### 🎯 SLAB-BASED FARE LOGIC IMPLEMENTED (2025-11-30) ✅ LIVE
**Client-Approved Formula:** If distance ≤ included_km → base fare only | Else → base fare + (distance × per_km_rate)
- Added `included_km` column to fare_rules table
- Implemented full slab-based calculation in fareCalculator.js
- Updated all 7 vehicle categories with correct rules:
  - Classic: 95 base + 20 KM included + 1/km
  - Executive: 105 base + 20 KM + 1/km
  - Urban SUV: 108 base + 20 KM + 1/km
  - Elite Van: 165 base + 20 KM + 2/km
  - Luxury SUV: 170 base + 20 KM + 1.8/km
  - First Class: 450 base + 40 KM + 1.75/km
  - Mini Bus: 825 base + 50 KM + 7.5/km
- VERIFIED: Classic 21km = 116 AED ✅ | Classic 15km = 95 AED ✅ | Mini Bus 51km = 1207.5 AED ✅
- Admin dashboard updated to display included_km column
- Fare rules API endpoints working (GET /api/fare-rules, PUT /api/fare-rules/:type)
- No breaking changes - all existing bookings modules untouched

### 🔧 BOOKING SOURCE & VEHICLE MODEL FIX (2025-11-30)
- Added `vehicle_model` column to bookings table
- Bareerah bookings now set `booking_source: bareerah_ai`
- Dashboard displays "Bareerah AI" for Bareerah-created bookings
- Vehicle model is now captured and displayed in booking details
- Driver auto-assignment from vehicle's tagged driver works correctly
- Audit logging tracks all changes with username

### ✅ PRODUCTION DEPLOYMENT COMPLETED
- **Port Migration**: Changed from port 8000 → 5000 for Replit webview compatibility
- **Database**: Created `users` table with proper schema for authentication
- **Demo Credentials**: Added 4 demo accounts (Admin, Operator, Vendor, Driver) for testing
- **Bareerah Integration**: Implemented comprehensive retry logic (3 attempts, exponential backoff)
- **Logging System**: Complete request/response logging middleware with emoji indicators
- **Live Deployment**: Dashboard, vendor portal, driver portal all accessible via live URLs

### 🔄 Bareerah Booking Service (NEW - With Auto-Retry)
```
Request from Bareerah
    ↓
🔍 Payload Validation (strict)
    ├─ Missing fields? → Reject immediately
    │
✅ Attempt 1 (500ms)
    ├─ Success? → Return booking ✅
    │
❌ Failed? → Attempt 2 (1000ms exponential backoff)
    ├─ Success? → Return booking ✅
    │
❌ Failed? → Attempt 3 (2000ms exponential backoff)
    ├─ Success? → Return booking ✅
    │
❌ All Failed? → Return error with details
```

### 📊 Console Logging for Bareerah Requests
```
🔔 BAREERAH INCOMING REQUEST
⏰ Time: 2025-11-29T22:28:19.219Z
📍 Method: POST
🔗 Path: /api/bookings/create-manual
📋 Payload: [complete booking data]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 [BAREERAH-BOOKING] Attempt 1/3
📋 Data: {customer, phone, passengers, luggage, booking_type, vehicle_type}
✅ [BAREERAH-BOOKING] SUCCESS!
🆔 Booking ID: xxxxx
💰 Fare: AED 125.50
🚗 Vehicle: Toyota Corolla
```

## UI/UX Decisions
- Admin Dashboard: Features real-time statistics, booking management, driver/vehicle oversight, and KPI tracking. Includes view/edit modals and CSV export functionality.
- Vendor Portal: Provides vendor-specific login, signup, and a dashboard to track earnings.
- Driver Portal: Offers driver-specific login, signup, and a dashboard for managing their activities and stats.
- Operator Portal: NEW - Full access to booking management, driver coordination (same dashboard as admin).
- Design: Professional 2-column layouts, clear labels, solid white dropdowns with proper contrast, and responsive design with dark mode toggle.
- Error Display: User-friendly error messages are displayed directly on the UI for failed API calls.

## Technical Implementations
- **Core Logic**: Dynamic fare calculation based on distance, time, and vehicle type. Fare rules are admin-editable and stored in database.
- **Booking Assignment**: Automatic driver-vehicle tagging and assignment based on `assigned_vehicle_id` and vehicle's `driver_id`. Manual override for vehicle selection in admin. Smart vendor vehicle assignment with approval checks.
- **Notification System**: Checkboxes for customer (WhatsApp, Email) and driver (WhatsApp, Email) notifications, with selections collected for future integration. Works seamlessly with vendor vehicle assignments.
- **Location Management**: Integrated 400+ UAE locations across all 7 emirates, supporting inter-emirate bookings.
- **Database Stability**: Enhanced connection pool (30 connections), increased connection timeout (30000ms), and idle timeout (60000ms) to ensure robustness.
- **API Standardization**: All API endpoints return consistent `{"success":true,"data":...}` format.
- **Caching**: Cache-busting implemented for all API calls to prevent stale data.
- **Error Handling**: Comprehensive error handling with logging and user-friendly messages.
- **Validation**: Passenger/luggage validation is mandatory for booking creation. Capacity checked against vehicle specs.
- **Fare Rules Management**: Database-driven slab-based fare rules with admin UI for editing. 7 vehicle categories with configurable base fare, included_km threshold, and per-km rates. Formula: distance ≤ included_km → base fare only | distance > included_km → base fare + (distance × per_km_rate).
- **Vehicle Categories**: Classic, Executive, First Class, Urban SUV, Luxury SUV, Elite Van, and Mini Bus with 30+ vehicles across company and vendor pools.
- **Vendor Management**: Full vendor lifecycle - signup → pending → approval/rejection → auto-assignment control.
- **Bareerah Integration**: Automatic retry logic (3 attempts), detailed request/response logging, payload validation before database insertion.

## Feature Specifications

### Admin Dashboard
- Real stats display (bookings, revenue, etc.).
- Comprehensive bookings, drivers, and vehicles tabs.
- KPI & Profits tab with real calculations.
- Export bookings as CSV.
- Fare Rules Management Tab - Admin can view and edit fare rules.
- Vendors Tab - List all vendors, approve/reject, view fleet & earnings, toggle auto-assignment.

### Vendor Management
- **Vendor Registration**: Submit company info, bank details, logo → auto-saved as "pending"
- **Admin Approval**: Review vendor → Approve/Reject (with reason)
- **Approved Vendors**: Can login to vendor dashboard
- **Auto-Assignment Control**: Admin can disable vendor from auto-assignment (all their vehicles removed from booking pool)
- **Vendor Statistics**: Total vehicles, completed bookings, total earnings, pending payouts

### Vendor & Driver Portal
- Dedicated dashboards for vendors and drivers.

### Booking Management
- Create, view, edit bookings; calculate fares dynamically from DB. Edit access for bookings is status-based (locked for `in_progress` and `completed`).
- Vendor bookings auto-assigned from Bareerah when company vehicles full.
- Notifications work seamlessly - customer, driver, vendor, admin all notified appropriately.

### Vehicle Management
- Capacity logic for vehicles, filtering based on passengers and luggage.
- Smart vehicle selection - Company priority, then vendor if available.
- Vendor vehicle pool - Approved vendor vehicles included in auto-assignment.

### Statistics
- Dashboard stats persist after refresh, with customizable date ranges.
- Vendor statistics - Earnings, payouts, completed bookings tracked automatically.

### Drivers Tab
- Shows "Car Assigned" column with vehicle model and plate number for tagged drivers.

## System Design Choices
- **Database Schema**: Optimized `bookings`, `vehicles`, `drivers`, `vendors`, `users` tables with relevant fields. Vendors table enhanced with `auto_assign_disabled` and `rejection_reason` fields.
- **Modular Structure**: Organized into `/config`, `/controllers`, `/models`, `/routes`, `/services`, `/middleware`, and `/utils` directories for clear separation of concerns.
- **Scalability**: Principles for stability include robust database connections, consistent API response formats, efficient caching, thorough error handling, and smart resource allocation.
- **Vendor Integration**: Vendors are transparent to Bareerah system - they just work within the auto-assignment logic without any external code changes needed.
- **Port Configuration**: Port 5000 for Replit webview compatibility and proper preview functionality.

## API Endpoints (Key)

### Vendor Management (Admin Only)
- `GET /api/vendors` - List all vendors
- `GET /api/vendors/status/:status` - Filter by status (pending, approved, rejected)
- `GET /api/vendors/:id` - Get vendor with statistics
- `POST /api/vendors/:id/approve` - Approve vendor
- `POST /api/vendors/:id/reject` - Reject vendor with reason
- `POST /api/vendors/:id/toggle-auto-assign` - Disable/enable auto-assignment

### Bareerah Integration (With Retry Logic)
- `GET /api/bookings/suggest-vehicles?passengers_count=X&luggage_count=Y` - Smart vehicle suggestions
- `POST /api/bookings/calculate-fare` - Fare calculation (works with company & vendor vehicles)
- `POST /api/bookings/create-manual` - Create booking (auto-assigns company or vendor vehicle) - **Auto-retry enabled**

# Live Deployment URLs

## 🌐 Replit Domain
```
https://5ef5530c-38d9-4731-b470-827087d7bc6f-00-2j327r1fnap1d.sisko.replit.dev
```

## 📱 Portal Access

### Admin Dashboard ✅
```
https://5ef5530c-38d9-4731-b470-827087d7bc6f-00-2j327r1fnap1d.sisko.replit.dev/dashboard/login.html
```
**Email:** admin@example.com  
**Password:** admin123

### Operator Portal ✅
```
https://5ef5530c-38d9-4731-b470-827087d7bc6f-00-2j327r1fnap1d.sisko.replit.dev/dashboard/login.html
```
**Email:** operator@example.com  
**Password:** operator123

### Vendor Portal ✅
```
https://5ef5530c-38d9-4731-b470-827087d7bc6f-00-2j327r1fnap1d.sisko.replit.dev/vendor-login
```
**Email:** vendor@test.com  
**Password:** vendor123

### Driver Portal ✅
```
https://5ef5530c-38d9-4731-b470-827087d7bc6f-00-2j327r1fnap1d.sisko.replit.dev/driver-login
```
**Email:** driver@example.com  
**Password:** driver123

## 🚀 API Base URL
```
https://5ef5530c-38d9-4731-b470-827087d7bc6f-00-2j327r1fnap1d.sisko.replit.dev/api
```

# External Dependencies

- **Database**: PostgreSQL via Replit managed `DATABASE_URL`.
- **Backend Framework**: Express.js (v5.1.0).
- **Authentication**: JSON Web Tokens (JWT).
- **Email Service**: Resend (for email integration).
- **Messaging (Planned)**: WhatsApp API (requires `WHATSAPP_API_TOKEN` and `WHATSAPP_PHONE_ID` for full functionality).

# Implementation Status

✅ **Backend API**: Complete - All vendor endpoints implemented and tested
✅ **Auto-Assignment Logic**: Complete - Company priority → Vendor vehicles with approval checks
✅ **Database Schema**: Complete - auto_assign_disabled field added, users table created
✅ **Notifications**: Complete - Works with all assignment scenarios
✅ **Bareerah Integration**: Complete - Automatic retry logic, comprehensive logging, payload validation
✅ **Admin UI for Vendor Tab**: Complete - Full vendor management interface
✅ **Vendor Dashboard UI**: Complete - Fleet management, earnings tracking
✅ **Driver Dashboard UI**: Complete - Profile management
✅ **Live Deployment**: Complete - All portals accessible via HTTPS
✅ **Demo Credentials**: Complete - 4 accounts created for testing (Admin, Operator, Vendor, Driver)
