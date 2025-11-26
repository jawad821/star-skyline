const Customer = require('../models/Customer');
const Booking = require('../models/Booking');

const customerController = {
  async getAllCustomers(req, res) {
    try {
      const limit = req.query.limit || 50;
      const offset = req.query.offset || 0;
      const customers = await Customer.findAll(limit, offset);

      res.json({ success: true, data: customers });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async searchCustomers(req, res) {
    try {
      const searchTerm = req.query.q || '';
      if (!searchTerm) {
        return res.json({ success: true, data: [] });
      }

      const customers = await Customer.search(searchTerm);
      res.json({ success: true, data: customers });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async getCustomerById(req, res) {
    try {
      const customer = await Customer.findById(req.params.id);
      if (!customer) {
        return res.status(404).json({ success: false, error: 'Customer not found' });
      }

      const stats = await Customer.getStats(customer.id);
      res.json({ success: true, data: { ...customer, stats } });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async getCustomerByPhone(req, res) {
    try {
      const customer = await Customer.findByPhone(req.params.phone);
      if (!customer) {
        return res.status(404).json({ success: false, error: 'Customer not found' });
      }

      const stats = await Customer.getStats(customer.id);
      res.json({ success: true, data: { ...customer, stats } });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async createCustomer(req, res) {
    try {
      const { name, phone, email, whatsapp, preferred_vehicle, notes } = req.body;

      if (!name || !phone) {
        return res.status(400).json({ success: false, error: 'Name and phone required' });
      }

      const existing = await Customer.findByPhone(phone);
      if (existing) {
        return res.status(400).json({ success: false, error: 'Customer already exists' });
      }

      const customer = await Customer.create({
        name,
        phone,
        email,
        whatsapp,
        preferred_vehicle,
        notes
      });

      res.status(201).json({ success: true, data: customer });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async updateCustomer(req, res) {
    try {
      const customer = await Customer.update(req.params.id, req.body);
      if (!customer) {
        return res.status(404).json({ success: false, error: 'Customer not found' });
      }

      res.json({ success: true, data: customer });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async deleteCustomer(req, res) {
    try {
      const result = await Customer.delete(req.params.id);
      if (!result) {
        return res.status(404).json({ success: false, error: 'Customer not found' });
      }

      res.json({ success: true, message: 'Customer deleted' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
};

module.exports = customerController;
