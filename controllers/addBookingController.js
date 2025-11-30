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
        vehicle_model,
        car_model,
        driver_id,
        assigned_vehicle_id,
        payment_method,
        status,
        booking_source,
        passengers_count,
        luggage_count,
        notes
      } = req.body;

      // Validate required fields
      if (!customer_name || !customer_phone || !pickup_location || !dropoff_location || !distance_km || !booking_type || !vehicle_type) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
      }

      // Validate passenger and luggage counts
      if (!passengers_count || passengers_count < 1) {
        return res.status(400).json({ success: false, error: 'passengers_count must be >= 1' });
      }
      if (luggage_count === undefined || luggage_count < 0) {
        return res.status(400).json({ success: false, error: 'luggage_count must be >= 0' });
      }

      // Check vehicle capacity
      const vehicleCapacityResult = await query(
        'SELECT max_passengers, max_luggage FROM vehicles WHERE type = $1 LIMIT 1',
        [vehicle_type.toLowerCase()]
      );

      if (vehicleCapacityResult.rows.length > 0) {
        const { max_passengers, max_luggage } = vehicleCapacityResult.rows[0];
        if (passengers_count > max_passengers) {
          return res.status(400).json({
            success: false,
            error: `Vehicle capacity exceeded. Max passengers: ${max_passengers}, Requested: ${passengers_count}`
          });
        }
        if (luggage_count > max_luggage) {
          return res.status(400).json({
            success: false,
            error: `Luggage capacity exceeded. Max luggage: ${max_luggage}, Requested: ${luggage_count}`
          });
        }
      }

      // Calculate fare (async - reads from database)
      const fareResult = await fareCalculator.calculateFare(
        booking_type.toLowerCase(),
        vehicle_type.toLowerCase(),
        parseFloat(distance_km),
        0
      );
      const fare = fareResult.fare;

      // Determine vehicle model - use vehicle_model if provided, otherwise car_model
      const finalVehicleModel = vehicle_model || car_model || 'Not specified';
      
      // AUTO-ASSIGNMENT: Handle vehicle assignment
      let finalDriverId = driver_id;
      let finalAssignedVehicleId = assigned_vehicle_id;
      let finalVehicleModelForBooking = finalVehicleModel;
      
      // Determine booking source
      const finalBookingSource = booking_source === 'bareerah_ai' ? 'bareerah_ai' : (booking_source || 'manually_created');
      
      // If no vehicle assigned, auto-assign cheapest available (for ALL bookings, not just Bareerah)
      if (!assigned_vehicle_id) {
        const autoVehicleResult = await query(`
          SELECT id, driver_id, model FROM vehicles 
          WHERE type = $1 AND status = 'available' AND active = true
          AND max_passengers >= $2 AND max_luggage >= $3
          ORDER BY per_km_price ASC
          LIMIT 1
        `, [vehicle_type.toLowerCase(), passengers_count, luggage_count]);
        
        if (autoVehicleResult.rows.length > 0) {
          finalAssignedVehicleId = autoVehicleResult.rows[0].id;
          if (autoVehicleResult.rows[0].driver_id && !driver_id) {
            finalDriverId = autoVehicleResult.rows[0].driver_id;
          }
          finalVehicleModelForBooking = autoVehicleResult.rows[0].model;
        }
      } else if (assigned_vehicle_id) {
        // Get the vehicle's tagged driver and model
        const vehicleResult = await query('SELECT driver_id, model FROM vehicles WHERE id = $1', [assigned_vehicle_id]);
        if (vehicleResult.rows.length > 0) {
          if (vehicleResult.rows[0].driver_id && !driver_id) {
            finalDriverId = vehicleResult.rows[0].driver_id; // Auto-assign tagged driver if no driver specified
          }
          finalVehicleModelForBooking = vehicleResult.rows[0].model; // Store the actual vehicle model
        } else {
          // Vehicle doesn't exist - for Bareerah, auto-assign instead of failing
          if (finalBookingSource === 'bareerah_ai') {
            const autoVehicleResult = await query(`
              SELECT id, driver_id, model FROM vehicles 
              WHERE type = $1 AND status = 'available' AND active = true
              AND max_passengers >= $2 AND max_luggage >= $3
              ORDER BY per_km_price ASC
              LIMIT 1
            `, [vehicle_type.toLowerCase(), passengers_count, luggage_count]);
            
            if (autoVehicleResult.rows.length > 0) {
              finalAssignedVehicleId = autoVehicleResult.rows[0].id;
              if (autoVehicleResult.rows[0].driver_id && !driver_id) {
                finalDriverId = autoVehicleResult.rows[0].driver_id;
              }
              finalVehicleModelForBooking = autoVehicleResult.rows[0].model;
            } else {
              // No vehicle available, allow null assignment
              finalAssignedVehicleId = null;
            }
          } else {
            // Non-Bareerah booking with invalid vehicle - reject
            return res.status(400).json({ 
              success: false, 
              error: `Vehicle ID ${assigned_vehicle_id} not found in system` 
            });
          }
        }
      }
      
      // Create booking (database auto-generates UUID)
      const result = await query(`
        INSERT INTO bookings 
          (customer_name, customer_phone, customer_email, pickup_location, dropoff_location, 
           distance_km, fare_aed, booking_type, vehicle_type, vehicle_model, driver_id, assigned_vehicle_id, payment_method, status, booking_source, passengers_count, luggage_count, notes, created_at)
        VALUES 
          ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, NOW())
        RETURNING *
      `, [
        customer_name, customer_phone, customer_email || null, pickup_location,
        dropoff_location, distance_km, fare, booking_type, vehicle_type, finalVehicleModelForBooking, finalDriverId || null, finalAssignedVehicleId || null, payment_method || 'cash',
        status || 'in-process', finalBookingSource, passengers_count, luggage_count, notes || null
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
