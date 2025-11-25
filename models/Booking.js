const { query } = require('../config/db');

const Booking = {
  async findById(id) {
    const result = await query('SELECT * FROM bookings WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async create(data) {
    const result = await query(`
      INSERT INTO bookings (
        customer_name, customer_phone, pickup_location, dropoff_location,
        distance_km, fare_aed, vehicle_type, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
      RETURNING *
    `, [
      data.customer_name,
      data.customer_phone,
      data.pickup_location || null,
      data.dropoff_location || null,
      data.distance_km,
      data.fare_aed,
      data.vehicle_type
    ]);
    return result.rows[0];
  },

  async updateAssignment(bookingId, vehicleId, vendorId) {
    const result = await query(`
      UPDATE bookings 
      SET assigned_vehicle_id = $1, vendor_id = $2, status = 'assigned'
      WHERE id = $3
      RETURNING *
    `, [vehicleId, vendorId, bookingId]);
    return result.rows[0];
  },

  async updateStatus(id, status) {
    const result = await query(
      'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    return result.rows[0];
  }
};

module.exports = Booking;
