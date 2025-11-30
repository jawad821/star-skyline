const rentalRulesService = require('../services/rentalRulesService');

const rentalRulesController = {
  // Get all rental rules
  async getAllRentalRules(req, res, next) {
    try {
      const rules = await rentalRulesService.getAllRentalRules();
      res.json({ success: true, data: rules });
    } catch (error) {
      next(error);
    }
  },

  // Get rental rule by vehicle type
  async getRentalRule(req, res, next) {
    try {
      const { vehicleType } = req.params;
      const rule = await rentalRulesService.getRentalRuleByType(vehicleType);
      
      if (!rule) {
        return res.status(404).json({ success: false, error: 'Rental rule not found' });
      }
      
      res.json({ success: true, data: rule });
    } catch (error) {
      next(error);
    }
  },

  // Update rental rule (Edit pricing)
  async updateRentalRule(req, res, next) {
    try {
      const { vehicleType } = req.params;
      const { hourly_rate_aed, min_hours, max_hours } = req.body;
      
      // Validation
      if (hourly_rate_aed && hourly_rate_aed <= 0) {
        return res.status(400).json({ success: false, error: 'Hourly rate must be greater than 0' });
      }
      
      if ((min_hours && min_hours < 1) || (min_hours && min_hours > 24)) {
        return res.status(400).json({ success: false, error: 'Minimum hours must be between 1 and 24' });
      }
      
      if ((max_hours && max_hours < 1) || (max_hours && max_hours > 24)) {
        return res.status(400).json({ success: false, error: 'Maximum hours must be between 1 and 24' });
      }

      const updatedRule = await rentalRulesService.updateRentalRule(vehicleType, {
        hourly_rate_aed,
        min_hours,
        max_hours
      });
      
      if (!updatedRule) {
        return res.status(404).json({ success: false, error: 'Rental rule not found' });
      }
      
      res.json({ success: true, data: updatedRule, message: 'Rental rule updated successfully' });
    } catch (error) {
      next(error);
    }
  },

  // Create new rental rule
  async createRentalRule(req, res, next) {
    try {
      const { vehicle_type, hourly_rate_aed, min_hours = 3, max_hours = 14 } = req.body;
      
      if (!vehicle_type || !hourly_rate_aed) {
        return res.status(400).json({ 
          success: false, 
          error: 'vehicle_type and hourly_rate_aed are required' 
        });
      }
      
      if (hourly_rate_aed <= 0) {
        return res.status(400).json({ success: false, error: 'Hourly rate must be greater than 0' });
      }
      
      const newRule = await rentalRulesService.createRentalRule(
        vehicle_type, 
        hourly_rate_aed, 
        min_hours, 
        max_hours
      );
      
      res.status(201).json({ 
        success: true, 
        data: newRule, 
        message: 'Rental rule created/updated successfully' 
      });
    } catch (error) {
      next(error);
    }
  },

  // Calculate rental fare
  async calculateRentalFare(req, res, next) {
    try {
      const { vehicle_type, hours } = req.body;
      
      if (!vehicle_type || !hours) {
        return res.status(400).json({ 
          success: false, 
          error: 'vehicle_type and hours are required' 
        });
      }
      
      const fareData = await rentalRulesService.calculateRentalFare(vehicle_type, hours);
      res.json({ success: true, data: fareData });
    } catch (error) {
      if (error.message.includes('between')) {
        return res.status(400).json({ success: false, error: error.message });
      }
      next(error);
    }
  }
};

module.exports = rentalRulesController;
