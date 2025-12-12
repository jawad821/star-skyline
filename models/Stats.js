const { query } = require('../config/db');

const Stats = {
  async getDateRange(range) {
    const now = new Date();
    let startDate, endDate;

    switch (range) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case 'yesterday':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        const d = new Date();
        const day = d.getDay();
        const diff = d.getDate() - day;
        startDate = new Date(d.setDate(diff));
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date();
        endDate.setDate(endDate.getDate() + 1);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      default:
        return null;
    }

    return { startDate: startDate.toISOString().split('T')[0], endDate: endDate.toISOString().split('T')[0] };
  },

  async getSummary(startDate, endDate) {
    const result = await query(`
      SELECT
        COUNT(*) as total_bookings,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_bookings,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_bookings,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_bookings,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN fare_aed ELSE 0 END), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN status = 'completed' AND payment_method = 'cash' THEN fare_aed ELSE 0 END), 0) as cash_revenue,
        COALESCE(SUM(CASE WHEN status = 'completed' AND payment_method = 'card' THEN fare_aed ELSE 0 END), 0) as card_revenue
      FROM bookings
      WHERE created_at >= $1 AND created_at < $2
    `, [startDate, endDate]);

    return result.rows[0];
  },

  async getBookingsTrend(startDate, endDate) {
    const result = await query(`
      SELECT
        DATE(created_at) as date,
        COUNT(*) as bookings,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN fare_aed ELSE 0 END), 0) as revenue
      FROM bookings
      WHERE created_at >= $1 AND created_at < $2
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `, [startDate, endDate]);

    return result.rows;
  },

  async getRevenueByType(startDate, endDate) {
    const result = await query(`
      SELECT
        vehicle_type,
        COUNT(*) as trips,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN fare_aed ELSE 0 END), 0) as revenue
      FROM bookings
      WHERE created_at >= $1 AND created_at < $2
      GROUP BY vehicle_type
      ORDER BY revenue DESC
    `, [startDate, endDate]);

    return result.rows;
  },

  async getDriverStats(startDate, endDate) {
    const result = await query(`
      SELECT
        d.id,
        d.name,
        COALESCE(d.status, 'offline') as status,
        COUNT(b.id) as trips,
        COALESCE(SUM(CASE WHEN b.status = 'completed' THEN b.fare_aed ELSE 0 END), 0) as earnings
      FROM drivers d
      LEFT JOIN bookings b ON b.driver_id = d.id AND b.created_at >= $1 AND b.created_at < $2
      GROUP BY d.id, d.name, d.status
      ORDER BY trips DESC
      LIMIT 10
    `, [startDate, endDate]);

    return result.rows;
  },

  async getAllBookings(startDate, endDate, filters = {}) {
    let whereClause = 'WHERE b.created_at >= $1 AND b.created_at < $2';
    const params = [startDate, endDate];
    let paramIndex = 3;

    if (filters.status) {
      whereClause += ` AND b.status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters.vehicle_type) {
      whereClause += ` AND b.vehicle_type = $${paramIndex}`;
      params.push(filters.vehicle_type);
      paramIndex++;
    }

    const result = await query(`
      SELECT
        b.id,
        b.customer_name,
        b.customer_phone,
        b.pickup_location,
        b.dropoff_location,
        b.distance_km,
        b.fare_aed,
        b.vehicle_type,
        b.status,
        b.payment_method,
        b.driver_id,
        d.name as driver_name,
        b.created_at,
        b.updated_at
      FROM bookings b
      LEFT JOIN drivers d ON b.driver_id = d.id
      ${whereClause}
      ORDER BY b.created_at DESC
      LIMIT 100
    `, params);

    return result.rows;
  },

  async getEarningsBreakdown(startDate, endDate) {
    const result = await query(`
      SELECT
        DATE(b.created_at) as day,
        SUM(CAST(b.fare_aed AS DECIMAL)) as earnings,
        COUNT(*) as bookings
      FROM bookings b
      WHERE b.created_at >= $1 AND b.created_at < $2 AND b.status = 'completed'
      GROUP BY DATE(b.created_at)
      ORDER BY DATE(b.created_at) ASC
    `, [startDate, endDate]);

    return result.rows.map(r => ({
      day: r.day ? new Date(r.day).toLocaleDateString('en-AE') : '',
      earnings: parseFloat(r.earnings || 0),
      bookings: r.bookings
    }));
  },

  async getTopVendors(startDate, endDate) {
    const result = await query(`
      SELECT
        v.id,
        v.name as vendor_name,
        COUNT(b.id) as bookings,
        SUM(CAST(b.fare_aed AS DECIMAL)) as total_revenue,
        ROUND(SUM(CAST(b.fare_aed AS DECIMAL)) * 0.8, 2) as earnings
      FROM vendors v
      LEFT JOIN bookings b ON v.id = b.vendor_id AND b.created_at >= $1 AND b.created_at < $2 AND b.status = 'completed'
      WHERE v.status = 'approved'
      GROUP BY v.id, v.name
      ORDER BY earnings DESC
      LIMIT 5
    `, [startDate, endDate]);

    return result.rows;
  },

  async getUpcomingBookings() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const tomorrowEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2);

    const todayResult = await query(`
      SELECT COUNT(*) as count FROM bookings 
      WHERE pickup_time >= $1 AND pickup_time < $2 AND status IN ('pending', 'in-process')
    `, [todayStart, todayEnd]);

    const tomorrowResult = await query(`
      SELECT COUNT(*) as count FROM bookings 
      WHERE pickup_time >= $1 AND pickup_time < $2 AND status IN ('pending', 'in-process')
    `, [tomorrowStart, tomorrowEnd]);

    return {
      today: parseInt(todayResult.rows[0]?.count || 0),
      tomorrow: parseInt(tomorrowResult.rows[0]?.count || 0)
    };
  },

  async getEarningsComparison() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastWeekSameDay = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());
    const thisWeekEnd = new Date(thisWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const lastWeekStart = new Date(thisWeekStart.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastWeekEnd = new Date(thisWeekStart);

    const todayResult = await query(`
      SELECT COALESCE(SUM(CASE WHEN status = 'completed' THEN fare_aed ELSE 0 END), 0) as earnings
      FROM bookings WHERE created_at >= $1 AND created_at < $2
    `, [today.toISOString().split('T')[0], new Date(today.getTime() + 24*60*60*1000).toISOString().split('T')[0]]);

    const lastWeekSameDayResult = await query(`
      SELECT COALESCE(SUM(CASE WHEN status = 'completed' THEN fare_aed ELSE 0 END), 0) as earnings
      FROM bookings WHERE created_at >= $1 AND created_at < $2
    `, [lastWeekSameDay.toISOString().split('T')[0], new Date(lastWeekSameDay.getTime() + 24*60*60*1000).toISOString().split('T')[0]]);

    const thisWeekResult = await query(`
      SELECT COALESCE(SUM(CASE WHEN status = 'completed' THEN fare_aed ELSE 0 END), 0) as earnings
      FROM bookings WHERE created_at >= $1 AND created_at < $2
    `, [thisWeekStart.toISOString().split('T')[0], thisWeekEnd.toISOString().split('T')[0]]);

    const lastWeekResult = await query(`
      SELECT COALESCE(SUM(CASE WHEN status = 'completed' THEN fare_aed ELSE 0 END), 0) as earnings
      FROM bookings WHERE created_at >= $1 AND created_at < $2
    `, [lastWeekStart.toISOString().split('T')[0], lastWeekEnd.toISOString().split('T')[0]]);

    return {
      today: parseFloat(todayResult.rows[0]?.earnings || 0),
      lastWeekSameDay: parseFloat(lastWeekSameDayResult.rows[0]?.earnings || 0),
      thisWeek: parseFloat(thisWeekResult.rows[0]?.earnings || 0),
      lastWeek: parseFloat(lastWeekResult.rows[0]?.earnings || 0)
    };
  },

  async getCustomerFunnels() {
    const result = await query(`
      SELECT 
        booking_source,
        COUNT(*) as count,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        ROUND(SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) as conversion_rate
      FROM bookings
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY booking_source
      ORDER BY count DESC
    `, []);

    return result.rows;
  },

  async getRevenueByBookingType() {
    const result = await query(`
      SELECT 
        CASE 
          WHEN pickup_location ILIKE '%airport%' OR dropoff_location ILIKE '%airport%' THEN 'Airport Transfer'
          WHEN booking_type = 'hourly' THEN 'Hourly Rental'
          ELSE 'Point to Point'
        END as booking_type,
        COUNT(*) as trips,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN fare_aed ELSE 0 END), 0) as revenue
      FROM bookings
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY CASE 
          WHEN pickup_location ILIKE '%airport%' OR dropoff_location ILIKE '%airport%' THEN 'Airport Transfer'
          WHEN booking_type = 'hourly' THEN 'Hourly Rental'
          ELSE 'Point to Point'
        END
      ORDER BY revenue DESC
    `, []);

    return result.rows;
  }
};

module.exports = Stats;
