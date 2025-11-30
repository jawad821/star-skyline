const { query } = require('../config/db');
const { calculateFare } = require('../utils/fareCalculator');

const bookingController = {
  async getAllBookings(req, res, next) {
    try {
      const { booking_type, limit = 30, offset = 0 } = req.query;
      
      let whereClause = '';
      let params = [];
      
      if (booking_type && booking_type !== 'all') {
        whereClause = 'WHERE b.booking_type = $1';
        params.push(booking_type);
      }
      
      const paramOffset = params.length + 1;
      const paramLimit = params.length + 2;
      
      const result = await query(`
        SELECT b.*, 
               d.name as driver_name
        FROM bookings b
        LEFT JOIN drivers d ON b.driver_id = d.id
        ${whereClause}
        ORDER BY b.created_at DESC 
        LIMIT $${paramLimit} OFFSET $${paramOffset}
      `, [...params, parseInt(limit) || 30, parseInt(offset) || 0]);
      
      const countResult = await query(`
        SELECT COUNT(*) as total FROM bookings b ${whereClause}
      `, params);
      
      console.log(`✅ [BAREERAH] Found ${result.rows.length} of ${countResult.rows[0].total} bookings`);
      res.json({ 
        success: true, 
        data: result.rows || [],
        pagination: {
          limit: parseInt(limit) || 30,
          offset: parseInt(offset) || 0,
          total: parseInt(countResult.rows[0].total)
        }
      });
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
      
      const booking = result.rows[0];
      if (booking) {
        const stopsResult = await query(`
          SELECT * FROM booking_stops WHERE booking_id = $1 ORDER BY stop_number ASC
        `, [id]);
        booking.stops = stopsResult.rows || [];
      }
      
      res.json({ success: true, data: booking || null });
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
      
      const fare_result = await calculateFare(req.body.booking_type, req.body.vehicle_type, req.body.distance_km, req.body.hours);
      
      console.log('✅ Fare calculated:', fare_result.fare, 'AED');
      res.json({ success: true, data: fare_result });
    } catch (error) {
      console.log('❌ [BAREERAH] Error calculating fare:', error.message);
      next(error);
    }
  },

  async createBooking(req, res, next) {
    try {
      const { booking_type } = req.body;
      
      if (booking_type === 'multi_stop') {
        return this.createMultiStopBooking(req, res, next);
      } else if (booking_type === 'round_trip') {
        return this.createRoundTripBooking(req, res, next);
      }
      
      // Point-to-point or default booking - use addBookingController
      const addBookingController = require('./addBookingController');
      return addBookingController.createManualBooking(req, res, next);
    } catch (error) {
      next(error);
    }
  },

  async updateBooking(req, res, next) {
    try {
      res.json({ success: true, data: { message: 'Booking updated' } });
    } catch (error) {
      next(error);
    }
  },

  async assignVehicle(req, res, next) {
    try {
      res.json({ success: true, data: { message: 'Vehicle assigned' } });
    } catch (error) {
      next(error);
    }
  },

  async assignDriver(req, res, next) {
    try {
      res.json({ success: true, data: { message: 'Driver assigned' } });
    } catch (error) {
      next(error);
    }
  },

  async assignVehicleType(req, res, next) {
    try {
      res.json({ success: true, data: { message: 'Vehicle type assigned' } });
    } catch (error) {
      next(error);
    }
  },

  async resendNotifications(req, res, next) {
    try {
      res.json({ success: true, data: { message: 'Notifications resent' } });
    } catch (error) {
      next(error);
    }
  },

  async createMultiStopBooking(req, res, next) {
    try {
      const { customer_name, customer_phone, customer_email, vehicle_type, vehicle_model, vehicle_color, assigned_vehicle_id, passengers_count, luggage_count, stops, notes, booking_source } = req.body;
      if (!stops || stops.length < 2) throw new Error('Requires minimum 2 stops');
      
      const rates = { 'executive': { base: 50, per_km: 3.5, waiting: 25 }, 'luxury': { base: 60, per_km: 4, waiting: 30 }, 'mini_bus': { base: 70, per_km: 3, waiting: 20 }, 'classic': { base: 40, per_km: 2.5, waiting: 15 }, 'suv': { base: 55, per_km: 3.75, waiting: 28 } };
      const rate = rates[vehicle_type.toLowerCase()] || rates['executive'];
      let totalDist = 0, totalWait = 0;
      for (let i = 1; i < stops.length; i++) { totalDist += (stops[i].distance_from_previous || 0); totalWait += (stops[i].duration_minutes || 0); }
      const fare = Math.round((rate.base + (totalDist * rate.per_km) + ((totalWait / 60) * rate.waiting)) * 100) / 100;
      
      const bookingResult = await query(`INSERT INTO bookings (customer_name, customer_phone, customer_email, booking_type, vehicle_type, vehicle_model, vehicle_color, assigned_vehicle_id, passengers_count, luggage_count, pickup_location, dropoff_location, distance_km, fare_aed, notes, booking_source, status) VALUES ($1, $2, $3, 'multi_stop', $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'pending') RETURNING *`, [customer_name, customer_phone, customer_email || null, vehicle_type, vehicle_model || null, vehicle_color || null, assigned_vehicle_id || null, passengers_count || 1, luggage_count || 0, stops[0].location, stops[stops.length - 1].location, totalDist, fare, notes, booking_source || 'bareerah_ai']);
      const booking = bookingResult.rows[0];
      
      for (let i = 0; i < stops.length; i++) {
        await query(`INSERT INTO booking_stops (booking_id, stop_number, location, stop_type, duration_minutes) VALUES ($1, $2, $3, $4, $5)`, [booking.id, i + 1, stops[i].location, stops[i].stop_type, stops[i].duration_minutes || 0]);
      }
      
      const stopsData = await query('SELECT * FROM booking_stops WHERE booking_id = $1 ORDER BY stop_number', [booking.id]);
      if (customer_email) {
        try {
          const emailService = require('../utils/emailService');
          const emailResult = await emailService.sendCustomerNotification(booking, null);
          console.log('✅ [BOOKING] Email sent for booking', booking.id, emailResult);
        } catch (emailError) {
          console.error('❌ [BOOKING] Email failed for booking', booking.id, emailError.message);
        }
      }
      res.json({ success: true, data: { ...booking, stops: stopsData.rows } });
    } catch (error) { next(error); }
  },

  async createRoundTripBooking(req, res, next) {
    try {
      const { customer_name, customer_phone, customer_email, vehicle_type, vehicle_model, vehicle_color, assigned_vehicle_id, passengers_count, luggage_count, pickup_location, meeting_location, return_after_hours, distance_km, notes, booking_source } = req.body;
      if (!pickup_location || !meeting_location || !return_after_hours) throw new Error('Missing required fields');
      
      const rates = { 'executive': { base: 50, per_km: 3.5, waiting: 25 }, 'luxury': { base: 60, per_km: 4, waiting: 30 }, 'mini_bus': { base: 70, per_km: 3, waiting: 20 }, 'classic': { base: 40, per_km: 2.5, waiting: 15 }, 'suv': { base: 55, per_km: 3.75, waiting: 28 } };
      const rate = rates[vehicle_type.toLowerCase()] || rates['executive'];
      const distKm = distance_km || 25;
      const totalDist = distKm * 2;
      const fare = Math.round(((rate.base * 2) + (totalDist * rate.per_km) + (return_after_hours * rate.waiting)) * 100) / 100;
      
      const bookingResult = await query(`INSERT INTO bookings (customer_name, customer_phone, customer_email, booking_type, vehicle_type, vehicle_model, vehicle_color, assigned_vehicle_id, passengers_count, luggage_count, pickup_location, dropoff_location, distance_km, fare_aed, notes, booking_source, status) VALUES ($1, $2, $3, 'round_trip', $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'pending') RETURNING *`, [customer_name, customer_phone, customer_email || null, vehicle_type, vehicle_model || null, vehicle_color || null, assigned_vehicle_id || null, passengers_count || 1, luggage_count || 0, pickup_location, pickup_location, totalDist, fare, notes, booking_source || 'bareerah_ai']);
      const booking = bookingResult.rows[0];
      
      const stops = [[booking.id, 1, pickup_location, 'pickup', 0], [booking.id, 2, meeting_location, 'intermediate', return_after_hours * 60], [booking.id, 3, pickup_location, 'dropoff', 0]];
      for (const stop of stops) { await query(`INSERT INTO booking_stops (booking_id, stop_number, location, stop_type, duration_minutes) VALUES ($1, $2, $3, $4, $5)`, stop); }
      
      const stopsData = await query('SELECT * FROM booking_stops WHERE booking_id = $1 ORDER BY stop_number', [booking.id]);
      if (customer_email) {
        try {
          const emailService = require('../utils/emailService');
          const emailResult = await emailService.sendCustomerNotification(booking, null);
          console.log('✅ [BOOKING] Email sent for round-trip booking', booking.id, emailResult);
        } catch (emailError) {
          console.error('❌ [BOOKING] Email failed for round-trip booking', booking.id, emailError.message);
        }
      }
      res.json({ success: true, data: { ...booking, stops: stopsData.rows, return_after_hours } });
    } catch (error) { next(error); }
  }
};

module.exports = bookingController;
