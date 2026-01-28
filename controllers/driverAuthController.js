const { query } = require('../config/db');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const { JWT_SECRET } = require('../config/env');

const driverAuthController = {
  async driverSignup(req, res, next) {
    try {
      const { name, email, phone, password, national_id, date_of_birth, license_number, bank_account_number, bank_name } = req.body;
      
      if (!name || !email || !phone || !password || !license_number) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
      }

      const passwordHash = await bcryptjs.hash(password, 10);
      
      const result = await query(`
  INSERT INTO drivers (name, email, phone, password_hash, license_number, national_id, date_of_birth, bank_account_number, bank_name, account_holder_name, driver_registration_status, status, auto_assign)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NULL, 'pending', 'pending', false)
  RETURNING id, name, email, driver_registration_status, status
`, [name, email, phone, passwordHash, license_number, national_id, date_of_birth, bank_account_number, bank_name]);

      logger.info(`Driver signup request: ${result.rows[0].name}`);
      
      res.status(201).json({
        success: true,
        message: 'Driver registration submitted. Awaiting admin approval.',
        driver: result.rows[0]
      });
    } catch (error) {
      next(error);
    }
  },

  async driverLogin(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Email and password required' });
      }

      const result = await query('SELECT * FROM drivers WHERE email = $1', [email]);
      if (result.rows.length === 0) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }

      const driver = result.rows[0];
      // Allow login if registration status is not explicitly set to a blocking state.
      if (driver.driver_registration_status && driver.driver_registration_status !== 'approved') {
        return res.status(403).json({ success: false, error: `Status: ${driver.driver_registration_status}` });
      }

      const passwordMatch = await bcryptjs.compare(password, driver.password_hash);
      if (!passwordMatch) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: driver.id, email: driver.email, role: 'driver' },
        JWT_SECRET || process.env.JWT_SECRET || 'secret',
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        message: 'Login successful',
        token,
        driver: { id: driver.id, name: driver.name, email: driver.email }
      });
    } catch (error) {
      next(error);
    }
  },

  async getDriverProfile(req, res, next) {
    try {
      const driverId = req.user.id;
      const result = await query(`
        SELECT d.*, 
               COUNT(DISTINCT b.id)::int as completed_rides,
               COALESCE(AVG(dr.driver_rating), 0)::float as avg_rating
        FROM drivers d
        LEFT JOIN bookings b ON d.id = b.driver_id AND b.status = 'completed'
        LEFT JOIN driver_ratings dr ON b.id = dr.booking_id
        WHERE d.id = $1
        GROUP BY d.id
      `, [driverId]);

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Driver not found' });
      }

      res.json({ success: true, driver: result.rows[0] });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = driverAuthController;
