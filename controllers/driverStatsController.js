const { query } = require('../config/db');
const logger = require('../utils/logger');
const emailService = require('../utils/emailService');
const notificationService = require('../services/notificationService');

const driverStatsController = {
  // Summary stats for selected date range
  async getSummary(req, res, next) {
    try {
      const driverId = req.user.id;
      const range = req.query.range || 'today';

      const dateRange = getDateRange(range);

      const result = await query(`
        SELECT 
          COUNT(*) as total_bookings,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_bookings,
          COALESCE(SUM(CASE WHEN status = 'completed' THEN fare_aed ELSE 0 END), 0) as total_earnings,
          4.8 as avg_rating
        FROM bookings
        WHERE driver_id = $1
        AND created_at >= $2 AND created_at <= $3
      `, [driverId, dateRange.start, dateRange.end]);

      const stats = result.rows[0] || {};
      res.json({
        success: true,
        data: {
          total_bookings: parseInt(stats.total_bookings) || 0,
          completed_bookings: parseInt(stats.completed_bookings) || 0,
          total_earnings: parseFloat(stats.total_earnings) || 0,
          avg_rating: parseFloat(stats.avg_rating) || 0
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // Bookings for driver
  async getBookings(req, res, next) {
    try {
      const driverId = req.user.id;
      const range = req.query.range || 'today';

      const dateRange = getDateRange(range);

      // Include recent active assignments even if created_at is outside the selected range.
      const result = await query(`
        SELECT 
          id, customer_name, customer_phone, pickup_location, dropoff_location, 
          fare_aed, status, created_at
        FROM bookings
        WHERE driver_id = $1
        AND (
          (created_at >= $2 AND created_at <= $3)
          OR status IN ('pending', 'assigned', 'on_trip')
        )
        ORDER BY created_at DESC
        LIMIT 200
      `, [driverId, dateRange.start, dateRange.end]);

      res.json({
        success: true,
        data: result.rows || []
      });
    } catch (error) {
      next(error);
    }
  },

  // Trends and charts data
  async getTrends(req, res, next) {
    try {
      const driverId = req.user.id;
      const range = req.query.range || 'today';

      const dateRange = getDateRange(range);

      // Bookings by day
      const bookingsResult = await query(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as count
        FROM bookings
        WHERE driver_id = $1
        AND created_at >= $2 AND created_at <= $3
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at) ASC
      `, [driverId, dateRange.start, dateRange.end]);

      // Earnings by status
      const earningsResult = await query(`
        SELECT 
          status,
          COALESCE(SUM(fare_aed), 0) as amount
        FROM bookings
        WHERE driver_id = $1
        AND created_at >= $2 AND created_at <= $3
        GROUP BY status
        `, [driverId, dateRange.start, dateRange.end]);

      const earnings = {};
      (earningsResult.rows || []).forEach(row => {
        earnings[row.status] = parseFloat(row.amount) || 0;
      });

      res.json({
        success: true,
        data: {
          bookings_by_day: (bookingsResult.rows || []).map(r => ({
            date: r.date ? new Date(r.date).toLocaleDateString() : 'N/A',
            count: parseInt(r.count) || 0
          })),
          earnings_by_status: {
            completed: earnings.completed || 0,
            cancelled: earnings.cancelled || 0,
            pending: earnings.pending || 0
          }
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // Earnings and payouts
  async getEarnings(req, res, next) {
    try {
      const driverId = req.user.id;

      // Total earnings
      const earningsResult = await query(`
        SELECT 
          COALESCE(SUM(CASE WHEN status = 'completed' THEN fare_aed ELSE 0 END), 0) as total_earnings,
          COALESCE(SUM(CASE WHEN status = 'pending' THEN fare_aed ELSE 0 END), 0) as pending_earnings
        FROM bookings
        WHERE driver_id = $1
      `, [driverId]);

      const earnings = earningsResult.rows[0] || {};

      // Payouts
      const payoutsResult = await query(`
        SELECT id, amount_aed, status, created_at, payment_date
        FROM payouts
        WHERE vendor_id = $1
        ORDER BY created_at DESC
        LIMIT 20
      `, [driverId]);

      const payouts = payoutsResult.rows || [];
      const lastPayout = payouts[0];

      res.json({
        success: true,
        data: {
          total_earnings: parseFloat(earnings.total_earnings) || 0,
          pending_earnings: parseFloat(earnings.pending_earnings) || 0,
          last_payout_amount: lastPayout ? parseFloat(lastPayout.amount_aed) : 0,
          last_payout_date: lastPayout ? lastPayout.payment_date || lastPayout.created_at : null,
          payouts: payouts.map(p => ({
            id: p.id,
            amount_aed: parseFloat(p.amount_aed) || 0,
            status: p.status,
            created_at: p.created_at
          }))
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // Driver vehicle
  // Driver vehicle
  async getVehicle(req, res, next) {
    try {
      const driverId = req.user.id;

      const result = await query(`
        SELECT id, model, type as vehicle_type, color, plate_number, max_passengers, max_luggage, active as status
        FROM vehicles
        WHERE driver_id = $1
        LIMIT 1
      `, [driverId]);

      if (result.rows.length === 0) {
        return res.json({ success: true, data: null });
      }

      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      next(error);
    }
  },

  // Update booking status (Driver Action)
  async updateBookingStatus(req, res, next) {
    try {
      const driverId = req.user.id;
      const { bookingId, status } = req.body;

      if (!bookingId || !status) {
        return res.status(400).json({ success: false, error: 'Booking ID and status are required' });
      }

      // 1. Verify booking belongs to driver
      const bookingRes = await query('SELECT * FROM bookings WHERE id = $1 AND driver_id = $2', [bookingId, driverId]);
      if (bookingRes.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Booking not found or not assigned to you' });
      }
      const booking = bookingRes.rows[0];

      // 2. State transition validation
      const validTransitions = {
        'assigned': ['on_trip'],
        'on_trip': ['completed']
      };

      // Allow driver to complete if it's already on_trip, or start if assigned.
      // Also handle re-sending same status (idempotency)
      if (booking.status === status) {
        return res.json({ success: true, message: 'Status already updated', data: booking });
      }

      const allowedNext = validTransitions[booking.status] || [];
      if (!allowedNext.includes(status)) {
        return res.status(400).json({
          success: false,
          error: `Invalid status transition. Cannot go from ${booking.status} to ${status}`
        });
      }

      // 3. Update status
      const updateRes = await query(
        'UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [status, bookingId]
      );

      // If completed, update vehicle status and send email
      if (status === 'completed') {
        const completedBooking = updateRes.rows[0];

        // 1. Mark vehicle as available
        if (completedBooking.assigned_vehicle_id) {
          await query("UPDATE vehicles SET status = 'available' WHERE id = $1", [completedBooking.assigned_vehicle_id]);
          console.log(`✅ Vehicle ${completedBooking.assigned_vehicle_id} marked as available`);
        }

        // 2. Send completion email and WhatsApp
        await emailService.sendRideCompletionNotification(completedBooking);
        console.log(`📧 Ride completion email sent for booking ${bookingId}`);

        // 3. Send WhatsApp
        await notificationService.sendTripCompletedNotification(completedBooking, req.user);
        console.log(`📱 Ride completion WhatsApp sent for booking ${bookingId}`);
      }

      res.json({
        success: true,
        message: `Ride ${status === 'on_trip' ? 'started' : 'completed'} successfully`,
        data: updateRes.rows[0]
      });

    } catch (error) {
      next(error);
    }
  }
};

function getDateRange(range) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (range) {
    case 'today':
      return {
        start: today,
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      };
    case 'yesterday':
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      return {
        start: yesterday,
        end: today
      };
    case 'week':
      const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      return {
        start: weekStart,
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      };
    case 'month':
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      return {
        start: monthStart,
        end: monthEnd
      };
    default:
      if (range.startsWith('custom_')) {
        const [_, start, end] = range.split('_');
        return {
          start: new Date(start),
          end: new Date(new Date(end).getTime() + 24 * 60 * 60 * 1000)
        };
      }
      return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
  }
}

module.exports = driverStatsController;
