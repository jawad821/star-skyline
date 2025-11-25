const { query } = require('../config/db');

const Payout = {
  async findById(id) {
    const result = await query('SELECT * FROM vendor_payouts WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async findByVendor(vendorId) {
    const result = await query(
      'SELECT * FROM vendor_payouts WHERE vendor_id = $1 ORDER BY created_at DESC',
      [vendorId]
    );
    return result.rows;
  },

  async findByBooking(bookingId) {
    const result = await query(
      'SELECT * FROM vendor_payouts WHERE booking_id = $1',
      [bookingId]
    );
    return result.rows[0] || null;
  },

  async create(data) {
    const result = await query(`
      INSERT INTO vendor_payouts (vendor_id, booking_id, vendor_amount, company_profit)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [data.vendor_id, data.booking_id, data.vendor_amount, data.company_profit]);
    return result.rows[0];
  }
};

module.exports = Payout;
