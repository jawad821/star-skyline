const Vehicle = require('../models/Vehicle');

const vehicleService = {
  async getAvailableVehicles(type = null) {
    return Vehicle.findAvailable(type);
  },

  async getVehicleById(id) {
    return Vehicle.findById(id);
  },

  async updateVehicleStatus(id, status) {
    return Vehicle.updateStatus(id, status);
  },

  async createVehicle(vehicleData) {
    // Validate required fields
    if (!vehicleData.plate_number || !vehicleData.model || !vehicleData.type) {
      throw new Error('plate_number, model, and type are required');
    }

    if (!vehicleData.per_km_price || !vehicleData.hourly_price) {
      throw new Error('per_km_price and hourly_price are required');
    }

    // Validate vehicle type
    const validTypes = ['sedan', 'suv', 'luxury', 'van', 'bus', 'minibus'];
    if (!validTypes.includes(vehicleData.type)) {
      throw new Error(`Invalid vehicle type. Must be one of: ${validTypes.join(', ')}`);
    }

    return Vehicle.create(vehicleData);
  }
};

module.exports = vehicleService;
