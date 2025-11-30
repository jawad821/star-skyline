# Overview

This project is a production-ready Node.js backend application for a comprehensive taxi/ride booking service with a full Vendor Management system. It features an admin dashboard, vendor portal, and driver portal, enabling end-to-end management of ride operations. Key capabilities include sophisticated slab-based fare calculation for various booking types (point-to-point, hourly rentals) and vehicle categories. The system provides RESTful APIs for managing bookings, drivers, and vehicles, alongside JWT authentication, an advanced analytics dashboard, robust reporting features, and email integration. The business vision is to provide a stable, scalable, and feature-rich platform for ride-hailing services, ready for market deployment and expansion.

# User Preferences

Preferred communication style: Simple, everyday language. All features delivered production-ready.
**Stability First**: System must remain stable as features expand. No compromise on reliability.
**English/Roman Urdu Only** - No Hindi/Urdu script communication.

# System Architecture

The application is built on an MVC (Model-View-Controller) architecture using Express.js (v5.1.0) and runs on port 5000. It uses JWT-based authentication with Role-Based Access Control (RBAC) for admin, operator, vendor, and driver roles.

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