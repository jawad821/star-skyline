const { query } = require('../config/db');

const Customer = {
  async findById(id) {
    const result = await query('SELECT * FROM customers WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async findByPhone(phone) {
    const result = await query('SELECT * FROM customers WHERE phone = $1', [phone]);
    return result.rows[0] || null;
  },

  async findAll(limit = 50, offset = 0) {
    const result = await query(`
      SELECT c.*, 
        COALESCE(COUNT(b.id), 0) as total_rides,
        COALESCE(SUM(CASE WHEN b.status='completed' THEN b.fare_aed ELSE 0 END), 0) as lifetime_spend
      FROM customers c
      LEFT JOIN bookings b ON b.customer_phone = c.phone
      GROUP BY c.id
      ORDER BY c.created_at DESC 
      LIMIT $1 OFFSET $2
    `, [limit, offset]);
    return result.rows;
  },

  async search(searchTerm) {
    const search = `%${searchTerm}%`;
    const result = await query(`
      SELECT * FROM customers 
      WHERE name ILIKE $1 OR phone ILIKE $1 OR email ILIKE $1
      ORDER BY created_at DESC LIMIT 50
    `, [search]);
    return result.rows;
  },

  async create(data) {
    const result = await query(`
      INSERT INTO customers (name, phone, email, whatsapp, preferred_vehicle, notes)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      data.name,
      data.phone,
      data.email || null,
      data.whatsapp || data.phone,
      data.preferred_vehicle || 'sedan',
      data.notes || null
    ]);
    return result.rows[0];
  },

  async update(id, data) {
    const result = await query(`
      UPDATE customers 
      SET name = $1, phone = $2, email = $3, whatsapp = $4, 
          preferred_vehicle = $5, notes = $6, updated_at = NOW()
      WHERE id = $7
      RETURNING *
    `, [
      data.name,
      data.phone,
      data.email,
      data.whatsapp,
      data.preferred_vehicle,
      data.notes,
      id
    ]);
    return result.rows[0];
  },

  async getStats(customerId) {
    const result = await query(`
      SELECT 
        COUNT(*) as total_rides,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_rides,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_rides,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN fare_aed ELSE 0 END), 0) as lifetime_spend,
        MAX(created_at) as last_booking_date
      FROM bookings
      WHERE customer_phone = (SELECT phone FROM customers WHERE id = $1)
    `, [customerId]);
    return result.rows[0] || {
      total_rides: 0,
      completed_rides: 0,
      cancelled_rides: 0,
      lifetime_spend: 0,
      last_booking_date: null
    };
  },

  async delete(id) {
    const result = await query('DELETE FROM customers WHERE id = $1 RETURNING id', [id]);
    return result.rows[0];
  }
};

module.exports = Customer;
