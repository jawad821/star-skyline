const vehicleService = require('../services/vehicleService');
const { query } = require('../config/db');
const fareCalculator = require('../utils/fareCalculator');

const vehicleController = {
  async suggestVehicles(req, res, next) {
    try {
      const { passengers_count, luggage_count } = req.query;

      console.log('\n🚗 [BAREERAH] Suggesting vehicles...');
      console.log('   👥 Passengers requested:', passengers_count);
      console.log('   🧳 Luggage requested:', luggage_count);

      // Validate input
      if (!passengers_count || !luggage_count) {
        console.log('❌ [BAREERAH] Missing required parameters');
        return res.status(400).json({
          success: false,
          error: 'passengers_count and luggage_count are required'
        });
      }

      const pax = parseInt(passengers_count);
      const luggage = parseInt(luggage_count);

      if (pax < 1 || luggage < 0) {
        console.log('❌ [BAREERAH] Invalid parameter values');
        return res.status(400).json({
          success: false,
          error: 'passengers_count must be >= 1, luggage_count must be >= 0'
        });
      }

      // Get all vehicles
      console.log('   🔍 Searching database for matching vehicles...');
      const result = await query(`
        SELECT DISTINCT 
          type, 
          max_passengers, 
          max_luggage,
          COUNT(*) as available_count
        FROM vehicles 
        WHERE max_passengers >= $1 AND max_luggage >= $2
        GROUP BY type, max_passengers, max_luggage
        ORDER BY max_passengers ASC, max_luggage ASC
      `, [pax, luggage]);

      if (result.rows.length === 0) {
        console.log(`❌ [BAREERAH] No vehicles found for ${pax} pax, ${luggage} luggage`);
        return res.status(400).json({
          success: false,
          error: `No vehicles available for ${pax} passengers and ${luggage} luggage`
        });
      }

      console.log(`✅ [BAREERAH] Found ${result.rows.length} matching vehicle types`);

      // Get fare rules for each vehicle type to include pricing
      const suggestions = [];
      for (const vehicle of result.rows) {
        const fareRuleResult = await query(
          'SELECT base_fare, per_km_rate FROM fare_rules WHERE vehicle_type = $1 LIMIT 1',
          [vehicle.type]
        );

        const fareRule = fareRuleResult.rows[0] || { base_fare: 0, per_km_rate: 0 };
        suggestions.push({
          vehicle_type: vehicle.type,
          max_passengers: vehicle.max_passengers,
          max_luggage: vehicle.max_luggage,
          available_count: vehicle.available_count,
          base_fare: parseFloat(fareRule.base_fare),
          per_km_rate: parseFloat(fareRule.per_km_rate),
          capacity_fit: {
            passengers: vehicle.max_passengers - pax,
            luggage: vehicle.max_luggage - luggage
          },
          fitness_score: ((vehicle.max_passengers - pax) + (vehicle.max_luggage - luggage)) / 2
        });
      }

      res.json({
        success: true,
        data: {
          requested: { passengers_count: pax, luggage_count: luggage },
          suggested_vehicles: suggestions,
          message: `Found ${suggestions.length} suitable vehicle(s) for your requirements`
        }
      });
    } catch (error) {
      next(error);
    }
  },

  async getAvailableVehicles(req, res, next) {
    try {
      const { type } = req.query;
      const vehicles = await vehicleService.getAvailableVehicles(type);
      res.json({
        success: true,
        data: vehicles
      });
    } catch (error) {
      next(error);
    }
  },

  async getVehicleById(req, res, next) {
    try {
      const Vehicle = require('../models/Vehicle');
      const vehicle = await Vehicle.findById(req.params.id);
      if (!vehicle) {
        return res.status(404).json({
          success: false,
          error: 'Vehicle not found'
        });
      }
      res.json({
        success: true,
        data: vehicle,
        vehicle: vehicle
      });
    } catch (error) {
      next(error);
    }
  },

  async createVehicle(req, res, next) {
    try {
      const vehicle = await vehicleService.createVehicle(req.body);
      const auditLogger = require('../utils/auditLogger');
      const user = req.user || { username: 'system', role: 'admin' };

      await auditLogger.logChange(
        'vehicle',
        vehicle.id,
        'CREATE',
        { ...req.body, id: vehicle.id },
        user.username,
        user.username,
        user.role
      ).catch(e => console.error('Audit error:', e));

      res.status(201).json({
        success: true,
        message: 'Vehicle created successfully',
        vehicle
      });
    } catch (error) {
      next(error);
    }
  },

  async getAllVehicles(req, res, next) {
    try {
      const { type } = req.query;
      const Vehicle = require('../models/Vehicle');
      const vehicles = await Vehicle.getAll(type);
      res.json({
        success: true,
        data: vehicles
      });
    } catch (error) {
      next(error);
    }
  },

  async updateVehicle(req, res, next) {
    try {
      const { id } = req.params;
      const Vehicle = require('../models/Vehicle');
      const auditLogger = require('../utils/auditLogger');

      // Get old vehicle data for change tracking
      const oldVehicle = await Vehicle.findById(id);

      // Get user info from token (JWT has username, not name)
      const user = req.user || { username: 'unknown', role: 'admin' };

      // Update vehicle
      const vehicle = await Vehicle.updateVehicle(id, req.body);

      // Log changes
      const changes = {};
      for (let key in req.body) {
        if (oldVehicle[key] !== req.body[key]) {
          changes[key] = { old: oldVehicle[key], new: req.body[key] };
        }
      }

      if (Object.keys(changes).length > 0) {
        await auditLogger.logChange('vehicle', id, 'UPDATE', changes, user.username, user.username, user.role);
      }

      res.json({
        success: true,
        message: 'Vehicle updated successfully',
        vehicle
      });
    } catch (error) {
      next(error);
    }
  },
  async deleteVehicle(req, res, next) {
    try {
      const { id } = req.params;
      const Vehicle = require('../models/Vehicle');
      const auditLogger = require('../utils/auditLogger');
      const oldVehicle = await Vehicle.findById(id);
      if (!oldVehicle) return res.status(404).json({ success: false, error: 'Vehicle not found' });

      // Soft deactivate
      const vehicle = await Vehicle.updateVehicle(id, { active: false, status: 'disabled' });

      const user = req.user || { username: 'system', role: 'admin' };
      const changes = { active: { old: oldVehicle.active, new: false }, status: { old: oldVehicle.status, new: 'disabled' } };
      await auditLogger.logChange('vehicle', id, 'DELETE', changes, user.username, user.username, user.role).catch(e => console.error('Audit error:', e));

      res.json({ success: true, message: 'Vehicle deactivated (soft)', data: vehicle });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = vehicleController;
