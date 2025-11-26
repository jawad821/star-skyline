# Overview

This is a Node.js backend application for a taxi/ride booking service with a production-ready admin dashboard. The system provides fare calculation capabilities for different booking types (point-to-point and hourly rentals) across various vehicle categories (sedan, SUV, luxury, van, bus, mini bus). The application exposes RESTful APIs for managing bookings, calculating fares based on distance/time/vehicle type, and includes JWT authentication, advanced analytics dashboard, reporting capabilities, Resend email integration, complete driver/vehicle management system, and **NEW: Full Vendor & Driver Portal System**.

# User Preferences

Preferred communication style: Simple, everyday language. All features delivered production-ready.

# Recent Changes - COMPLETE SYSTEM (Final Build)

## LATEST: Google Maps & Booking Form Fixes (November 26, 2025 - Final Build)
- ✅ Fixed Google Maps Autocomplete for location picking (pickup & dropoff)
- ✅ Auto-distance calculation from Google Maps Distance Matrix API
- ✅ Driver dropdown loading fixed - shows all available drivers
- ✅ Driver selection toggle working (Auto-assign or Choose Driver)
- ✅ Automatic fare calculation when distance updates
- ✅ All booking form validations working
- ✅ Car model selection required in form
- ✅ Complete booking creation workflow tested

## Vendor & Driver Portal System (Complete - November 26, 2025)
- ✅ Vendor registration (pending approval) with bank details
- ✅ Vendor login & dashboard with earnings/payouts/vehicles
- ✅ Individual driver registration with full profile
- ✅ Driver login & dashboard with ride stats
- ✅ Admin approval system for vendors and drivers
- ✅ Vendors tab in admin showing fleet details
- ✅ Driver approvals tab in admin
- ✅ All 16 demo drivers with avatar images
- ✅ Payout tracking for vendors
- ✅ Driver ratings aggregation

# System Architecture

## Complete MVC Architecture
```
/config              - Database and environment configuration
/controllers         
  - bookingController.js (with Google Maps support)
  - vehicleController.js
  - driverController.js (with avatar images)
  - ratingController.js
  - vendorAuthController.js (NEW - vendor login/signup)
  - driverAuthController.js (NEW - driver login/signup)
  - vendorManagementController.js (NEW - admin approvals)
  - statsController.js, pushController.js
/models              - Data access layer
  - Booking.js, Vehicle.js, Driver.js, Stats.js, etc.
/routes              
  - bookingRoutes.js (with Google Maps endpoints)
  - vehicleRoutes.js
  - driverRoutes.js
  - vendorAuthRoutes.js (NEW)
  - driverAuthRoutes.js (NEW)
  - vendorManagementRoutes.js (NEW)
/services            - Business logic layer
/middleware          - Error handling, auth, RBAC
/utils               
  - fareCalculator.js
  - emailService.js (Resend API)
  - emailTemplates.js
  - ratingTemplate.js
  - ratingScheduler.js
  - logger.js
/public/
  - dashboard/ - Admin dashboard
  - vendor-*.html - Vendor portal pages
  - driver-*.html - Driver portal pages
```

## Frontend Pages

### Admin Dashboard (`/dashboard`)
- 📊 Dashboard with analytics
- 👥 Drivers management with ratings & licenses
- 🚗 Vehicles management with colors & images
- 📅 Bookings with detail modals & driver assignment
- 💰 Fare rules configuration
- 👥 **Vendors Tab** - View vendor fleet & earnings
- ✅ **Driver Approvals Tab** - Approve/reject drivers
- ➕ Add Booking modal with Google Maps integration

### Vendor Portal
- `/vendor-login.html` - Vendor login
- `/vendor-signup.html` - Vendor registration (requires approval)
- `/vendor-dashboard.html` - Vendor dashboard
  - Overview: Total bookings, earnings, pending payouts, vehicle count
  - My Vehicles: View and manage vehicles
  - My Drivers: View and manage drivers
  - Profile & Bank: Update bank details

