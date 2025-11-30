const bookingService = require('../services/bookingService');
const { query } = require('../config/db');

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
      const { status, driver_id, assigned_vehicle_id, payment_method } = req.body;
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
  }
};

module.exports = bookingController;

// Trigger rating email scheduler
const ratingScheduler = require('../utils/ratingScheduler');

// Schedule rating emails when booking is marked complete
async function scheduleRatingIfCompleted(booking) {
  if (booking.status === 'completed') {
    ratingScheduler.scheduleRatingEmail(booking.id, 120000); // 2 minutes
  }
}

module.exports = { ...module.exports, scheduleRatingIfCompleted: scheduleRatingIfCompleted };
