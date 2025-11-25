const Vendor = require('../models/Vendor');
const Driver = require('../models/Driver');

const vendorService = {
  async getAllVendors() {
    return Vendor.findAll();
  },

  async getVendorById(id) {
    return Vendor.findById(id);
  },

  async createVendor(data) {
    return Vendor.create(data);
  },

  async getVendorDrivers(vendorId) {
    return Driver.findByVendor(vendorId);
  }
};

module.exports = vendorService;