### Driver Portal
- `/driver-login.html` - Driver login
- `/driver-signup.html` - Driver registration (requires approval)
- `/driver-dashboard.html` - Driver dashboard
  - Overview: Completed rides, average rating, license status
  - My Vehicle: Add/manage single vehicle
  - Earnings: View ride earnings
  - Profile: View profile details

## Backend Framework
- **Technology**: Express.js (v5.1.0)
- **Server**: Runs on port 8000, bound to 0.0.0.0
- **Authentication**: JWT-based with RBAC (admin/operator/vendor/driver roles)

## Database Schema Updates (Complete)
- **vendors**: Added status (pending/approved/rejected), bank_account_number, bank_name, account_holder_name, logo_url, approval_reason
- **drivers**: Added image_url, email, password_hash, bank_account_number, bank_name, account_holder_name, driver_registration_status, national_id, date_of_birth
- **vehicles**: Added vendor_id (FK)
- **payouts** (NEW): Tracks vendor payments with id, vendor_id, amount_aed, status, payment_date
- **driver_ratings**: booking_id, driver_rating, trip_rating, customer_feedback

## API Endpoints (Complete)

### Vendor Auth Routes (`/api/vendor-auth`)
- POST `/signup` - Register vendor (pending approval)
- POST `/login` - Vendor login
- GET `/profile` - Get vendor dashboard
- PUT `/profile` - Update bank details

### Driver Auth Routes (`/api/driver-auth`)
- POST `/signup` - Register driver (pending approval)
- POST `/login` - Driver login
- GET `/profile` - Get driver dashboard

### Vendor Management Routes (`/api/vendor-management`)
- GET `/pending-vendors` - List pending vendor requests (admin only)
- POST `/approve-vendor/:id` - Approve vendor (admin only)
- POST `/reject-vendor/:id` - Reject vendor (admin only)
- GET `/fleet/:vendorId` - View vendor's fleet & vehicles
- GET `/earnings/:vendorId` - Get vendor earnings/payouts
- GET `/pending-drivers` - List pending driver requests (admin only)
- POST `/approve-driver/:id` - Approve driver (admin only)
- POST `/reject-driver/:id` - Reject driver (admin only)

### Booking Routes (Enhanced)
- POST `/create-manual` - Create booking with car_model & driver_id
- POST `/calculate-fare` - Calculate fare based on distance/type
- GET `/assign-driver` - Assign driver to booking
- POST `/resend-notifications` - Resend booking email

### Driver Routes (Enhanced)
- GET `/` - List all drivers
- GET `/available` - Get drivers for booking assignment
- GET `/:id` - Get driver details with ratings
- PUT `/:id` - Update driver (license, image, auto-assign)

### Vehicle Routes
- GET `/` - List all vehicles with optional type filter
- GET `/:id` - Get vehicle by ID
- POST `/` - Create new vehicle
- PUT `/:id` - Edit vehicle (color, status, image)

## Google Maps Integration
- **Pickup Location Autocomplete** - Select locations with Google Maps Places API
- **Dropoff Location Autocomplete** - Select destinations
- **Distance Matrix API** - Auto-calculate distance in km
- **Auto Fare Calculation** - Fare updates when distance changes
- **Country Restriction** - Limited to UAE (ae)

## Booking Creation Features
- ✅ Google Maps location picking for pickup & dropoff
- ✅ Auto distance calculation from coordinates
- ✅ Auto fare calculation based on distance/vehicle/type
- ✅ Car model selection (required)
- ✅ Auto-assign option or manual driver selection
- ✅ All required fields validation
- ✅ Confirmation email to customer

## Email System (Resend Integration)
- Customer booking confirmation with vehicle/driver details
- Admin booking alerts with profit breakdown
- Rating request emails 2 minutes after booking completion
- Vendor registration confirmation/rejection
- Driver registration approval/rejection

## Rating System
- Automatic email 2 minutes after booking completes
- Requests driver rating (1-5) and trip rating (1-5)
- Collects customer feedback
- Driver average rating aggregated and displayed
- Ratings visible in driver view modal

