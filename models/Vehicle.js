const { query } = require('../config/db');

const Vehicle = {
  async findById(id) {
    const result = await query(
      'SELECT * FROM vehicles WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Find available vehicles with capacity validation
   * @param {number} passengers - number of passengers
   * @param {number} luggage - amount of luggage
   * @returns {array} vehicles sorted by cheapest per_km_price
   */
  async findAvailableByCapacity(passengers = 1, luggage = 0) {
    const result = await query(`
      SELECT 
        v.id, v.plate_number, v.model, v.type, v.status,
        v.max_passengers, v.max_luggage, v.per_km_price, v.hourly_price,
        d.id as driver_id, d.name as driver_name, d.phone as driver_phone,
        vn.id as vendor_id, vn.name as vendor_name
      FROM vehicles v
      LEFT JOIN drivers d ON v.driver_id = d.id
      LEFT JOIN vendors vn ON v.vendor_id = vn.id
      WHERE v.status = 'available' 
        AND v.active = true
        AND v.max_passengers >= $1 
        AND v.max_luggage >= $2
      ORDER BY v.per_km_price ASC, v.model
    `, [passengers, luggage]);
    
    return result.rows;
  },

  async findAvailable(type = null) {
    let sql = `
      SELECT 
        v.id, v.plate_number, v.model, v.type, v.status,
        v.max_passengers, v.max_luggage, v.per_km_price, v.hourly_price,
        d.id as driver_id, d.name as driver_name, d.phone as driver_phone,
        vn.id as vendor_id, vn.name as vendor_name
      FROM vehicles v
      LEFT JOIN drivers d ON v.driver_id = d.id
      LEFT JOIN vendors vn ON v.vendor_id = vn.id
      WHERE v.status = 'available' AND v.active = true
    `;
    
    const params = [];
    if (type) {
      sql += ' AND v.type = $1';
      params.push(type);
    }
    
    sql += ' ORDER BY v.per_km_price ASC, v.model';
    
    const result = await query(sql, params);
    return result.rows;
  },

  async findFirstAvailableByType(type) {
    const result = await query(`
      SELECT 
        v.id, v.plate_number, v.model, v.type,
        v.max_passengers, v.max_luggage, v.per_km_price, v.hourly_price,
        d.name as driver_name, d.phone as driver_phone
      FROM vehicles v
      LEFT JOIN drivers d ON v.driver_id = d.id
      WHERE v.status = 'available' AND v.active = true AND v.type = $1
      ORDER BY v.per_km_price ASC
      LIMIT 1
    `, [type]);
    return result.rows[0] || null;
  },

  /**
   * Get cheapest vehicle matching criteria
   * @param {number} passengers - passenger count
   * @param {number} luggage - luggage amount
   * @returns {object} cheapest eligible vehicle
   */
  async findCheapestEligible(passengers = 1, luggage = 0) {
    const vehicles = await this.findAvailableByCapacity(passengers, luggage);
    if (vehicles.length === 0) {
      return null;
    }
    // Already sorted by per_km_price, so first is cheapest
    return vehicles[0];
  },

  async updateStatus(id, status) {
    const result = await query(
      'UPDATE vehicles SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );
    return result.rows[0];
  },

  async create(vehicleData) {
    const { plate_number, model, type, status, max_passengers, max_luggage, per_km_price, hourly_price, vendor_id } = vehicleData;
    const defaultVendorId = '3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7'; // Gold Rush Limo
    const result = await query(`
      INSERT INTO vehicles 
        (plate_number, model, type, status, max_passengers, max_luggage, per_km_price, hourly_price, vendor_id, active, created_at)
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, NOW())
      RETURNING *
    `, [plate_number, model, type, status || 'available', max_passengers || 4, max_luggage || 3, per_km_price, hourly_price, vendor_id || defaultVendorId]);
    return result.rows[0];
  }
};

module.exports = Vehicle;
