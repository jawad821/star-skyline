const { query } = require('../config/db');

const reportService = {
  async getSummary(fromDate, toDate) {
    const dateFilter = fromDate && toDate 
      ? 'AND b.created_at BETWEEN $1 AND $2' 
      : '';
    const params = fromDate && toDate ? [fromDate, toDate] : [];
    
    const bookingsResult = await query(`
      SELECT 
        COUNT(*) as total_bookings,
        SUM(fare_aed) as total_revenue,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_bookings,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_bookings,
        COUNT(CASE WHEN status = 'assigned' THEN 1 END) as assigned_bookings,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_bookings
      FROM bookings b
      WHERE 1=1 ${dateFilter}
    `, params);
    
    const topVendorsResult = await query(`
      SELECT 
        v.id, v.name,
        COUNT(b.id) as booking_count,
        COALESCE(SUM(b.fare_aed), 0) as total_revenue
      FROM vendors v
      LEFT JOIN bookings b ON v.id = b.vendor_id ${dateFilter.replace('b.created_at', 'b.created_at')}
      GROUP BY v.id, v.name
      ORDER BY booking_count DESC
      LIMIT 5
    `, params);
    
    const topVehiclesResult = await query(`
      SELECT 
        ve.id, ve.plate_number, ve.model, ve.type,
        COUNT(b.id) as trip_count,
        COALESCE(SUM(b.fare_aed), 0) as total_revenue
      FROM vehicles ve
      LEFT JOIN bookings b ON ve.id = b.assigned_vehicle_id ${dateFilter.replace('b.created_at', 'b.created_at')}
      GROUP BY ve.id, ve.plate_number, ve.model, ve.type
      ORDER BY trip_count DESC
      LIMIT 5
    `, params);
    
    const dailyRevenueResult = await query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as bookings,
        SUM(fare_aed) as revenue
      FROM bookings
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);
    
    return {
      summary: bookingsResult.rows[0],
      top_vendors: topVendorsResult.rows,
      top_vehicles: topVehiclesResult.rows,
      daily_revenue: dailyRevenueResult.rows
    };
  },

  async getBookingsForExport(fromDate, toDate) {
    let sql = `
      SELECT 
        b.id, b.customer_name, b.customer_phone,
        b.pickup_location, b.dropoff_location,
        b.distance_km, b.fare_aed, b.vehicle_type,
        b.status, b.created_at,
        v.name as vendor_name,
        ve.plate_number, ve.model
      FROM bookings b
      LEFT JOIN vendors v ON b.vendor_id = v.id
      LEFT JOIN vehicles ve ON b.assigned_vehicle_id = ve.id
    `;
    
    const params = [];
    if (fromDate && toDate) {
      sql += ' WHERE b.created_at BETWEEN $1 AND $2';
      params.push(fromDate, toDate);
    }
    
    sql += ' ORDER BY b.created_at DESC';
    
    const result = await query(sql, params);
    return result.rows;
  }
};

module.exports = reportService;
