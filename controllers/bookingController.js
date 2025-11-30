const bookingService = require('../services/bookingService');
const { query } = require('../config/db');

// Inline fare calculation helpers
function calculateMultiStopFareInline(vehicleType, stops) {
  const rates = {
    'executive': { base: 50, per_km: 3.50, waiting_hour: 25 },
    'luxury': { base: 60, per_km: 4.00, waiting_hour: 30 },
    'mini_bus': { base: 70, per_km: 3.00, waiting_hour: 20 },
    'classic': { base: 40, per_km: 2.50, waiting_hour: 15 },
    'suv': { base: 55, per_km: 3.75, waiting_hour: 28 },
    'sedan': { base: 45, per_km: 3.00, waiting_hour: 20 }
  };
  
  const rate = rates[vehicleType.toLowerCase()] || rates['executive'];
  let totalDist = 0, totalWait = 0;
  if (stops && stops.length >= 2) {
    for (let i = 1; i < stops.length; i++) {
      totalDist += (stops[i].distance_from_previous || 0);
      totalWait += (stops[i].duration_minutes || 0);
    }
  }
  
  const baseFare = rate.base;
  const distFare = totalDist * rate.per_km;
  const waitFare = (totalWait / 60) * rate.waiting_hour;
  return Math.round((baseFare + distFare + waitFare) * 100) / 100;
}

function calculateRoundTripFareInline(vehicleType, distanceKm, returnAfterHours) {
  const rates = {
    'executive': { base: 50, per_km: 3.50, waiting_hour: 25 },
    'luxury': { base: 60, per_km: 4.00, waiting_hour: 30 },
    'mini_bus': { base: 70, per_km: 3.00, waiting_hour: 20 },
    'classic': { base: 40, per_km: 2.50, waiting_hour: 15 },
    'suv': { base: 55, per_km: 3.75, waiting_hour: 28 },
    'sedan': { base: 45, per_km: 3.00, waiting_hour: 20 }
  };
  
  const rate = rates[vehicleType.toLowerCase()] || rates['executive'];
  const totalDist = (distanceKm || 25) * 2;
  const baseFare = rate.base * 2;
  const distFare = totalDist * rate.per_km;
  const waitFare = (returnAfterHours || 0) * rate.waiting_hour;
  return Math.round((baseFare + distFare + waitFare) * 100) / 100;
}

