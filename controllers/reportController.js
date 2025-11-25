const reportService = require('../services/reportService');
const { generateCSV } = require('../utils/csvExport');
const { generateExcelXML } = require('../utils/excelExport');

const reportController = {
  async getSummary(req, res, next) {
    try {
      const { from, to } = req.query;
      const summary = await reportService.getSummary(from, to);
      
      res.json({
        success: true,
        ...summary
      });
    } catch (error) {
      next(error);
    }
  },

  async exportCSV(req, res, next) {
    try {
      const { from, to } = req.query;
      const bookings = await reportService.getBookingsForExport(from, to);
      
      const columns = [
        'id', 'customer_name', 'customer_phone', 'pickup_location',
        'dropoff_location', 'distance_km', 'fare_aed', 'vehicle_type',
        'status', 'created_at', 'vendor_name', 'plate_number', 'model'
      ];
      
      const csv = generateCSV(bookings, columns);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=bookings-export.csv');
      res.send(csv);
    } catch (error) {
      next(error);
    }
  },

  async exportExcel(req, res, next) {
    try {
      const { from, to } = req.query;
      const bookings = await reportService.getBookingsForExport(from, to);
      
      const columns = [
        'id', 'customer_name', 'customer_phone', 'pickup_location',
        'dropoff_location', 'distance_km', 'fare_aed', 'vehicle_type',
        'status', 'created_at', 'vendor_name', 'plate_number', 'model'
      ];
      
      const excel = generateExcelXML(bookings, columns, 'Bookings');
      
      res.setHeader('Content-Type', 'application/vnd.ms-excel');
      res.setHeader('Content-Disposition', 'attachment; filename=bookings-export.xls');
      res.send(excel);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = reportController;
