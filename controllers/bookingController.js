const { query } = require('../config/db');
const { calculateFare } = require('../utils/fareCalculator');
const bookingService = require('../services/bookingService');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');
const notificationService = require('../services/notificationService');

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
        OFFSET $${paramOffset} LIMIT $${paramLimit}
      `, [...params, parseInt(offset) || 0, parseInt(limit) || 30]);

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
      const { id } = req.params;
      const body = req.body || {};
      const auditLogger = require('../utils/auditLogger');
      const booking = await query('SELECT * FROM bookings WHERE id = $1', [id]).then(r => r.rows[0]);
      if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' });
      const user = req.user || { username: 'unknown', role: 'system' };

      let updatedBooking = booking;

      // If assigned_vehicle_id provided, use bookingService to assign (includes validation)
      if (body.assigned_vehicle_id) {
        updatedBooking = await bookingService.assignVehicle(id, body.assigned_vehicle_id, booking.passengers_count || 1, booking.luggage_count || 0);
      }

      // If driver_id provided, assign driver
      if (body.driver_id) {
        updatedBooking = await Booking.assignDriver(id, body.driver_id);
      }

      // Handle Status Change & Vehicle Release
      if (body.status && body.status !== booking.status) {
        updatedBooking = await Booking.updateStatus(id, body.status);

        // If finished, release the vehicle
        if ((body.status === 'completed' || body.status === 'cancelled') && updatedBooking.assigned_vehicle_id) {
          await Vehicle.updateStatus(updatedBooking.assigned_vehicle_id, 'available');
          console.log(`✅ [BOOKING] Released vehicle ${updatedBooking.assigned_vehicle_id} (booking ${id} ${body.status})`);
        }
      }

      // Optionally update notes
      if (typeof body.notes !== 'undefined') {
        await Booking.updateNotes(id, body.notes);
      }

      // Fetch fresh booking
      const freshBooking = await Booking.findById(id);

      // Audit Log
      const changes = {};
      for (const key in body) {
        if (booking[key] != freshBooking[key]) {
          changes[key] = { old: booking[key], new: freshBooking[key] };
        }
      }
      // Check assignment changes specifically if not in body directly but side-effect
      if (booking.driver_id !== freshBooking.driver_id) changes.driver_id = { old: booking.driver_id, new: freshBooking.driver_id };
      if (booking.assigned_vehicle_id !== freshBooking.assigned_vehicle_id) changes.assigned_vehicle_id = { old: booking.assigned_vehicle_id, new: freshBooking.assigned_vehicle_id };

      if (Object.keys(changes).length > 0) {
        await auditLogger.logChange('booking', id, 'UPDATE', changes, user.id || user.username, user.username, user.role).catch(console.error);
      }

      // Send notifications (non-blocking) based on user selection
      const notifications = body.notifications_to_send || {};
      const sendCustomer = notifications.customer || {};
      const sendDriver = notifications.driver || {};

      (async () => {
        try {
          // Customer notifications
          if (sendCustomer.whatsapp || sendCustomer.email) {
            try {
              if (sendCustomer.whatsapp && freshBooking.customer_phone) {
                // Check if driver is assigned and send correct notification
                if (freshBooking.driver_id) {
                  const driverRes = await query('SELECT * FROM drivers WHERE id = $1', [freshBooking.driver_id]);
                  const driver = driverRes.rows[0];

                  let vehicle = null;
                  if (freshBooking.assigned_vehicle_id) {
                    const vehicleRes = await query('SELECT * FROM vehicles WHERE id = $1', [freshBooking.assigned_vehicle_id]);
                    vehicle = vehicleRes.rows[0];
                  }

                  if (driver) {
                    await notificationService.sendDriverAssignedNotification(freshBooking, driver, vehicle);
                  } else {
                    // Fallback if driver not found (unlikely)
                    await notificationService.sendWhatsAppToCustomer(freshBooking.customer_phone, freshBooking);
                  }
                } else {
                  // No driver, send generic confirmation
                  await notificationService.sendWhatsAppToCustomer(freshBooking.customer_phone, freshBooking);
                }
              }
              if (sendCustomer.email && freshBooking.customer_email) {
                await notificationService.sendEmailToCustomer(freshBooking.customer_email, freshBooking);
              }
            } catch (e) {
              console.error('Customer notification error:', e);
            }
          }

          // Driver notifications
          if (sendDriver.whatsapp || sendDriver.email) {
            try {
              let driver = null;
              if (freshBooking.driver_id) {
                const driverRes = await query('SELECT * FROM drivers WHERE id = $1', [freshBooking.driver_id]);
                driver = driverRes.rows[0];
              } else if (freshBooking.assigned_vehicle_id) {
                // If no direct driver, check vehicle's default driver
                const vehicle = await Vehicle.findById(freshBooking.assigned_vehicle_id);
                if (vehicle) driver = { phone: vehicle.driver_phone, email: vehicle.driver_email };
              }

              if (driver) {
                if (sendDriver.whatsapp && driver.phone) {
                  await notificationService.sendWhatsAppToDriver(driver.phone, freshBooking);
                }
                if (sendDriver.email && driver.email) {
                  await notificationService.sendEmailToDriver(driver.email, freshBooking);
                }
              }
            } catch (e) {
              console.error('Driver notification error:', e);
            }
          }

        } catch (err) {
          console.error('Notification background task error:', err);
        }
      })();

      res.json({ success: true, data: freshBooking, message: 'Booking updated and notifications queued' });
    } catch (error) {
      next(error);
    }
  },

  async assignVehicle(req, res, next) {
    try {
      const { booking_id, vehicle_id } = req.body;
      if (!booking_id || !vehicle_id) {
        return res.status(400).json({ success: false, error: 'booking_id and vehicle_id required' });
      }

      const auditLogger = require('../utils/auditLogger');
      const user = req.user || { username: 'unknown', role: 'system' };
      // fetch booking to get passenger/luggage counts
      const booking = await Booking.findById(booking_id);
      if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' });
      const passengers = booking.passengers_count || 1;
      const luggage = booking.luggage_count || 0;

      const updatedBooking = await bookingService.assignVehicle(booking_id, vehicle_id, passengers, luggage);

      await auditLogger.logChange('booking', booking_id, 'UPDATE', { assigned_vehicle_id: { old: booking.assigned_vehicle_id, new: vehicle_id } }, user.id || user.username, user.username, user.role).catch(console.error);

      const vehicle = await Vehicle.findById(vehicle_id);

      // Notify customer
      try {
        await notificationService.sendWhatsAppToCustomer(booking.customer_phone, updatedBooking);
        if (booking.customer_email) await notificationService.sendEmailToCustomer(booking.customer_email, updatedBooking);
      } catch (e) { console.error('Customer notification error:', e); }

      // Notify driver assigned to vehicle
      try {
        if (vehicle && vehicle.driver_phone) {
          const bookingData = {
            id: updatedBooking.id,
            pickup_location: updatedBooking.pickup_location,
            dropoff_location: updatedBooking.dropoff_location,
            customer_name: updatedBooking.customer_name,
            customer_phone: updatedBooking.customer_phone,
            vehicle_model: vehicle.model
          };
          await notificationService.sendWhatsAppToDriver(vehicle.driver_phone, bookingData);
          if (vehicle.driver_email) {
            await notificationService.sendEmailToDriver(vehicle.driver_email, updatedBooking);
          }
        }
      } catch (e) { console.error('Driver notification error:', e); }

      res.json({ success: true, data: updatedBooking });
    } catch (error) {
      next(error);
    }
  },

  async assignDriver(req, res, next) {
    try {
      const { booking_id, driver_id } = req.body;
      if (!booking_id || !driver_id) {
        return res.status(400).json({ success: false, error: 'booking_id and driver_id required' });
      }

      const auditLogger = require('../utils/auditLogger');
      const user = req.user || { username: 'unknown', role: 'system' };
      const booking = await Booking.findById(booking_id);

      const updatedBooking = await Booking.assignDriver(booking_id, driver_id);

      await auditLogger.logChange('booking', booking_id, 'UPDATE', { driver_id: { old: booking.driver_id, new: driver_id } }, user.id || user.username, user.username, user.role).catch(console.error);

      const db = require('../config/db');
      const driverResult = await db.query('SELECT * FROM drivers WHERE id = $1', [driver_id]);
      const driver = driverResult.rows[0];

      // Fetch vehicle details if assigned
      let vehicle = null;
      if (updatedBooking.assigned_vehicle_id) {
        const vehicleResult = await db.query('SELECT * FROM vehicles WHERE id = $1', [updatedBooking.assigned_vehicle_id]);
        vehicle = vehicleResult.rows[0];
      }

      // notify customer and driver
      try {
        // Fix: Send driver details to customer instead of just confirmation
        if (driver) {
          await notificationService.sendDriverAssignedNotification(updatedBooking, driver, vehicle);
        } else {
          // Fallback if something weird happens (should have driver)
          await notificationService.sendWhatsAppToCustomer(updatedBooking.customer_phone, updatedBooking);
        }
      } catch (e) { console.error('Customer WhatsApp error:', e); }

      try {
        if (driver) {
          await notificationService.sendWhatsAppToDriver(driver.phone, booking);
          if (driver.email) await notificationService.sendEmailToDriver(driver.email, booking);
        }
      } catch (e) { console.error('Driver notification error:', e); }

      res.json({ success: true, data: updatedBooking });
    } catch (error) {
      next(error);
    }
  },

  async deleteBooking(req, res, next) {
    try {
      const { id } = req.params;
      const Booking = require('../models/Booking');
      const Vehicle = require('../models/Vehicle');
      const auditLogger = require('../utils/auditLogger');
      const user = req.user || { username: 'unknown', role: 'system' };
      const oldBooking = await Booking.findById(id);
      if (!oldBooking) return res.status(404).json({ success: false, error: 'Booking not found' });

      // If booking had an assigned vehicle, release it
      if (oldBooking.assigned_vehicle_id) {
        await Vehicle.updateStatus(oldBooking.assigned_vehicle_id, 'available');
      }

      const deleted = await Booking.deleteBooking(id);

      await auditLogger.logChange('booking', id, 'DELETE', { status: { old: oldBooking.status, new: 'deleted' } }, user.id || user.username, user.username, user.role).catch(console.error);

      res.json({ success: true, message: 'Booking cancelled (soft delete)', data: deleted });
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
