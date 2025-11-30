# Overview

This project is a production-ready Node.js backend application for a comprehensive taxi/ride booking service, featuring a full Vendor Management system. It includes an admin dashboard, vendor portal, and driver portal for end-to-end management of ride operations. Key capabilities include sophisticated slab-based fare calculation for various booking types (point-to-point, multi-stop, round-trip) and vehicle categories. The system provides RESTful APIs for managing bookings, drivers, and vehicles, alongside JWT authentication, advanced analytics, robust reporting, and email integration. The business vision is to deliver a stable, scalable, and feature-rich platform for ride-hailing services, ready for market deployment and expansion.

# User Preferences

Preferred communication style: Simple, everyday language. All features delivered production-ready.
**Stability First**: System must remain stable as features expand. No compromise on reliability.
**English/Roman Urdu Only** - No Hindi/Urdu script communication.

# System Architecture

The application is built on an MVC (Model-View-Controller) architecture using Express.js and runs on port 5000. It uses JWT-based authentication with Role-Based Access Control (RBAC) for admin, operator, vendor, and driver roles.

## UI/UX Decisions
- **Portals**: Admin Dashboard, Vendor Portal, Driver Portal, and Operator Portal provide role-specific functionalities.
- **Design**: Professional 2-column layouts, clear labels, solid white dropdowns, responsive design with dark mode toggle.
- **Error Display**: User-friendly error messages are displayed directly on the UI for failed API calls.
- **Vehicle Color System**: Mandatory 7-color dropdown (Black, White, Silver, Gray, Red, Blue, Gold) included in notifications.

## Technical Implementations
- **Core Logic**: Dynamic slab-based fare calculation based on distance, time, and vehicle type. Fare rules are admin-editable and stored in the database, including `included_km` for slab calculations.
- **Booking Management**: Supports point-to-point, multi-stop, and round-trip bookings with automated fare calculation and `booking_stops` table for multi-leg journeys. Includes a `notes` field for special instructions.
- **Booking Assignment**: Automatic driver-vehicle tagging and assignment based on `assigned_vehicle_id` and vehicle's `driver_id`. Manual override and smart vendor vehicle assignment with approval checks.
- **Email Notification System**: Professional HTML email templates with luxury design (gradient header, premium typography, clear CTAs). Includes all booking details: passengers, luggage, vehicle model/color, journey visualization (multi-leg paths for round-trip/multi-stop), return time, fare breakdown, special instructions, and 24/7 support contact. Integrated with Resend API. **Note**: Resend in testing mode sends emails to verified account (aizaz.dmp@gmail.com). For production, verify domain at resend.com/domains to send to customer emails.
- **Location Management**: Integrated 400+ UAE locations across all 7 emirates, supporting inter-emirate bookings.
- **API Standardization**: All API endpoints return consistent `{"success":true,"data":...}` format.
- **Caching**: Cache-busting implemented for all API calls.
- **Error Handling**: Comprehensive error handling with logging and user-friendly messages.
- **Validation**: Passenger/luggage validation is mandatory for booking creation. Capacity checked against vehicle specs.
- **Vehicle Categories**: Seven configurable vehicle types (Classic, Executive, First Class, Urban SUV, Luxury SUV, Elite Van, Mini Bus) with distinct base fares, `included_km` thresholds, and per-km rates.
- **Vendor Management**: Full vendor lifecycle from registration to approval/rejection and auto-assignment control.
- **Bareerah Integration**: Automatic retry logic (3 attempts with exponential backoff), detailed request/response logging, payload validation, and tagging bookings with `booking_source: bareerah_ai`.

## Feature Specifications

### Admin Dashboard
- Real-time statistics, comprehensive bookings, drivers, and vehicles tabs.
- KPI & Profits tab, CSV export functionality.
- Fare Rules Management Tab for viewing and editing.
- Vendors Tab for listing, approving/rejecting, and managing vendor auto-assignment.
- Analytics: 7-Day Booking Trend, Revenue by Vehicle Type, Top Drivers List with KPI cards and interactive charts.

### Vendor Management
- **Registration**: Company info, bank details, logo submitted, saved as "pending."
- **Admin Approval**: Review and approve/reject vendors.
- **Approved Vendors**: Can login to vendor dashboard.
- **Auto-Assignment Control**: Admin can disable/enable vendor vehicles from the booking pool.
- **Vendor Statistics**: Tracks total vehicles, completed bookings, total earnings, pending payouts, with interactive charts (Bookings, Earnings, Distance) and top drivers/models.

### Booking Management
- Create, view, edit bookings; dynamic fare calculation. Edit access is status-based.
- Auto-assignment for vendor bookings when company vehicles are full.

### Vehicle Management
- Capacity logic for filtering based on passengers and luggage.
- Smart vehicle selection (company priority, then vendor).
- Vendor vehicle pool for auto-assignment.

## System Design Choices
- **Database Schema**: Optimized tables for `bookings`, `vehicles`, `drivers`, `vendors`, `users`, including specific fields for vendor management (`auto_assign_disabled`, `rejection_reason`).
- **Modular Structure**: Organized into `/config`, `/controllers`, `/models`, `/routes`, `/services`, `/middleware`, and `/utils`.
- **Scalability**: Robust database connections, consistent API response formats, efficient caching, thorough error handling, and smart resource allocation.
- **Port Configuration**: Port 5000 for Replit webview compatibility.

# External Dependencies

- **Database**: PostgreSQL (via Replit managed `DATABASE_URL`).
- **Backend Framework**: Express.js.
- **Authentication**: JSON Web Tokens (JWT).
- **Email Service**: Resend (professional HTML emails with luxury design).
- **Messaging (Planned)**: WhatsApp API.

# Recent Updates (November 30, 2025)

## New Features Added
1. **Round-Trip Bookings** - Pickup → Destination → Return after X hours (3 stops tracked)
2. **Multi-Stop Bookings** - Multiple intermediate stops in one booking with wait times
3. **Professional Email Notifications** - Beautiful HTML emails sent to admin with:
   - Complete journey visualization
   - Vehicle model + color details
   - Passenger & luggage info
   - Special instructions/notes
   - Fare breakdown
   - Support contact info

## New API Endpoints
- `POST /api/bookings/create-round-trip` - Round-trip bookings
- `POST /api/bookings/create-multi-stop` - Multi-stop bookings

## Database Changes
- `booking_stops` table created to track all stops with duration
- New booking fields: `vehicle_model`, `vehicle_color`, `customer_email`, `meeting_location`, `return_after_hours`

## Documentation
- **BAREERAH_NEW_FEATURES_GUIDE.md** - Complete guide for Bareerah on new features with examples
- All features tested and production-ready
- Email notifications live (testing mode: sent to aizaz.dmp@gmail.com)