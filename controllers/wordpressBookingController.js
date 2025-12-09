const { query } = require('../config/db');
const { calculateFare } = require('../utils/fareCalculator');

const wordpressBookingController = {
  /**
   * Public endpoint for WordPress to submit bookings
   * No authentication required
   */
  async createWordPressBooking(req, res, next) {
    try {
      const {
        customer_name,
        customer_email,
        customer_phone,
        customer_whatsapp,
        pickup_location,
        dropoff_location,
        pickup_date,
        pickup_time,
        return_date,
        return_time,
        vehicle_type,
        booking_type = 'point_to_point',
        passengers_count = 1,
        luggage_count = 0,
        notes,
        payment_method = 'cash',
        distance_km,
        fare_aed,
        stop_on_way,
        stop_location,
        child_seats,
        wordpress_booking_id
      } = req.body;

      // Validate required fields
      const required = ['customer_name', 'customer_email', 'customer_phone', 'pickup_location', 'dropoff_location', 'vehicle_type'];
      const missing = required.filter(f => !req.body[f]);
      if (missing.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Missing required fields: ${missing.join(', ')}`,
          required_fields: required
        });
      }

      // Check for duplicate WordPress booking
      if (wordpress_booking_id) {
        const existing = await query(
          'SELECT id, fare_aed, status FROM bookings WHERE external_id = $1',
          [wordpress_booking_id]
        );
        if (existing.rows.length > 0) {
          return res.json({
            success: true,
            message: 'Booking already exists (idempotent)',
            booking_id: existing.rows[0].id,
            fare: parseFloat(existing.rows[0].fare_aed),
            status: existing.rows[0].status,
            idempotent: true
          });
        }
      }

      // Calculate distance if not provided
      let finalDistance = distance_km || 15; // Default 15km

      // Use provided fare_aed from the form, or calculate it
      let finalFare = parseFloat(fare_aed) || 0;
      if (finalFare <= 0) {
        try {
          const fareCalc = await calculateFare(booking_type, vehicle_type, finalDistance, 0);
          finalFare = fareCalc.fare_after_discount || 99;
        } catch (fareErr) {
          console.log('Fare calculation failed:', fareErr.message);
          finalFare = 99; // Default fallback
        }
      }

      // Build notes with all extras and schedule info
      let finalNotes = notes || '';
      if (pickup_date) {
        finalNotes += ` | Pickup: ${pickup_date}`;
      }
      if (pickup_time) {
        finalNotes += ` @ ${pickup_time}`;
      }
      if (return_date) {
        finalNotes += ` | Return: ${return_date} @ ${return_time || 'TBD'}`;
      }
      if (stop_on_way && stop_location) {
        finalNotes += ` | Stop: ${stop_location}`;
      }
      if (child_seats > 0) {
        finalNotes += ` | Child Seats: ${child_seats}`;
      }
      if (customer_whatsapp && customer_whatsapp !== customer_phone) {
        finalNotes += ` | WhatsApp: ${customer_whatsapp}`;
      }

      // Create booking
      const bookingResult = await query(`
        INSERT INTO bookings (
          external_id, customer_name, customer_email, customer_phone,
          pickup_location, dropoff_location, vehicle_type, booking_type, 
          passengers_count, luggage_count, distance_km, fare_aed, 
          payment_method, notes, booking_source, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'pending')
        RETURNING id, created_at
      `, [
        wordpress_booking_id || null,
        customer_name,
        customer_email,
        customer_phone,
        pickup_location,
        dropoff_location,
        vehicle_type,
        booking_type,
        passengers_count,
        luggage_count,
        finalDistance,
        finalFare,
        payment_method,
        finalNotes.trim() || null,
        'wordpress'
      ]);

      const bookingId = bookingResult.rows[0].id;
      const createdAt = bookingResult.rows[0].created_at;

      // Try to auto-assign a vehicle
      let assignedVehicle = null;
      try {
        const vehicleResult = await query(`
          SELECT v.id, v.model, v.color, v.driver_id, v.vendor_id
          FROM vehicles v
          WHERE v.vehicle_type = $1 AND v.status = 'available'
          ORDER BY v.created_at ASC
          LIMIT 1
        `, [vehicle_type]);

        if (vehicleResult.rows.length > 0) {
          const vehicle = vehicleResult.rows[0];
          assignedVehicle = {
            id: vehicle.id,
            model: vehicle.model,
            color: vehicle.color,
            driver_id: vehicle.driver_id
          };

          // Update booking with vehicle assignment
          await query(`
            UPDATE bookings
            SET assigned_vehicle_id = $1, status = 'assigned'
            WHERE id = $2
          `, [vehicle.id, bookingId]);

          // Mark vehicle as on trip
          await query('UPDATE vehicles SET status = $1 WHERE id = $2', ['on_trip', vehicle.id]);
        }
      } catch (e) {
        console.log('⚠️  Auto-assignment failed:', e.message);
        // Continue anyway - booking is still created
      }

      res.status(201).json({
        success: true,
        message: 'Booking created successfully from WordPress',
        data: {
          booking_id: bookingId,
          external_id: wordpress_booking_id,
          customer_name,
          customer_email,
          customer_phone,
          pickup_location,
          dropoff_location,
          vehicle_type,
          booking_type,
          passengers_count,
          luggage_count,
          distance_km: finalDistance,
          fare_aed: finalFare,
          payment_method,
          status: assignedVehicle ? 'assigned' : 'pending',
          assigned_vehicle: assignedVehicle,
          created_at: createdAt,
          booking_source: 'wordpress'
        }
      });
    } catch (error) {
      console.error('WordPress booking error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create booking',
        message: error.message
      });
    }
  },

  /**
   * Public endpoint to calculate fare before booking
   * WordPress can call this to show customer the fare
   */
  async calculateWordPressFare(req, res, next) {
    try {
      const { vehicle_type, booking_type = 'point_to_point', distance_km = 15 } = req.body;

      if (!vehicle_type) {
        return res.status(400).json({
          success: false,
          error: 'vehicle_type is required'
        });
      }

      const fare = await calculateFare(booking_type, vehicle_type, distance_km, 0);

      res.json({
        success: true,
        data: {
          vehicle_type,
          booking_type,
          distance_km,
          base_fare: parseFloat(fare.base_fare || fare.fare || 0).toFixed(2),
          discount_percentage: 0,
          final_fare: parseFloat(fare.fare || 0).toFixed(2),
          currency: 'AED'
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to calculate fare',
        message: error.message
      });
    }
  }
};

module.exports = wordpressBookingController;
