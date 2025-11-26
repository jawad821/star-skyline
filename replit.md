# Overview

This is a Node.js backend application for a taxi/ride booking service with a production-ready admin dashboard. The system provides fare calculation capabilities for different booking types (point-to-point and hourly rentals) across various vehicle categories (sedan, SUV, luxury). The application exposes RESTful APIs for managing bookings, calculating fares based on distance/time/vehicle type, and includes JWT authentication, advanced analytics dashboard, reporting capabilities, and Bareerah push endpoint integration.

# User Preferences

Preferred communication style: Simple, everyday language.

# Recent Changes

## Dashboard Major Upgrade (November 25, 2025)
- ✅ Implemented time-filtered analytics dashboard with stats API
- ✅ Added date range filters: Today, Yesterday, This Week, This Month, Custom Range
- ✅ Created enhanced summary cards showing metrics with icons
- ✅ Added Chart.js integration with 7-day booking trend and revenue by vehicle type charts
- ✅ Built improved bookings table with all required columns (ID, Customer, Phone, Pickup, Drop, Distance, Vehicle, Fares, Driver, Payment, Status, Date)
- ✅ Added drivers module with online/offline status filtering
- ✅ Added cars/vehicles module with category filters (Sedan, SUV, Luxury)
- ✅ Implemented fare rules configuration UI with test calculator
- ✅ Added alerts panel with system notifications
- ✅ Upgraded UI with glassmorphism design, improved spacing, dark mode support
- ✅ Fixed authentication - dashboard login required before access
- ✅ Added database columns: payment_method, driver_id, driver.status, updated_at timestamps

# System Architecture

## MVC Architecture
The application follows a clean Model-View-Controller (MVC) pattern with the following structure:

```
/config              - Database and environment configuration
/controllers         - Request handlers (HTTP layer)
  - bookingController.js
  - statsController.js (NEW)
  - pushController.js
/models              - Data access layer (SQL queries)
  - Booking.js
  - Stats.js (NEW)
  - Vehicle.js, Vendor.js, Driver.js, Payout.js, User.js
/routes              - Route definitions
  - bookingRoutes.js
  - statsRoutes.js (NEW)
  - vehicleRoutes.js, vendorRoutes.js, authRoutes.js, reportRoutes.js, pushRoutes.js
/services            - Business logic layer
/middleware          - Error handling, auth, and utilities
/utils               - Helper functions (fare calculator, logger, exports)
/public/dashboard    - Admin dashboard UI (completely redesigned)
  - index.html (NEW - major update)
  - login.html (NEW - authentication gate)
  - js/app.js (NEW - major rewrite)
  - css/styles.css (updated with new component styles)
```

## Backend Framework
- **Technology**: Express.js (v5.1.0)
- **Rationale**: Lightweight and flexible web framework for building RESTful APIs
- **Server Configuration**: Runs on port 5000 (for Replit webview compatibility), bound to 0.0.0.0

## Authentication
- **JWT-based authentication** for protected routes
- **Environment variables** for secure credential storage (JWT_SECRET, ADMIN_USER, ADMIN_PASS)
- **Auth middleware** protects sensitive endpoints (reports, exports)
- **Dashboard login** gates access with credentials (admin/admin123)

## Data Storage
- **Database**: PostgreSQL
- **Connection Management**: pg library with connection pooling (config/db.js)
- **Pool Configuration**: 
  - Maximum 10 connections
  - 30-second idle timeout
  - 2-second connection timeout
  - Automatic retry logic for connection errors (code 53300)
- **Rationale**: Connection pooling optimizes database resource usage and handles concurrent requests efficiently

## Database Schema
- **vendors**: Limo service providers with commission rates
- **drivers**: Drivers assigned to vendors (NEW: status, updated_at columns)
- **vehicles**: Fleet with types (sedan/suv/luxury) and status tracking
- **bookings**: Customer ride bookings with fare, assignment info, external_id for idempotency (NEW: payment_method, driver_id, updated_at columns)
- **vendor_payouts**: Payment tracking for completed rides

## API Endpoints

### Authentication Routes (/api/auth)
- `POST /login` - Admin login, returns JWT token
- `GET /verify` - Verify JWT token (protected)

### Booking Routes (/api/bookings)
- `POST /calculate-fare` - Calculate fare without creating booking
- `GET /available-vehicles` - List available vehicles by type
- `POST /create-booking` - Create a new booking
- `POST /assign-vehicle` - Assign vehicle to booking

### Vehicle Routes (/api/vehicles)
- `GET /` - List all available vehicles
- `GET /:id` - Get vehicle by ID

### Vendor Routes (/api/vendors)
- `GET /` - List all vendors
- `GET /:id` - Get vendor by ID
- `POST /` - Create new vendor
- `GET /:id/drivers` - Get vendor's drivers

