# Overview

This is a Node.js backend application for a taxi/ride booking service. The system provides fare calculation capabilities for different booking types (point-to-point and hourly rentals) across various vehicle categories (sedan, SUV, luxury). The application exposes RESTful APIs for managing bookings and calculating fares based on distance, time, and vehicle type. It includes JWT authentication, admin dashboard, and reporting capabilities.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## MVC Architecture
The application follows a clean Model-View-Controller (MVC) pattern with the following structure:

```
/config          - Database and environment configuration
/controllers     - Request handlers (HTTP layer)
/models          - Data access layer (SQL queries)
/routes          - Route definitions
/services        - Business logic layer
/middleware      - Error handling, auth, and utilities
/utils           - Helper functions (fare calculator, logger, exports)
/public/dashboard - Admin dashboard UI
```

## Backend Framework
- **Technology**: Express.js (v5.1.0)
- **Rationale**: Lightweight and flexible web framework for building RESTful APIs
- **Server Configuration**: Runs on port 3000, bound to 0.0.0.0 for container compatibility

## Authentication
- **JWT-based authentication** for protected routes
- **Environment variables** for secure credential storage (JWT_SECRET, ADMIN_USER, ADMIN_PASS)
- **Auth middleware** protects sensitive endpoints (reports, exports)

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
- **drivers**: Drivers assigned to vendors
- **vehicles**: Fleet with types (sedan/suv/luxury) and status tracking
- **bookings**: Customer ride bookings with fare, assignment info, and external_id for idempotency
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

### Report Routes (/api/reports) - Protected
- `GET /summary` - Dashboard summary with stats (requires JWT)
- `GET /export/csv` - Export bookings to CSV (requires JWT)
- `GET /export/excel` - Export bookings to Excel (requires JWT)

### Push Routes (/api/push)
- `POST /bareerah-event` - External event webhook with idempotency via external_id

### Utility Routes
- `GET /` - Health check
- `GET /db-test` - Database connectivity test
- `GET /dashboard` - Redirect to admin dashboard

## Admin Dashboard
- **Location**: public/dashboard/
- **Features**: 
  - Login with JWT authentication
  - Dashboard with booking/revenue stats
  - Booking management with fare calculator
  - Vehicle and vendor management
  - CSV/Excel export

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
- **Entry Point**: index.js - Server initialization, route mounting, middleware setup
- **Config Layer**: config/ - Database (db.js) and environment (env.js) configuration
- **Model Layer**: models/ - SQL query functions (Booking.js, Vehicle.js, Vendor.js, Driver.js, Payout.js, User.js)
- **Service Layer**: services/ - Business logic and validation
- **Controller Layer**: controllers/ - HTTP request/response handling
- **Route Layer**: routes/ - Express route definitions
- **Middleware**: middleware/ - Error handler, async wrapper, auth middleware
- **Utilities**: utils/ - Fare calculator, logger, CSV/Excel export

## Error Handling
- Centralized error handler middleware (middleware/errorHandler.js)
- Async handler wrapper for try/catch elimination (middleware/asyncHandler.js)
- Structured JSON error responses with appropriate HTTP status codes

# External Dependencies

## Core Dependencies
- **express** (v5.1.0): Web application framework
- **pg** (v8.16.3): PostgreSQL client for Node.js
- **jsonwebtoken**: JWT authentication
- **bcryptjs**: Password hashing
- **@types/node** (v22.13.11): TypeScript type definitions for Node.js

## Database
- **PostgreSQL**: Primary data store
- **Connection**: Via DATABASE_URL environment variable
- **Connection Strategy**: Pooled connections with automatic retry and error handling

## Environment Variables
- **DATABASE_URL**: PostgreSQL connection string (required)
- **PORT**: Server port (default: 3000)
- **NODE_ENV**: Environment mode (development/production)
- **JWT_SECRET**: Secret key for JWT signing (required)
- **ADMIN_USER**: Admin username (required)
- **ADMIN_PASS**: Admin password (required)
- **API_BASE_URL**: Base URL for API (default: http://localhost:3000)
