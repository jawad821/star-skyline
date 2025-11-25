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
  }
};

module.exports = vehicleService;
