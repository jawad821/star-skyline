const { query } = require('../config/db');

const Vehicle = {
  async findById(id) {
    const result = await query(`
      SELECT v.*, 
             d.name as driver_name, d.phone as driver_phone
      FROM vehicles v
      LEFT JOIN drivers d ON v.driver_id = d.id
      WHERE v.id = $1
    `, [id]);
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
   * Get cheapest vehicle - COMPANY PRIORITY then VENDOR
   * @param {number} passengers - passenger count
   * @param {number} luggage - luggage amount
   * @returns {object} cheapest eligible vehicle
   */
  async findCheapestEligible(passengers = 1, luggage = 0) {
    // STEP 1: Try company vehicles FIRST (vendor_id IS NULL)
    const companyResult = await query(`
      SELECT v.*, 
             d.name as driver_name, 
             d.phone as driver_phone,
             d.email as driver_email,
             'company' as vehicle_source
      FROM vehicles v
      LEFT JOIN drivers d ON v.driver_id = d.id
      WHERE v.max_passengers >= $1 
            AND v.max_luggage >= $2
            AND v.status = 'available'
            AND v.vendor_id IS NULL
      ORDER BY v.per_km_price ASC, v.hourly_price ASC
      LIMIT 1
    `, [passengers, luggage]);

    if (companyResult.rows.length > 0) {
      return companyResult.rows[0];
    }

    // STEP 2: If no company vehicles, try APPROVED vendor vehicles (NOT disabled)
    const vendorResult = await query(`
      SELECT v.*, 
             d.name as driver_name, 
             d.phone as driver_phone,
             d.email as driver_email,
             vn.name as vendor_name,
             'vendor' as vehicle_source
      FROM vehicles v
      LEFT JOIN drivers d ON v.driver_id = d.id
      LEFT JOIN vendors vn ON v.vendor_id = vn.id
      WHERE v.max_passengers >= $1 
            AND v.max_luggage >= $2
            AND v.status = 'available'
            AND v.vendor_id IS NOT NULL
            AND vn.status = 'approved'
            AND vn.auto_assign_disabled = false
      ORDER BY v.per_km_price ASC, v.hourly_price ASC
      LIMIT 1
    `, [passengers, luggage]);

    if (vendorResult.rows.length > 0) {
      return vendorResult.rows[0];
    }

    // STEP 3: No vehicles available
    return null;
  },

  async updateStatus(id, status) {
    // Some schemas may not have an updated_at column; update only status to be safe.
    const result = await query(
      'UPDATE vehicles SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    return result.rows[0];
  },

  async getAll(type = null) {
    let sql = `
      SELECT v.id, v.plate_number, v.model, v.type, v.status, v.color, v.image_url, 
             v.max_passengers, v.max_luggage, v.per_km_price, v.hourly_price,
             v.driver_id,
             d.name as driver_name, d.phone as driver_phone
      FROM vehicles v
      LEFT JOIN drivers d ON v.driver_id = d.id
      WHERE v.active = true
    `;
    const params = [];

    // Smart filtering for tabs
    if (type) {
      if (type === 'suv') {
        sql += " AND (v.type ILIKE '%suv%')";
      } else if (type === 'sedan') {
        // Includes classic, executive, first_class which are sedans
        sql += " AND (v.type = 'sedan' OR v.type = 'classic' OR v.type = 'executive' OR v.type = 'first_class' OR v.type = 'standard')";
      } else if (type === 'luxury') {
        // Includes anything luxury or first class
        sql += " AND (v.type ILIKE '%luxury%' OR v.type = 'first_class' OR v.type = 'executive' OR v.type = 'elite_van')";
      } else if (type === 'van') {
        sql += " AND (v.type ILIKE '%van%' OR v.type = 'van')";
      } else if (type === 'minibus') {
        sql += " AND (v.type = 'mini_bus' OR v.type = 'minibus')";
      } else if (type === 'bus') {
        sql += " AND (v.type = 'bus')";
      } else {
        // Fallback for strict match or other types
        sql += ' AND v.type = $1';
        params.push(type);
      }
    }

    sql += ' ORDER BY v.model';
    const result = await query(sql, params);
    return result.rows;
  },

  async create(vehicleData) {
    const { plate_number, model, type, status, color, max_passengers, max_luggage, per_km_price, hourly_price, vendor_id } = vehicleData;
    const defaultVendorId = '3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7'; // Gold Rush Limo
    const result = await query(`
      INSERT INTO vehicles 
        (plate_number, model, type, status, color, max_passengers, max_luggage, per_km_price, hourly_price, vendor_id, active, created_at)
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true, NOW())
      RETURNING *
    `, [plate_number, model, type, status || 'available', color || 'White', max_passengers || 4, max_luggage || 3, per_km_price, hourly_price, vendor_id || defaultVendorId]);
    return result.rows[0];
  },

  async updateVehicle(id, data) {
    const fields = [];
    const values = [];
    let idx = 1;

    // Map allowed fields to DB columns
    const allowedFields = ['model', 'plate_number', 'color', 'type', 'status', 'max_passengers', 'max_luggage', 'hourly_price', 'per_km_price', 'image_url', 'driver_id'];

    for (const key of allowedFields) {
      if (data.hasOwnProperty(key)) {
        let value = data[key];

        // Handle driver_id specifically
        if (key === 'driver_id') {
          // If empty string, treat as NULL (unassign)
          if (value === '' || value === 'null') value = null;
        }

        fields.push(`${key} = $${idx++}`);
        values.push(value);
      }
    }

    if (fields.length === 0) {
      // Nothing to update, return current state
      return this.findById(id);
    }

    values.push(id); // ID is the last parameter
    const sql = `
      UPDATE vehicles 
      SET ${fields.join(', ')}
      WHERE id = $${idx}
      RETURNING *
    `;

    const result = await query(sql, values);
    return result.rows[0];
  }
};

module.exports = Vehicle;
