const Driver = require('../models/Driver');

const driverController = {
  async getAllDrivers(req, res, next) {
    try {
      const { status } = req.query;
      const { query } = require('../config/db');
      let sql = `
        SELECT 
          d.*,
          v.id as assigned_vehicle_id,
          v.model as assigned_vehicle_model,
          v.type as assigned_vehicle_type,
          v.plate_number as assigned_vehicle_plate
        FROM drivers d
        LEFT JOIN vehicles v ON d.id = v.driver_id
      `;
      const params = [];
      if (status) {
        // include driver_registration_status for pending signups
        sql += ' WHERE (d.status = $1 OR d.driver_registration_status = $1)';
        params.push(status);
      }
      sql += ' ORDER BY d.name';
      const result = await query(sql, params);
      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      next(error);
    }
  },

  async getDriverById(req, res, next) {
    try {
      const { id } = req.params;
      const driver = await Driver.getDetailedInfo(id);
      if (!driver) {
        return res.status(404).json({ success: false, error: 'Driver not found' });
      }
      res.json({
        success: true,
        driver
      });
    } catch (error) {
      next(error);
    }
  },

  async updateDriver(req, res, next) {
    try {
      const { id } = req.params;
      const auditLogger = require('../utils/auditLogger');
      const oldDriver = await Driver.findById(id);
      const user = req.user || { username: 'unknown', role: 'admin' };

      // If status is being set to approved/active, ensure registration status matches
      if (req.body.status === 'approved' || req.body.status === 'active') {
        req.body.driver_registration_status = 'approved';
      }

      const driver = await Driver.updateDriver(id, req.body);

      const changes = {};
      if (oldDriver) {
        for (let key in req.body) {
          if (oldDriver[key] !== req.body[key]) {
            changes[key] = { old: oldDriver[key], new: req.body[key] };
          }
        }
      }

      if (Object.keys(changes).length > 0) {
        await auditLogger.logChange('driver', id, 'UPDATE', changes, user.username, user.username, user.role).catch(e => console.error('Audit error:', e));
      }

      // If the driver registration/status was changed to 'approved', notify driver
      try {
        const notificationService = require('../services/notificationService');
        if ((changes.status && changes.status.new === 'approved') || (changes.driver_registration_status && changes.driver_registration_status.new === 'approved')) {
          const updatedDriver = await Driver.findById(id);
          await notificationService.sendDriverApprovalNotification(updatedDriver);
        }
      } catch (notifErr) {
        console.error('Driver approval notification error:', notifErr);
      }

      res.json({
        success: true,
        message: 'Driver updated successfully',
        driver
      });
    } catch (error) {
      next(error);
    }
  },

  async getAvailableDrivers(req, res, next) {
    try {
      const { query } = require('../config/db');
      const result = await query(`
        SELECT id, name, license_number, auto_assign, status
        FROM drivers
        WHERE auto_assign = true
        ORDER BY name
      `);
      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      next(error);
    }
  },

  async createDriver(req, res, next) {
    try {
      const { name, phone, license_number, status = 'active' } = req.body;
      const { query } = require('../config/db');
      const auditLogger = require('../utils/auditLogger');
      const user = req.user || { username: 'unknown', role: 'admin' };

      // Validation
      if (!name || !phone || !license_number) {
        return res.status(400).json({
          success: false,
          error: 'Name, phone, and license number are required'
        });
      }

      // Create driver
      const result = await query(`
        INSERT INTO drivers (name, phone, license_number, status, auto_assign)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [name, phone, license_number, status, true]);

      const driver = result.rows[0];

      // Audit log
      await auditLogger.logChange('driver', driver.id, 'CREATE',
        { name, phone, license_number, status },
        user.username, user.username, user.role
      ).catch(e => console.error('Audit error:', e));

      res.json({
        success: true,
        message: 'Driver created successfully',
        data: driver
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteDriver(req, res, next) {
    try {
      const { id } = req.params;
      const auditLogger = require('../utils/auditLogger');
      const oldDriver = await Driver.findById(id);
      if (!oldDriver) return res.status(404).json({ success: false, error: 'Driver not found' });

      const deleted = await Driver.deleteDriver(id);

      await auditLogger.logChange('driver', id, 'DELETE', { status: { old: oldDriver.status, new: 'deleted' } }, req.user ? req.user.username : 'system', req.user ? req.user.username : 'system', req.user ? req.user.role : 'system').catch(e => console.error('Audit error:', e));

      res.json({ success: true, message: 'Driver deleted (soft)', data: deleted });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = driverController;
