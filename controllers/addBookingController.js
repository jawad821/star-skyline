const { query } = require('../config/db');
const fareCalculator = require('../utils/fareCalculator');
const logger = require('../utils/logger');
const auditLogger = require('../utils/auditLogger'); // Added import

const addBookingController = {
  async createManualBooking(req, res, next) {
    try {
      // ... (existing destructuring and validation) ...
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
        pickup_time,
        notes,
        flight_arrival_time,
        flight_departure_time,
        flight_type,
        flight_time
      } = req.body;

      if (!customer_name || !customer_phone || !pickup_location || !dropoff_location || !booking_type || !vehicle_type) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
      }

      // ... (rest of validation and calculation logic unchanged) ...
      // For brevity, I am skipping lines that don't need changes, but since replace_file_content needs context, I will include enough.

      let finalDistance = distance_km || 0;
      if (booking_type.toLowerCase() === 'multi_stop') {
        const stops = req.body.stops || [];
        if (!stops || stops.length < 2) {
          return res.status(400).json({ success: false, error: 'Multi-stop requires at least 2 stops' });
        }
        finalDistance = stops.reduce((sum, s) => sum + (s.distance_from_previous || 0), 0);
      } else if (booking_type.toLowerCase() === 'round_trip') {
        if (!req.body.meeting_location || !req.body.return_after_hours) {
          return res.status(400).json({ success: false, error: 'Round-trip requires meeting location and return hours' });
        }
        finalDistance = (distance_km || 25) * 2;
      }

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
        parseFloat(finalDistance),
        0
      );
      let fare = fareResult.fare;

      // Apply multi-stop/round-trip fare multipliers if needed
      if (booking_type.toLowerCase() === 'round_trip') {
        fare = fare * 2; // Double the fare for round trip
      }

      // Determine vehicle model - use vehicle_model if provided, otherwise car_model
      const finalVehicleModel = vehicle_model || car_model || 'Not specified';

      // AUTO-ASSIGNMENT: Handle vehicle assignment
      let finalDriverId = driver_id;
      let finalAssignedVehicleId = assigned_vehicle_id;
      let finalVehicleModelForBooking = finalVehicleModel;
      let finalVehicleColor = null;

      const finalBookingSource = booking_source === 'bareerah_ai' ? 'bareerah_ai' : (booking_source || 'manually_created');

      // ... (auto assignment logic unchanged) ...
      if (!assigned_vehicle_id) {
        logger.info(`Auto-assigning vehicle for type: ${vehicle_type}, passengers: ${passengers_count}`);
        const autoVehicleResult = await query(`
          SELECT id, driver_id, model, color FROM vehicles 
          WHERE type = $1 AND status = 'available' AND active = true
          AND max_passengers >= $2 AND max_luggage >= $3
          ORDER BY per_km_price ASC
          LIMIT 1
        `, [vehicle_type.toLowerCase(), passengers_count, luggage_count]);

        logger.info(`Auto-assign result: ${autoVehicleResult.rows.length} vehicles found`);

        if (autoVehicleResult.rows.length > 0) {
          finalAssignedVehicleId = autoVehicleResult.rows[0].id;
          if (autoVehicleResult.rows[0].driver_id && !driver_id) {
            finalDriverId = autoVehicleResult.rows[0].driver_id;
            logger.info(`Auto-assigned driver: ${finalDriverId}`);
          }
          finalVehicleModelForBooking = autoVehicleResult.rows[0].model;
          finalVehicleColor = autoVehicleResult.rows[0].color;
        } else {
          logger.warn('No available vehicle found for auto-assignment');
        }
      } else if (assigned_vehicle_id) {
        // Get the vehicle's tagged driver, model, and color
        const vehicleResult = await query('SELECT driver_id, model, color FROM vehicles WHERE id = $1', [assigned_vehicle_id]);
        if (vehicleResult.rows.length > 0) {
          if (vehicleResult.rows[0].driver_id && !driver_id) {
            finalDriverId = vehicleResult.rows[0].driver_id; // Auto-assign tagged driver if no driver specified
          }
          finalVehicleModelForBooking = vehicleResult.rows[0].model; // Store the actual vehicle model
          finalVehicleColor = vehicleResult.rows[0].color;
        } else {
          // Vehicle doesn't exist - for Bareerah, auto-assign instead of failing
          if (finalBookingSource === 'bareerah_ai') {
            const autoVehicleResult = await query(`
              SELECT id, driver_id, model, color FROM vehicles 
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
              finalVehicleColor = autoVehicleResult.rows[0].color;
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
           distance_km, fare_aed, booking_type, vehicle_type, vehicle_model, vehicle_color, driver_id, assigned_vehicle_id, payment_method, status, booking_source, passengers_count, luggage_count, pickup_time, notes, flight_arrival_time, flight_departure_time, flight_type, flight_time, created_at)
        VALUES 
          ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, NOW())
        RETURNING *
      `, [
        customer_name, customer_phone, customer_email || null, pickup_location,
        dropoff_location, finalDistance, fare, booking_type, vehicle_type, finalVehicleModelForBooking, finalVehicleColor || null, finalDriverId || null, finalAssignedVehicleId || null, payment_method || 'cash',
        status || 'in-process', finalBookingSource, passengers_count, luggage_count, pickup_time || null, notes || null, flight_arrival_time || null, flight_departure_time || null, flight_type || null, flight_time || null
      ])

      const booking = result.rows[0];

      // Handle stops for multi_stop and round_trip
      if (booking_type.toLowerCase() === 'multi_stop' && req.body.stops) {
        for (let i = 0; i < req.body.stops.length; i++) {
          const stop = req.body.stops[i];
          await query(
            'INSERT INTO booking_stops (booking_id, stop_number, location, stop_type, duration_minutes) VALUES ($1, $2, $3, $4, $5)',
            [booking.id, i + 1, stop.location, stop.stop_type || 'stop', stop.duration_minutes || 0]
          );
        }
      } else if (booking_type.toLowerCase() === 'round_trip') {
        await query('INSERT INTO booking_stops (booking_id, stop_number, location, stop_type, duration_minutes) VALUES ($1, $2, $3, $4, $5)', [booking.id, 1, pickup_location, 'pickup', 0]);
        await query('INSERT INTO booking_stops (booking_id, stop_number, location, stop_type, duration_minutes) VALUES ($1, $2, $3, $4, $5)', [booking.id, 2, req.body.meeting_location, 'intermediate', (req.body.return_after_hours || 3) * 60]);
        await query('INSERT INTO booking_stops (booking_id, stop_number, location, stop_type, duration_minutes) VALUES ($1, $2, $3, $4, $5)', [booking.id, 3, pickup_location, 'dropoff', 0]);
      }

      logger.info(`Manual booking created: ${booking.id}`);

      // AUDIT LOG
      const user = req.user || { id: null, username: 'system', role: 'system' };
      await auditLogger.logChange(
        'booking',
        booking.id,
        'CREATE',
        { customer_name, pickup_location, booking_type, fare_aed: fare },
        user.id || user.username,
        user.username,
        user.role
      ).catch(e => logger.error('Audit log error:', e));

      // ✅ RESPOND IMMEDIATELY - Don't wait for notifications
      res.status(201).json({
        success: true,
        message: 'Booking created successfully',
        booking: booking
      });

      // 📨 Send notifications in background (non-blocking)
      setImmediate(async () => {
        try {
          const emailService = require('../utils/emailService');
          const notificationService = require('../services/notificationService');

          logger.info(`[BACKGROUND] Starting notifications for booking ${booking.id}`);

          // 1. Customer Notifications (Email + WhatsApp)
          if (customer_email) {
            emailService.sendCustomerNotification(booking, null)
              .then(() => logger.info(`✅ Customer email sent for ${booking.id}`))
              .catch(e => logger.error(`❌ Error sending customer email: ${e.message}`));
          }
          if (customer_phone) {
            notificationService.sendWhatsAppToCustomer(customer_phone, booking)
              .then(() => logger.info(`✅ Customer WhatsApp sent for ${booking.id}`))
              .catch(e => logger.error(`❌ Error sending customer WhatsApp: ${e.message}`));
          }

          // 2. Admin Notifications (Email + WhatsApp)
          emailService.sendAdminNotification(booking, null)
            .then(() => logger.info(`✅ Admin email sent for ${booking.id}`))
            .catch(e => logger.error(`❌ Error sending admin email: ${e.message}`));

          notificationService.sendWhatsAppToAdmin(booking)
            .then(() => logger.info(`✅ Admin WhatsApp sent for ${booking.id}`))
            .catch(e => logger.error(`❌ Error sending admin WhatsApp: ${e.message}`));

          // 3. Driver Notification (if assigned)
          if (finalDriverId) {
            query('SELECT phone, email FROM drivers WHERE id = $1', [finalDriverId])
              .then(res => {
                if (res.rows.length > 0) {
                  const driver = res.rows[0];
                  if (driver.phone) {
                    notificationService.sendWhatsAppToDriver(driver.phone, booking)
                      .then(() => logger.info(`✅ Driver WhatsApp sent for ${booking.id}`))
                      .catch(e => logger.error(`❌ Error sending driver WhatsApp: ${e.message}`));
                  }
                  if (driver.email) {
                    notificationService.sendEmailToDriver(driver.email, booking)
                      .then(() => logger.info(`✅ Driver email sent for ${booking.id}`))
                      .catch(e => logger.error(`❌ Error sending driver email: ${e.message}`));
                  }
                }
              })
              .catch(e => logger.error(`❌ Error fetching driver for notification: ${e.message}`));
          }

          logger.info(`[BACKGROUND] All notifications queued for booking ${booking.id}`);
        } catch (error) {
          logger.error(`[BACKGROUND] Error in notification handler: ${error.message}`);
        }
      });

    } catch (error) {
      next(error);
    }
  },

  async createHourlyRentalBooking(req, res, next) {
    try {
      const rentalRulesService = require('../services/rentalRulesService');
      const {
        customer_name,
        customer_phone,
        customer_email,
        pickup_location,
        vehicle_type,
        vehicle_model,
        vehicle_color,
        passengers_count,
        luggage_count,
        rental_hours,
        payment_method,
        notes,
        booking_source
      } = req.body;

      if (!customer_name || !customer_phone || !pickup_location || !vehicle_type || !rental_hours) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
      }

      // Calculate rental fare
      const fareData = await rentalRulesService.calculateRentalFare(vehicle_type, rental_hours);

      // Create booking
      const result = await query(`
        INSERT INTO bookings 
          (customer_name, customer_phone, customer_email, pickup_location, dropoff_location, 
           booking_type, vehicle_type, vehicle_model, vehicle_color, 
           passengers_count, luggage_count, fare_aed, rental_hours, hourly_rate_aed,
           payment_method, booking_source, status, pickup_time, notes, created_at)
        VALUES 
          ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, 'pending', $17, $18, NOW())
        RETURNING *
      `, [
        customer_name, customer_phone, customer_email || null, pickup_location, pickup_location,
        'hourly_rental', vehicle_type, vehicle_model || null, vehicle_color || null,
        passengers_count || 1, luggage_count || 0, fareData.total_fare, rental_hours, fareData.hourly_rate,
        payment_method || 'card', booking_source || 'admin', req.body.pickup_time || null, notes || null
      ]);


      const booking = result.rows[0];

      // AUDIT LOG
      const user = req.user || { id: null, username: 'system', role: 'system' };
      await auditLogger.logChange(
        'booking',
        booking.id,
        'CREATE',
        { customer_name, pickup_location, booking_type: 'hourly_rental', fare_aed: fareData.total_fare },
        user.id || user.username,
        user.username,
        user.role
      ).catch(e => logger.error('Audit log error:', e));

      // Send email notification
      if (customer_email) {
        try {
          const emailService = require('../utils/emailService');
          await emailService.sendCustomerNotification(booking, null);
        } catch (emailError) {
          console.error('Email error:', emailError.message);
        }
      }

      res.status(201).json({
        success: true,
        message: 'Hourly rental booking created successfully',
        booking: booking
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = addBookingController;
