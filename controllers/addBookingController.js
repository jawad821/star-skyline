const { query } = require('../config/db');
const fareCalculator = require('../utils/fareCalculator');
const logger = require('../utils/logger');

const addBookingController = {
  async createManualBooking(req, res, next) {
    try {
      const {
        customer_name,
        customer_phone,
        customer_email,
        pickup_location,
        dropoff_location,
        distance_km,
        booking_type,
        vehicle_type,
        car_model,
        driver_id,
        payment_method,
        status
      } = req.body;

      // Validate required fields
      if (!customer_name || !customer_phone || !pickup_location || !dropoff_location || !distance_km || !booking_type || !vehicle_type) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
      }

      // Calculate fare
      const fareResult = fareCalculator.calculateFare(
        booking_type.toLowerCase(),
        vehicle_type.toLowerCase(),
        parseFloat(distance_km),
        0
      );
      const fare = fareResult.fare;

      // Create booking (database auto-generates UUID)
      const result = await query(`
        INSERT INTO bookings 
          (customer_name, customer_phone, customer_email, pickup_location, dropoff_location, 
           distance_km, fare_aed, booking_type, vehicle_type, driver_id, payment_method, status, created_at)
        VALUES 
          ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
        RETURNING *
      `, [
        customer_name, customer_phone, customer_email || null, pickup_location,
        dropoff_location, distance_km, fare, booking_type, vehicle_type, driver_id || null, payment_method || 'cash',
        status || 'pending'
      ])

      logger.info(`Manual booking created: ${result.rows[0].id}`);
      
      // Send confirmation email if email provided
      if (customer_email) {
        const emailService = require('../utils/emailService');
        emailService.sendCustomerNotification(result.rows[0], null);
      }

      res.status(201).json({
        success: true,
        message: 'Booking created successfully',
        booking: result.rows[0]
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = addBookingController;
