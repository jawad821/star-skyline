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
        sql += ' WHERE d.status = $1';
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
      const oldDriver = await Driver.getById(id);
      const user = req.user || { username: 'unknown', role: 'admin' };
      
      const driver = await Driver.updateDriver(id, req.body);
      
      const changes = {};
      for (let key in req.body) {
        if (oldDriver && oldDriver[key] !== req.body[key]) {
          changes[key] = { old: oldDriver[key], new: req.body[key] };
        }
      }
      
      if (Object.keys(changes).length > 0) {
        await auditLogger.logChange('driver', id, 'UPDATE', changes, user.username, user.username, user.role);
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
  }
};

module.exports = driverController;
