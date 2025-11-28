const vendorService = require('../services/vendorService');
const Vendor = require('../models/Vendor');
const { query } = require('../config/db');

const vendorController = {
  async getAllVendors(req, res, next) {
    try {
      const vendors = await Vendor.findAll();
      res.json({ success: true, data: vendors });
    } catch (error) {
      next(error);
    }
  },

  async getVendorsByStatus(req, res, next) {
    try {
      const { status } = req.params;
      const vendors = await Vendor.findByStatus(status);
      res.json({ success: true, data: vendors });
    } catch (error) {
      next(error);
    }
  },

  async getVendorById(req, res, next) {
    try {
      const vendor = await Vendor.getVendorWithStats(req.params.id);
      if (!vendor) {
        return res.status(404).json({ success: false, error: 'Vendor not found' });
      }
      res.json({ success: true, vendor });
    } catch (error) {
      next(error);
    }
  },

  async createVendor(req, res, next) {
    try {
      const vendor = await Vendor.create(req.body);
      res.status(201).json({ success: true, vendor });
    } catch (error) {
      next(error);
    }
  },

  async approveVendor(req, res, next) {
    try {
      const vendor = await Vendor.approveVendor(req.params.id);
      res.json({ success: true, message: 'Vendor approved', vendor });
    } catch (error) {
      next(error);
    }
  },

  async rejectVendor(req, res, next) {
    try {
      const { reason } = req.body;
      const vendor = await Vendor.rejectVendor(req.params.id, reason);
      res.json({ success: true, message: 'Vendor rejected', vendor });
    } catch (error) {
      next(error);
    }
  },

  async toggleAutoAssign(req, res, next) {
    try {
      const { disabled } = req.body;
      const vendor = await Vendor.toggleAutoAssign(req.params.id, disabled);
      const action = disabled ? 'disabled' : 'enabled';
      res.json({ success: true, message: `Vendor auto-assignment ${action}`, vendor });
    } catch (error) {
      next(error);
    }
  },

  async getVendorDrivers(req, res, next) {
    try {
      const drivers = await vendorService.getVendorDrivers(req.params.id);
      res.json({ success: true, drivers });
    } catch (error) {
      next(error);
    }
  },

  async getVendorBookings(req, res, next) {
    try {
      const { vendor_id } = req.params;
      const result = await query(`
        SELECT b.*, d.name as driver_name, v.model as vehicle_model
        FROM bookings b
        LEFT JOIN drivers d ON b.driver_id = d.id
        LEFT JOIN vehicles v ON b.assigned_vehicle_id = v.id
        WHERE b.vendor_id = $1
        ORDER BY b.created_at DESC
      `, [vendor_id]);
      res.json({ success: true, bookings: result.rows });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = vendorController;
