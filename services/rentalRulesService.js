const { query } = require('../config/db');

const rentalRulesService = {
  // Get all rental rules
  async getAllRentalRules() {
    try {
      const result = await query(`
        SELECT * FROM rental_rules ORDER BY vehicle_type ASC
      `);
      return result.rows || [];
    } catch (error) {
      console.error('Error fetching rental rules:', error);
      throw error;
    }
  },

  // Get rental rule by vehicle type
  async getRentalRuleByType(vehicleType) {
    try {
      const result = await query(`
        SELECT * FROM rental_rules WHERE vehicle_type = $1
      `, [vehicleType]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching rental rule:', error);
      throw error;
    }
  },

  // Update rental rule (edit pricing)
  async updateRentalRule(vehicleType, updateData) {
    try {
      const { hourly_rate_aed, min_hours, max_hours } = updateData;
      
      const result = await query(`
        UPDATE rental_rules 
        SET hourly_rate_aed = COALESCE($1, hourly_rate_aed),
            min_hours = COALESCE($2, min_hours),
            max_hours = COALESCE($3, max_hours),
            updated_at = CURRENT_TIMESTAMP
        WHERE vehicle_type = $4
        RETURNING *
      `, [hourly_rate_aed, min_hours, max_hours, vehicleType]);
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error updating rental rule:', error);
      throw error;
    }
  },

  // Add new rental rule (for new vehicle type)
  async createRentalRule(vehicleType, hourlyRate, minHours = 3, maxHours = 14) {
    try {
      const result = await query(`
        INSERT INTO rental_rules (vehicle_type, hourly_rate_aed, min_hours, max_hours)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (vehicle_type) DO UPDATE
        SET hourly_rate_aed = $2, min_hours = $3, max_hours = $4, updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `, [vehicleType, hourlyRate, minHours, maxHours]);
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error creating rental rule:', error);
      throw error;
    }
  },

  // Calculate hourly rental fare
  async calculateRentalFare(vehicleType, hours) {
    try {
      const rule = await this.getRentalRuleByType(vehicleType);
      
      if (!rule) {
        throw new Error(`No rental rule found for vehicle type: ${vehicleType}`);
      }

      if (hours < rule.min_hours || hours > rule.max_hours) {
        throw new Error(`Hours must be between ${rule.min_hours} and ${rule.max_hours}`);
      }

      const fare = rule.hourly_rate_aed * hours;
      
      return {
        vehicle_type: vehicleType,
        hours,
        hourly_rate: rule.hourly_rate_aed,
        total_fare: Math.round(fare * 100) / 100,
        min_hours: rule.min_hours,
        max_hours: rule.max_hours
      };
    } catch (error) {
      console.error('Error calculating rental fare:', error);
      throw error;
    }
  }
};

module.exports = rentalRulesService;
