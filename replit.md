# Overview

This is a Node.js backend application for a taxi/ride booking service. The system provides fare calculation capabilities for different booking types (point-to-point and hourly rentals) across various vehicle categories (sedan, SUV, luxury). The application exposes RESTful APIs for managing bookings and calculating fares based on distance, time, and vehicle type.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Backend Framework
- **Technology**: Express.js (v5.1.0)
- **Rationale**: Lightweight and flexible web framework for building RESTful APIs
- **Server Configuration**: Runs on port 3000, bound to 0.0.0.0 for container compatibility

## Data Storage
- **Database**: PostgreSQL
- **Connection Management**: pg library with connection pooling
- **Pool Configuration**: 
  - Maximum 10 connections
  - 30-second idle timeout
  - 2-second connection timeout
  - Automatic retry logic for connection errors (code 53300)
- **Rationale**: Connection pooling optimizes database resource usage and handles concurrent requests efficiently

## API Structure
- **Route Organization**: Modular routing with separate route files
  - `/api/bookings` - Booking-related endpoints (fare calculation, booking management)
  - `/` - Health check endpoint
  - `/db-test` - Database connectivity verification
- **Request Format**: JSON payloads
- **Error Handling**: Structured error responses with appropriate HTTP status codes

## Business Logic - Fare Calculation
- **Booking Types**:
  - Point-to-point: Distance-based pricing (per km rates + pickup fee)
  - Hourly: Time-based pricing with minimum hours and included kilometers
- **Vehicle Categories**: Sedan, SUV, Luxury (each with distinct pricing)
- **Pricing Model**: 
  - Configurable rate constants defined in RATES object
  - Supports discount mechanisms (infrastructure in place)
  - Fare calculation returns both pre-discount and post-discount amounts
- **Design Pattern**: Pure function for fare calculation (calculateFare) for testability and reusability

## Code Organization
- **Entry Point**: index.js - Server initialization and middleware setup
- **Database Layer**: db/db.js - Centralized database connection and query execution
- **Routes**: routes/ directory - Endpoint handlers organized by resource
- **Separation of Concerns**: Business logic (fare calculation) separated from route handlers

# External Dependencies

## Core Dependencies
- **express** (v5.1.0): Web application framework
- **pg** (v8.16.3): PostgreSQL client for Node.js
- **@types/node** (v22.13.11): TypeScript type definitions for Node.js

## Database
- **PostgreSQL**: Primary data store
- **Connection**: Via DATABASE_URL environment variable
- **Connection Strategy**: Pooled connections with automatic retry and error handling

## Environment Variables
- **DATABASE_URL**: PostgreSQL connection string (required)