const { query } = require('../config/db');

const Vehicle = {
  async findById(id) {
    const result = await query(
      'SELECT id, status, vendor_id FROM vehicles WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  async findAvailable(type = null) {
    let sql = `
      SELECT 
        v.id, v.plate_number, v.model, v.type, v.status,
        d.id as driver_id, d.name as driver_name, d.phone as driver_phone,
        vn.name as vendor_name
      FROM vehicles v
      LEFT JOIN drivers d ON v.driver_id = d.id
      LEFT JOIN vendors vn ON v.vendor_id = vn.id
      WHERE v.status = 'available'
    `;
    
    const params = [];
    if (type) {
      sql += ' AND v.type = $1';
      params.push(type);
    }
    
    sql += ' ORDER BY v.type, v.model';
    
    const result = await query(sql, params);
    return result.rows;
  },

  async findFirstAvailableByType(type) {
    const result = await query(`
      SELECT 
        v.id, v.plate_number, v.model, v.type,
        d.name as driver_name, d.phone as driver_phone
      FROM vehicles v
      LEFT JOIN drivers d ON v.driver_id = d.id
      WHERE v.status = 'available' AND v.type = $1
      LIMIT 1
    `, [type]);
    return result.rows[0] || null;
  },

  async updateStatus(id, status) {
    const result = await query(
      'UPDATE vehicles SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    return result.rows[0];
  }
};

module.exports = Vehicle;
