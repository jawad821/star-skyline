const { query } = require('../config/db');

const Booking = {
  async findById(id) {
    const result = await query('SELECT * FROM bookings WHERE id = $1', [id]);
    const booking = result.rows[0] || null;
    if (booking) {
      // Fetch stops if exists
      const stopsResult = await query(
        'SELECT * FROM booking_stops WHERE booking_id = $1 ORDER BY stop_number ASC',
        [id]
      );
      booking.stops = stopsResult.rows || [];
    }
    return booking;
  },

  async createWithStops(data, stops) {
    const booking = await this.create(data);
    if (stops && stops.length > 0) {
      for (const stop of stops) {
        await query(
          `INSERT INTO booking_stops (booking_id, stop_number, location, stop_type, duration_minutes)
           VALUES ($1, $2, $3, $4, $5)`,
          [booking.id, stop.number, stop.location, stop.stop_type, stop.duration_minutes || 0]
        );
      }
      booking.stops = stops;
    }
    return booking;
  },

  async create(data) {
    const {
      customer_name,
      customer_phone,
      customer_email,
      pickup_location,
      dropoff_location,
      distance_km,
      fare_aed,
      vehicle_type,
      booking_type,
      passengers_count,
      luggage_count,
      caller_number,
      confirmed_contact_number,
      notes
    } = data;

    const result = await query(`
      INSERT INTO bookings (
        customer_name, 
        customer_phone,
        customer_email,
        pickup_location,
        dropoff_location,
        distance_km,
        fare_aed,
        vehicle_type,
        booking_type,
        status,
        passengers_count,
        luggage_count,
        caller_number,
        confirmed_contact_number,
        notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending', $10, $11, $12, $13, $14)
      RETURNING *
    `, [
      customer_name,
      customer_phone,
      customer_email || null,
      pickup_location || null,
      dropoff_location || null,
      distance_km || 0,
      fare_aed,
      vehicle_type,
      booking_type || 'point_to_point',
      passengers_count || 1,
      luggage_count || 0,
      caller_number || null,
      confirmed_contact_number || null,
      notes || null
    ]);

    return result.rows[0];
  },

  async updateAssignment(bookingId, vehicleId, vendorId) {
    const result = await query(`
      UPDATE bookings 
      SET assigned_vehicle_id = $1, vendor_id = $2, status = 'assigned', updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `, [vehicleId, vendorId, bookingId]);
    return result.rows[0];
  },

  async updateStatus(id, status) {
    const result = await query(
      'UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );
    return result.rows[0];
  },

  async assignDriver(id, driverId) {
    const result = await query(
      'UPDATE bookings SET driver_id = $1, status = \'assigned\', updated_at = NOW() WHERE id = $2 RETURNING *',
      [driverId, id]
    );
    return result.rows[0];
  },

  async assignVehicleAndType(id, vehicleId, vehicleType) {
    const result = await query(
      'UPDATE bookings SET assigned_vehicle_id = $1, vehicle_type = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
      [vehicleId, vehicleType, id]
    );
    return result.rows[0];
  },

  async updateNotes(id, notes) {
    const result = await query(
      'UPDATE bookings SET notes = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [notes || null, id]
    );
    return result.rows[0];
  },

  async deleteBooking(id) {
    // Hard delete: remove from database
    // First remove related stops to maintain integrity
    await query('DELETE FROM booking_stops WHERE booking_id = $1', [id]);

    // Then remove the booking
    const result = await query(`
      DELETE FROM bookings
      WHERE id = $1
      RETURNING *
    `, [id]);
    return result.rows[0] || null;
  }
};

module.exports = Booking;
