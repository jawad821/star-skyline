const { query } = require('../config/db');

const Vendor = {
  async findById(id) {
    const result = await query('SELECT * FROM vendors WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async findAll() {
    const result = await query('SELECT * FROM vendors ORDER BY name');
    return result.rows;
  },

  async create(data) {
    const result = await query(`
      INSERT INTO vendors (name, phone, email, commission_rate)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [data.name, data.phone, data.email, data.commission_rate || 0.8]);
    return result.rows[0];
  },

  async update(id, data) {
    const result = await query(`
      UPDATE vendors 
      SET name = $1, phone = $2, email = $3, commission_rate = $4
      WHERE id = $5
      RETURNING *
    `, [data.name, data.phone, data.email, data.commission_rate, id]);
    return result.rows[0];
  }
};

module.exports = Vendor;