## Demo Data Ready
- ✅ 16 drivers with complete profiles, licenses, and avatar images
- ✅ 30+ ratings with feedback
- ✅ 100+ sample bookings
- ✅ 6 vehicle types with models and colors
- ✅ 2 vendors (approved with bank details)
- ✅ All configured and tested

## External Dependencies

### Core
- **express** (v5.1.0) - Web framework
- **pg** (v8.16.3) - PostgreSQL client
- **jsonwebtoken** - JWT authentication
- **bcryptjs** - Password hashing

### APIs
- **Google Maps** - Places Autocomplete & Distance Matrix
- **Resend** - Email service

## Login Credentials

### Admin Panel
- Email: admin@bareerah.com / Password: admin123
- Role: Full access to all features

### Operator Panel
- Email: operator@bareerah.com / Password: operator123
- Role: Limited booking & vehicle access

### Demo Vendor (After Signup & Admin Approval)
- Go to `/vendor-signup.html` to register
- Wait for admin approval in Vendors tab
- Login at `/vendor-login.html`

### Demo Driver (After Signup & Admin Approval)
- Go to `/driver-signup.html` to register
- Wait for admin approval in Driver Approvals tab
- Login at `/driver-login.html`

## Testing Workflow

1. **Admin Dashboard**: `/dashboard`
   - Login with admin/admin123
   - View Vendors and Drivers tabs
   - Create test booking with ➕ Add Booking

2. **Google Maps Test**: 
   - Click ➕ Add Booking
   - Type "Dubai Mall" in Pickup location
   - Select from suggestions
   - Type "Abu Dhabi" in Dropoff
   - Distance auto-calculates
   - Fare auto-updates

3. **Driver Assignment**:
   - In booking form, choose "Choose Driver"
   - Driver dropdown loads with all available drivers
   - Select a driver from list

4. **Vendor Portal**:
   - Go to `/vendor-signup.html`
   - Fill all fields and submit
   - Switch to admin, approve vendor in Vendors tab
   - Login at `/vendor-login.html`
   - View fleet and earnings

5. **Driver Portal**:
   - Go to `/driver-signup.html`
   - Fill all required fields
   - Switch to admin, approve in Driver Approvals tab
   - Login at `/driver-login.html`
   - View profile and manage vehicle

# Completed Features Checklist
- ✅ JWT authentication with RBAC
- ✅ Complete booking management
- ✅ Vehicle management (6 types)
- ✅ Driver management with licenses & ratings
- ✅ Fare calculation (point-to-point, hourly, capacity)
- ✅ Analytics dashboard
- ✅ Resend email integration
- ✅ Car color field & image upload
- ✅ Car edit modal
- ✅ Car filtering by type
- ✅ Driver view modal with ratings
- ✅ Driver edit modal with licenses
- ✅ Driver rating system with auto emails
- ✅ Plate number display in bookings
- ✅ Booking detail modal
- ✅ Notification resend
- ✅ Dark mode toggle
- ✅ Responsive design
- ✅ Google Maps location picking
- ✅ Auto distance calculation
- ✅ Auto fare calculation
- ✅ Car model selection
- ✅ Driver assignment in booking
- ✅ Vendor portal & registration
- ✅ Vendor approval workflow
- ✅ Vendor dashboard & earnings
- ✅ Driver portal & registration
- ✅ Driver approval workflow
- ✅ Driver dashboard & profile
- ✅ All 16 drivers with avatar images
- ✅ All form fields validated
- ✅ Production-ready system

# Production Status
System is **FULLY PRODUCTION-READY** with:
- Complete vendor & driver management
- Full booking workflow with Google Maps
- Admin approval system for vendors & drivers
- Email notifications via Resend
- Complete financial tracking & payouts
- Professional admin dashboard
- Vendor & driver portals
- All demo data configured
- Comprehensive error handling
- Security best practices (JWT, RBAC, password hashing)

**Status**: ✅ ALL FEATURES COMPLETE & TESTED