const bookingController = {
  async getAllBookings(req, res, next) {
    try {
      console.log('📊 [BAREERAH] Fetching all bookings...');
      const result = await query(`
        SELECT b.*, 
               d.name as driver_name
        FROM bookings b
        LEFT JOIN drivers d ON b.driver_id = d.id
        ORDER BY b.created_at DESC LIMIT 1000
      `);
      console.log(`✅ [BAREERAH] Found ${result.rows.length} bookings`);
      res.json({ success: true, data: result.rows || [] });
    } catch (error) {
      console.log('❌ [BAREERAH] Error fetching bookings:', error.message);
      next(error);
    }
  },

  async getBookingById(req, res, next) {
    try {
      const { id } = req.params;
      const result = await query(`
        SELECT b.*, 
               d.name as driver_name,
               v.model as assigned_vehicle_model
        FROM bookings b
        LEFT JOIN drivers d ON b.driver_id = d.id
        LEFT JOIN vehicles v ON b.assigned_vehicle_id = v.id
        WHERE b.id = $1
      `, [id]);
      
      if (result.rows[0]) {
        const stopsResult = await query(
          'SELECT * FROM booking_stops WHERE booking_id = $1 ORDER BY stop_number',
          [id]
        );
        result.rows[0].stops = stopsResult.rows || [];
      }
      
      res.json({ success: true, data: result.rows[0] || null });
    } catch (error) {
      next(error);
    }
  },

  async createMultiStopBooking(req, res, next) {
    try {
      const { customer_name, customer_phone, vehicle_type, passengers_count, luggage_count, stops, notes, booking_source } = req.body;
      
      if (!stops || stops.length < 2) {
        return res.status(400).json({ success: false, error: 'Multi-stop requires at least 2 stops' });
      }

      const Booking = require('../models/Booking');
      const booking = await Booking.create({
        customer_name,
        customer_phone,
        booking_type: 'multi_stop',
        vehicle_type,
        passengers_count: passengers_count || 1,
        luggage_count: luggage_count || 0,
        pickup_location: stops[0].location,
        dropoff_location: stops[stops.length - 1].location,
        notes,
        booking_source: booking_source || 'bareerah_ai'
      });

      // Insert stops
      for (let i = 0; i < stops.length; i++) {
        await query(
          `INSERT INTO booking_stops (booking_id, stop_number, location, stop_type, duration_minutes)
           VALUES ($1, $2, $3, $4, $5)`,
          [booking.id, i + 1, stops[i].location, stops[i].stop_type, stops[i].duration_minutes || 0]
        );
      }

      const fare = calculateMultiStopFareInline(vehicle_type, stops);
      
      const updatedBooking = await query(
        'UPDATE bookings SET fare_aed = $1 WHERE id = $2 RETURNING *',
        [fare, booking.id]
      );

      const stopsData = await query(
        'SELECT * FROM booking_stops WHERE booking_id = $1 ORDER BY stop_number',
        [booking.id]
      );

      res.json({
        success: true,
        data: {
          ...updatedBooking.rows[0],
          stops: stopsData.rows
        }
      });
    } catch (error) {
      next(error);
    }
  },

  async createRoundTripBooking(req, res, next) {
    try {
      const { customer_name, customer_phone, vehicle_type, passengers_count, luggage_count, 
              pickup_location, meeting_location, return_after_hours, distance_km, notes, booking_source } = req.body;

      if (!pickup_location || !meeting_location || !return_after_hours) {
        return res.status(400).json({ success: false, error: 'Round-trip requires pickup, meeting, and return hours' });
      }

      const Booking = require('../models/Booking');
      const distanceKm = distance_km || 25;
      
      const booking = await Booking.create({
        customer_name,
        customer_phone,
        booking_type: 'round_trip',
        vehicle_type,
        passengers_count: passengers_count || 1,
        luggage_count: luggage_count || 0,
        pickup_location,
        dropoff_location: pickup_location,
        distance_km: distanceKm * 2,
        notes: notes || `Round-trip - ${return_after_hours}h at ${meeting_location}`,
        booking_source: booking_source || 'bareerah_ai'
      });

      // Create 3-stop round trip
      const stops = [
        { number: 1, location: pickup_location, stop_type: 'pickup', duration_minutes: 0 },
        { number: 2, location: meeting_location, stop_type: 'intermediate', duration_minutes: return_after_hours * 60 },
        { number: 3, location: pickup_location, stop_type: 'dropoff', duration_minutes: 0 }
      ];

      for (const stop of stops) {
        await query(
          `INSERT INTO booking_stops (booking_id, stop_number, location, stop_type, duration_minutes)
           VALUES ($1, $2, $3, $4, $5)`,
          [booking.id, stop.number, stop.location, stop.stop_type, stop.duration_minutes]
        );
      }

      const fare = calculateRoundTripFareInline(vehicle_type, distanceKm, return_after_hours);

      const updatedBooking = await query(
        'UPDATE bookings SET fare_aed = $1 WHERE id = $2 RETURNING *',
        [fare, booking.id]
      );

      const stopsData = await query(
        'SELECT * FROM booking_stops WHERE booking_id = $1 ORDER BY stop_number',
        [booking.id]
      );

      res.json({
        success: true,
        data: {
          ...updatedBooking.rows[0],
          stops: stopsData.rows,
          return_after_hours
        }
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = bookingController;
        SELECT b.*, 
               d.name as driver_name
        FROM bookings b
        LEFT JOIN drivers d ON b.driver_id = d.id
        ORDER BY b.created_at DESC LIMIT 1000
      `);
      console.log(`✅ [BAREERAH] Found ${result.rows.length} bookings`);
      res.json({ success: true, data: result.rows || [] });
    } catch (error) {
      console.log('❌ [BAREERAH] Error fetching bookings:', error.message);
      next(error);
    }
  },

  async getBookingById(req, res, next) {
    try {
      const { id } = req.params;
      const result = await query(`
        SELECT b.*, 
               d.name as driver_name,
               v.model as assigned_vehicle_model
        FROM bookings b
        LEFT JOIN drivers d ON b.driver_id = d.id
        LEFT JOIN vehicles v ON b.assigned_vehicle_id = v.id
        WHERE b.id = $1
      `, [id]);
      res.json({ success: true, data: result.rows[0] || null });
    } catch (error) {
      next(error);
    }
  },

  async calculateFare(req, res, next) {
    try {
      console.log('💰 [BAREERAH] Calculating fare...');
      console.log('   🚗 Vehicle Type:', req.body.vehicle_type);
      console.log('   📏 Distance:', req.body.distance_km, 'km');
      console.log('   ⏱️  Time:', req.body.time_minutes, 'minutes');
      
      const fare = await bookingService.calculateFare(req.body);
      
      console.log('✅ [BAREERAH] Fare calculated:', {
        base: fare.base_fare || 0,
        perKm: fare.per_km_rate || 0,
        total: fare.fare || 0
      });
      
      res.json({
        success: true,
        data: fare
      });
    } catch (error) {
      console.log('❌ [BAREERAH] Fare calculation failed:', error.message);
      next(error);
    }
  },

  async createBooking(req, res, next) {
    try {
      console.log('\n🎯 [BAREERAH] Creating new booking...');
      console.log('   👤 Customer:', req.body.customer_name);
      console.log('   📱 Phone:', req.body.customer_phone);
      console.log('   📍 Pickup:', req.body.pickup_location);
      console.log('   📍 Dropoff:', req.body.dropoff_location);
      console.log('   🚗 Vehicle Type:', req.body.vehicle_type);
      console.log('   👥 Passengers:', req.body.passengers_count);
      console.log('   🧳 Luggage:', req.body.luggage_count);
      console.log('   📊 Booking Type:', req.body.booking_type);
      console.log('   📏 Distance:', req.body.distance_km, 'km');
      
      // Validate payload first
      const bareerahService = require('../services/bareerahBookingService');
      bareerahService.validateBareerahPayload(req.body);
      
      // Create with retry logic
      const result = await bareerahService.createBookingWithRetry(req.body);
      
      console.log('✅ [BAREERAH] Booking created successfully!');
      console.log('   🆔 Booking ID:', result.booking_id);
      console.log('   💰 Fare: AED', result.fare);
      console.log('   🚗 Vehicle:', result.vehicle?.model || '⏳ Pending');
      console.log('   Retry attempts:', result.retry_attempts);
      
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      console.log('❌ [BAREERAH] Booking creation failed!');
      console.log('   Error Code:', error.code || error.statusCode);
      console.log('   Error:', error.message);
      next(error);
    }
  },

  async assignVehicle(req, res, next) {
    try {
      const { booking_id, vehicle_id } = req.body;
      const booking = await bookingService.assignVehicle(booking_id, vehicle_id);
      res.json({
        success: true,
        booking
      });
    } catch (error) {
      next(error);
    }
  },

  async assignDriver(req, res, next) {
    try {
      const { booking_id, driver_id } = req.body;
      const Booking = require('../models/Booking');
      const booking = await Booking.assignDriver(booking_id, driver_id);
      if (!booking) {
        return res.status(404).json({ success: false, error: 'Booking not found' });
      }
      res.json({ success: true, message: 'Driver assigned successfully', booking });
    } catch (error) {
      next(error);
    }
  },

  async assignVehicleType(req, res, next) {
    try {
      const { booking_id, vehicle_id, vehicle_type } = req.body;
      const Booking = require('../models/Booking');
      const booking = await Booking.assignVehicleAndType(booking_id, vehicle_id, vehicle_type);
      if (!booking) {
        return res.status(404).json({ success: false, error: 'Booking not found' });
      }
      res.json({ success: true, message: 'Vehicle and type updated successfully', booking });
    } catch (error) {
      next(error);
    }
  },

  async updateBooking(req, res, next) {
    try {
      const { id } = req.params;
      const { status, driver_id, assigned_vehicle_id, payment_method, notes, vehicle_color } = req.body;
      const Booking = require('../models/Booking');
      const { query } = require('../config/db');
      
      let updateSql = 'UPDATE bookings SET updated_at = NOW()';
      const params = [];
      let paramIndex = 1;
      
      if (status) {
        updateSql += ', status = $' + (paramIndex);
        params.push(status);
        paramIndex++;
      }
      if (driver_id) {
        updateSql += ', driver_id = $' + (paramIndex);
        params.push(driver_id);
        paramIndex++;
      }
      if (assigned_vehicle_id) {
        updateSql += ', assigned_vehicle_id = $' + (paramIndex);
        params.push(assigned_vehicle_id);
        paramIndex++;
      }
      if (payment_method) {
        updateSql += ', payment_method = $' + (paramIndex);
        params.push(payment_method);
        paramIndex++;
      }
      if (notes !== undefined) {
        updateSql += ', notes = $' + (paramIndex);
        params.push(notes || null);
        paramIndex++;
      }
      if (vehicle_color !== undefined) {
        updateSql += ', vehicle_color = $' + (paramIndex);
        params.push(vehicle_color || null);
        paramIndex++;
      }
      
      updateSql += ' WHERE id = $' + (paramIndex) + ' RETURNING *';
      params.push(id);
      
      const result = await query(updateSql, params);
      if (!result.rows[0]) {
        return res.status(404).json({ success: false, error: 'Booking not found' });
      }
      
      res.json({ success: true, message: 'Booking updated', data: result.rows[0] });
    } catch (error) {
      next(error);
    }
  },

  async resendNotifications(req, res, next) {
    try {
      const { booking_id } = req.body;
      const Booking = require('../models/Booking');
      const booking = await Booking.findById(booking_id);
      
      if (!booking) {
        return res.status(404).json({ success: false, error: 'Booking not found' });
      }

      const emailService = require('../utils/emailService');
      await emailService.sendCustomerNotification(booking, null);
      
      res.json({ success: true, message: 'Notifications resent to customer' });
    } catch (error) {
      next(error);
    }
  },

  async createMultiStopBooking(req, res, next) {
    try {
      const { customer_name, customer_phone, vehicle_type, passengers_count, luggage_count, stops, notes, booking_source } = req.body;
      
      if (!stops || stops.length < 2) {
        throw new Error('Multi-stop booking requires at least 2 stops');
      }

      const Booking = require('../models/Booking');
      const booking = await Booking.create({
        customer_name,
        customer_phone,
        booking_type: 'multi_stop',
        vehicle_type,
        passengers_count: passengers_count || 1,
        luggage_count: luggage_count || 0,
        pickup_location: stops[0].location,
        dropoff_location: stops[stops.length - 1].location,
        notes,
        booking_source: booking_source || 'bareerah_ai'
      });

      // Insert stops
      for (let i = 0; i < stops.length; i++) {
        await query(
          `INSERT INTO booking_stops (booking_id, stop_number, location, stop_type, duration_minutes)
           VALUES ($1, $2, $3, $4, $5)`,
          [booking.id, i + 1, stops[i].location, stops[i].stop_type, stops[i].duration_minutes || 0]
        );
      }

      // Calculate fare
      const { calculateMultiStopFare } = require('../utils/fareCalculator');
      const fareData = calculateMultiStopFare(vehicle_type, stops);
      
      const updatedBooking = await query(
        'UPDATE bookings SET fare_aed = $1 WHERE id = $2 RETURNING *',
        [fare, booking.id]
      );

      const stopsData = await query(
        'SELECT * FROM booking_stops WHERE booking_id = $1 ORDER BY stop_number',
        [booking.id]
      );

      res.json({
        success: true,
        data: {
          ...updatedBooking.rows[0],
          stops: stopsData.rows,
          
        }
      });
    } catch (error) {
      next(error);
    }
  },

  async createRoundTripBooking(req, res, next) {
    try {
      const { customer_name, customer_phone, vehicle_type, passengers_count, luggage_count, 
              pickup_location, meeting_location, return_after_hours, notes, booking_source } = req.body;

      if (!pickup_location || !meeting_location || !return_after_hours) {
        throw new Error('Round-trip requires pickup_location, meeting_location, and return_after_hours');
      }

      const distanceKm = req.body.distance_km || 25;

      const Booking = require('../models/Booking');
      const booking = await Booking.create({
        customer_name,
        customer_phone,
        booking_type: 'round_trip',
        vehicle_type,
        passengers_count: passengers_count || 1,
        luggage_count: luggage_count || 0,
        pickup_location,
        dropoff_location: pickup_location,
        distance_km: distanceKm * 2,
        notes: notes || `Round-trip booking - ${return_after_hours} hours at ${meeting_location}`,
        booking_source: booking_source || 'bareerah_ai'
      });

      // Create stops
      const stops = [
        { number: 1, location: pickup_location, stop_type: 'pickup', duration_minutes: 0 },
        { number: 2, location: meeting_location, stop_type: 'intermediate', duration_minutes: return_after_hours * 60 },
        { number: 3, location: pickup_location, stop_type: 'dropoff', duration_minutes: 0 }
      ];

      for (const stop of stops) {
        await query(
          `INSERT INTO booking_stops (booking_id, stop_number, location, stop_type, duration_minutes)
           VALUES ($1, $2, $3, $4, $5)`,
          [booking.id, stop.number, stop.location, stop.stop_type, stop.duration_minutes]
        );
      }

      // Calculate fare
      const { calculateRoundTripFare } = require('../utils/fareCalculator');
      const fareData = calculateRoundTripFare(vehicle_type, distanceKm, return_after_hours);

      const updatedBooking = await query(
        'UPDATE bookings SET fare_aed = $1 WHERE id = $2 RETURNING *',
        [fare, booking.id]
      );

      const stopsData = await query(
        'SELECT * FROM booking_stops WHERE booking_id = $1 ORDER BY stop_number',
        [booking.id]
      );

      res.json({
        success: true,
        data: {
          ...updatedBooking.rows[0],
          stops: stopsData.rows,
          ,
          return_after_hours
        }
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = bookingController;