### Stats Routes (/api/stats) - NEW
- `GET /summary?range=today` - Get summary stats with date filtering (range: today/yesterday/week/month or start/end)
- `GET /summary?start=YYYY-MM-DD&end=YYYY-MM-DD` - Get summary stats for custom date range
- `GET /bookings?range=today` - Get filtered bookings list with status/vehicle_type filters
- Returns: summary metrics, 7-day trend, revenue by type, top drivers

### Report Routes (/api/reports) - Protected
- `GET /summary` - Dashboard summary with stats (requires JWT)
- `GET /export/csv` - Export bookings to CSV (requires JWT)
- `GET /export/excel` - Export bookings to Excel (requires JWT)

### Push Routes (/api/push)
- `POST /bareerah-event` - External event webhook with idempotency via external_id

### Utility Routes
- `GET /` - Health check (redirects to login)
- `GET /db-test` - Database connectivity test
- `GET /dashboard/` - Redirects to login
- `GET /dashboard/login.html` - Admin login page
- `GET /dashboard/index.html` - Admin dashboard (requires login)

## Admin Dashboard (Major Upgrade)

### Pages & Features
1. **Dashboard Page** (NEW)
   - Time range filters: Today, Yesterday, This Week, This Month, Custom Calendar
   - Summary cards: Total Bookings, Completed, Pending, Cancelled, Total Revenue, Cash vs Card split
   - Charts: 7-Day Booking Trend (line chart), Revenue by Vehicle Type (bar chart)
   - Top Drivers list with trip count and earnings
   - System alerts panel with status indicators

2. **Bookings Page** (Enhanced)
   - Table with columns: ID, Customer, Phone, Pickup, Drop, Distance, Vehicle Type, Estimated Fare, Final Fare, Driver, Payment Method, Status, Date
   - Filters: Date range, Status (Pending/Completed/Cancelled), Vehicle Type (Sedan/SUV/Luxury)
   - Search: Phone, name, locations
   - Export options (CSV button ready)

3. **Drivers Module** (NEW)
   - All Drivers view with Name, Phone, Status, License Expiry, Car Assigned, Total Trips
   - Submenus: Active Drivers, Offline Drivers, Pending Applications
   - Driver profile actions (View button)

4. **Cars/Vehicles Module** (NEW)
   - All Cars view showing: ID, License Plate, Model, Type, Status, Assigned Driver
   - Submenus: All Cars, Sedan, SUV, Luxury
   - Category filters
   - Vehicle availability status

5. **Fare Rules Page** (NEW)
   - Configuration UI for all pricing parameters
   - Base Fare input
   - Per-KM rates: Sedan, SUV, Luxury
   - Hourly rates: Sedan, SUV, Luxury
   - Minimum hours setting
   - Fare Calculator Test Box: Vehicle type + distance → calculated fare result

6. **Alerts Page** (NEW)
   - System-level alerts display
   - Alert types: Info, Success, Warning, Danger
   - Future integration: API errors, booking failures, expired documents

7. **Settings Page**
   - API Base URL display
   - System information (version, last updated, current user)
   - Dashboard version 2.0.0

### UI/UX Features
- **Design**: Glassmorphism with macOS-inspired aesthetics
- **Color Scheme**: 
  - Primary: #007AFF (blue)
  - Success: #34C759 (green)
  - Warning: #FF9500 (orange)
  - Danger: #FF3B30 (red)
  - Neutral grays
- **Dark Mode**: Full dark theme support with toggle
- **Responsive**: Mobile-friendly grid layouts
- **Charts**: Chart.js integration for visualizations
- **Badges**: Status indicators with color coding
- **Sidebar Navigation**: With submenu expandable sections
- **Filters**: Button-based date filters and dropdown filters

### Access & Security
- Public: `/dashboard/login.html` (requires credentials)
- Protected: `/dashboard/index.html` (requires JWT token in localStorage)
- Login Flow: Username/Password → API call → Token stored → Redirect to dashboard
- Logout: Clears token and user data → Redirects to login

## Business Logic - Fare Calculation
- **Booking Types**:
  - Point-to-point: Distance-based pricing (per km rates + pickup fee)
  - Hourly: Time-based pricing with minimum hours
- **Vehicle Categories**: Sedan, SUV, Luxury (each with distinct pricing)
- **Pricing Rates**:
  - Per-km: Sedan 3.5, SUV 4.5, Luxury 6.5 AED
  - Pickup fee: 5 AED
  - Hourly: Sedan 75, SUV 90, Luxury 150 AED/hr (min 2 hours)
- **Location**: utils/fareCalculator.js

