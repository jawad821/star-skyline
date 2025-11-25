const { query } = require('../config/db');

const Driver = {
  async findById(id) {
    const result = await query('SELECT * FROM drivers WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async findByVendor(vendorId) {
    const result = await query(
      'SELECT * FROM drivers WHERE vendor_id = $1 ORDER BY name',
      [vendorId]
    );
    return result.rows;
  },

  async findAll() {
    const result = await query(`
      SELECT d.*, v.name as vendor_name
      FROM drivers d
      LEFT JOIN vendors v ON d.vendor_id = v.id
      ORDER BY d.name
    `);
    return result.rows;
  },

  async create(data) {
    const result = await query(`
      INSERT INTO drivers (vendor_id, name, phone, license_number)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [data.vendor_id, data.name, data.phone, data.license_number]);
    return result.rows[0];
  }
};

module.exports = Driver;
