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

  async findByPhone(phone) {
    // Sanitize phone (remove + if present, etc if needed, but simple match for now)
    // Assuming phones are stored consistently. 
    // WhatsApp sends with + usually. DB might be without.
    // Let's try flexible matching or just raw for now.
    // Try precise match first.
    const result = await query('SELECT * FROM drivers WHERE phone = $1', [phone]);
    return result.rows[0] || null;
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
  },

  async getDetailedInfo(id) {
    const result = await query(`
      SELECT 
        d.id, d.name, d.phone, d.status, d.license_number, 
        d.license_issue_date, d.license_expiry_date, d.auto_assign, d.image_url,
        d.email, d.national_id, d.date_of_birth, 
        d.bank_account_number, d.bank_name, d.account_holder_name,
        d.driver_registration_status,
        COUNT(b.id)::int as completed_rides,
        COALESCE(AVG(dr.driver_rating), 0)::float as avg_rating
      FROM drivers d
      LEFT JOIN bookings b ON d.id = b.driver_id AND b.status = 'completed'
      LEFT JOIN driver_ratings dr ON b.id = dr.booking_id
      WHERE d.id = $1
      GROUP BY d.id
    `, [id]);
    return result.rows[0] || null;
  },

  async updateDriver(id, data) {
    const { license_issue_date, license_expiry_date, auto_assign, status, image_url, driver_registration_status, name, phone, email, license_number } = data;
    const result = await query(`
      UPDATE drivers 
      SET license_issue_date = COALESCE($1, license_issue_date),
      license_expiry_date = COALESCE($2, license_expiry_date),
      auto_assign = COALESCE($3, auto_assign),
      status = COALESCE($4, status),
      image_url = COALESCE($5, image_url),
      driver_registration_status = COALESCE($6, driver_registration_status),
      name = COALESCE($7, name),
      phone = COALESCE($8, phone),
      email = COALESCE($9, email),
      license_number = COALESCE($10, license_number),
      updated_at = NOW()
      WHERE id = $11
      RETURNING *
    `, [license_issue_date, license_expiry_date, auto_assign, status, image_url, driver_registration_status, name, phone, email, license_number, id]);
    return result.rows[0];
  },

  async deleteDriver(id) {
    // Hard delete: remove from database
    const result = await query(`
      DELETE FROM drivers
      WHERE id = $1
      RETURNING *
    `, [id]);
    return result.rows[0] || null;
  }
};

module.exports = Driver;