## Code Organization
- **Entry Point**: index.js - Server initialization, route mounting, middleware setup, auth gating for dashboard
- **Config Layer**: config/ - Database (db.js) and environment (env.js) configuration
- **Model Layer**: models/ - SQL query functions
  - Booking.js: Booking CRUD and status updates
  - Stats.js (NEW): Analytics queries with date filtering, trends, driver stats
  - Vehicle.js, Vendor.js, Driver.js, Payout.js, User.js
- **Service Layer**: services/ - Business logic and validation
- **Controller Layer**: controllers/ - HTTP request/response handling
  - bookingController.js, statsController.js (NEW), pushController.js
- **Route Layer**: routes/ - Express route definitions
  - statsRoutes.js (NEW) - /api/stats endpoints
- **Middleware**: middleware/ - Error handler, async wrapper, auth middleware
- **Utilities**: utils/ - Fare calculator, logger, CSV/Excel export
- **Frontend**: public/dashboard/ - Admin UI with login, dashboard, and management pages

## Error Handling
- Centralized error handler middleware (middleware/errorHandler.js)
- Async handler wrapper for try/catch elimination (middleware/asyncHandler.js)
- Structured JSON error responses with appropriate HTTP status codes
- API errors gracefully displayed in dashboard alerts

# External Dependencies

## Core Dependencies
- **express** (v5.1.0): Web application framework
- **pg** (v8.16.3): PostgreSQL client for Node.js
- **jsonwebtoken**: JWT authentication
- **bcryptjs**: Password hashing
- **@types/node** (v22.13.11): TypeScript type definitions for Node.js
- **chart.js** (v3.9.1): Data visualization library (via CDN in dashboard)

## Database
- **PostgreSQL**: Primary data store
- **Connection**: Via DATABASE_URL environment variable
- **Connection Strategy**: Pooled connections with automatic retry and error handling

## Frontend Libraries
- **Chart.js** (via CDN): Line and bar charts for analytics
- **Native JavaScript**: No framework, vanilla JS for dashboard interactivity

## Environment Variables
- **DATABASE_URL**: PostgreSQL connection string (required)
- **PORT**: Server port (default: 5000 for Replit)
- **NODE_ENV**: Environment mode (development/production)
- **JWT_SECRET**: Secret key for JWT signing (required)
- **ADMIN_USER**: Admin username (default: admin)
- **ADMIN_PASS**: Admin password (default: admin123)
- **API_BASE_URL**: Base URL for API (default: http://localhost:5000)

# Feature Checklist (Completed)
- ✅ Dashboard with time-filtered analytics
- ✅ Summary cards with metrics
- ✅ 7-Day booking trend chart
- ✅ Revenue by vehicle type chart
- ✅ Top drivers statistics
- ✅ Enhanced bookings table with filters
- ✅ Drivers management with status
- ✅ Vehicles management with categories
- ✅ Fare rules configuration UI
- ✅ Fare calculator test tool
- ✅ System alerts panel
- ✅ Dark mode toggle
- ✅ Glassmorphism UI design
- ✅ Login authentication gate
- ✅ JWT token management
- ✅ Responsive design

# Future Enhancements
- Real-time updates using WebSockets
- Google Maps API integration for live map widget
- Document upload for drivers (license, ID, vehicle card)
- AI voice booking logs
- Notifications system (SMS/push/email)
- Payment gateway integration
- Mobile app connectivity
- Export to PDF
- Advanced reporting with date range exports

## Final Production Status (November 26, 2025 - Evening)

### ✅ DEMO DATA FULLY POPULATED
- 2 Vendors: Bareerah Fleet Dubai, Al Safeer Transport
- 8 Drivers: All linked to vendors with online/offline status
- 8 Vehicles: Sedan/SUV/Luxury/MPV with passenger/luggage capacities
- 12 Customers: Full contact details with WhatsApp numbers
- 15 Bookings: 10 completed, 3 pending, 2 cancelled = 3,210 AED revenue

### ✅ BACKEND FEATURES READY
- Notification triggers on booking creation (WhatsApp + Email)
- RBAC enforcement: Admin full access, Operator read-only
- Smart vehicle matching by passengers/luggage
- Database schema complete with all required columns

### ✅ APIs OPERATIONAL
- All /api/* endpoints returning {success: true, data: [...]}
- Dashboard stats calculations working
- Port 8000 configured and tested

### ✅ WHATSAPP BUSINESS API STRUCTURE
- Token placeholder ready: process.env.WHATSAPP_API_TOKEN
- Phone Number ID placeholder: process.env.WHATSAPP_PHONE_ID
- Message templates defined for booking notifications
- Notification logging table configured (notification_logs)
- Ready to plug in credentials immediately upon Meta approval

