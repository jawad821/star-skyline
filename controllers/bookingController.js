const bookingService = require('../services/bookingService');

const bookingController = {
  async calculateFare(req, res, next) {
    try {
      const fare = bookingService.calculateFare(req.body);
      res.json({
        success: true,
        ...fare
      });
    } catch (error) {
      next(error);
    }
  },

  async createBooking(req, res, next) {
    try {
      const result = await bookingService.createBooking(req.body);
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  },

  async assignVehicle(req, res, next) {
    try {
      const { booking_id, vehicle_id } = req.body;
      const booking = await bookingService.assignVehicle(booking_id, vehicle_id);
      res.json({
        success: true,
        booking
      });
    } catch (error) {
      next(error);
    }
  },

  async assignDriver(req, res, next) {
    try {
      const { booking_id, driver_id } = req.body;
      const Booking = require('../models/Booking');
      const booking = await Booking.assignDriver(booking_id, driver_id);
      if (!booking) {
        return res.status(404).json({ success: false, error: 'Booking not found' });
      }
      res.json({ success: true, message: 'Driver assigned successfully', booking });
    } catch (error) {
      next(error);
    }
  },

  async assignVehicleType(req, res, next) {
    try {
      const { booking_id, vehicle_id, vehicle_type } = req.body;
      const Booking = require('../models/Booking');
      const booking = await Booking.assignVehicleAndType(booking_id, vehicle_id, vehicle_type);
      if (!booking) {
        return res.status(404).json({ success: false, error: 'Booking not found' });
      }
      res.json({ success: true, message: 'Vehicle and type updated successfully', booking });
    } catch (error) {
      next(error);
    }
  },

  async resendNotifications(req, res, next) {
    try {
      const { booking_id } = req.body;
      const Booking = require('../models/Booking');
      const booking = await Booking.findById(booking_id);
      
      if (!booking) {
        return res.status(404).json({ success: false, error: 'Booking not found' });
      }

      const emailService = require('../utils/emailService');
      await emailService.sendCustomerNotification(booking, null);
      
      res.json({ success: true, message: 'Notifications resent to customer' });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = bookingController;
