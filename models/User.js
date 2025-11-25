const { query } = require('../config/db');

const User = {
  async findByUsername(username) {
    const result = await query('SELECT * FROM users WHERE username = $1', [username]);
    return result.rows[0] || null;
  },

  async findById(id) {
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async create(data) {
    const result = await query(`
      INSERT INTO users (username, password_hash, role)
      VALUES ($1, $2, $3)
      RETURNING id, username, role, created_at
    `, [data.username, data.password_hash, data.role || 'admin']);
    return result.rows[0];
  }
};

module.exports = User;
