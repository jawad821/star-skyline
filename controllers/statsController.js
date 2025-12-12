const Stats = require('../models/Stats');

const statsController = {
  async getSummary(req, res, next) {
    try {
      const { range, start, end } = req.query;
      let startDate, endDate;

      if (start && end) {
        startDate = start;
        endDate = end;
      } else if (range) {
        const dates = await Stats.getDateRange(range);
        if (!dates) {
          return res.status(400).json({ error: 'Invalid range' });
        }
        startDate = dates.startDate;
        endDate = dates.endDate;
      } else {
        return res.status(400).json({ error: 'Provide range or start/end dates' });
      }

      const summary = await Stats.getSummary(startDate, endDate);
      const trend = await Stats.getBookingsTrend(startDate, endDate);
      const revenueByType = await Stats.getRevenueByType(startDate, endDate);
      const driverStats = await Stats.getDriverStats(startDate, endDate);

      res.json({
        success: true,
        data: {
          summary,
          trend,
          revenueByType,
          driverStats,
          period: { startDate, endDate }
        }
      });
    } catch (error) {
      next(error);
    }
  },

  async getBookings(req, res, next) {
    try {
      const { range, start, end, status, vehicle_type } = req.query;
      let startDate, endDate;

      if (start && end) {
        startDate = start;
        endDate = end;
      } else if (range) {
        const dates = await Stats.getDateRange(range);
        if (!dates) {
          return res.status(400).json({ error: 'Invalid range' });
        }
        startDate = dates.startDate;
        endDate = dates.endDate;
      } else {
        return res.status(400).json({ error: 'Provide range or start/end dates' });
      }

      const filters = { status, vehicle_type };
      const bookings = await Stats.getAllBookings(startDate, endDate, filters);

      res.json({
        success: true,
        data: {
          bookings,
          period: { startDate, endDate }
        }
      });
    } catch (error) {
      next(error);
    }
  },

  async getEarningsBreakdown(req, res, next) {
    try {
      const { range } = req.query;
      let startDate, endDate;

      if (range) {
        const dates = await Stats.getDateRange(range);
        if (!dates) {
          return res.status(400).json({ error: 'Invalid range' });
        }
        startDate = dates.startDate;
        endDate = dates.endDate;
      } else {
        return res.status(400).json({ error: 'Provide range' });
      }

      const data = await Stats.getEarningsBreakdown(startDate, endDate);
      res.json({ success: true, data: data || [] });
    } catch (error) {
      next(error);
    }
  },

  async getVendorEarnings(req, res, next) {
    try {
      const { range } = req.query;
      let startDate, endDate;

      if (range) {
        const dates = await Stats.getDateRange(range);
        if (!dates) {
          return res.status(400).json({ error: 'Invalid range' });
        }
        startDate = dates.startDate;
        endDate = dates.endDate;
      } else {
        return res.status(400).json({ error: 'Provide range' });
      }

      const summary = await Stats.getSummary(startDate, endDate);
      const vendorComm = (summary?.total_revenue || 0) * 0.8;
      const companyProfit = (summary?.total_revenue || 0) * 0.2;

      res.json({
        success: true,
        data: {
          vendor_commission: vendorComm,
          company_profit: companyProfit,
          total_revenue: summary?.total_revenue || 0
        }
      });
    } catch (error) {
      next(error);
    }
  },

  async getTopVendors(req, res, next) {
    try {
      const { range } = req.query;
      let startDate, endDate;

      if (range) {
        const dates = await Stats.getDateRange(range);
        if (!dates) {
          return res.status(400).json({ error: 'Invalid range' });
        }
        startDate = dates.startDate;
        endDate = dates.endDate;
      } else {
        return res.status(400).json({ error: 'Provide range' });
      }

      const data = await Stats.getTopVendors(startDate, endDate);
      res.json({ success: true, data: data || [] });
    } catch (error) {
      next(error);
    }
  },

  async getUpcomingBookings(req, res, next) {
    try {
      const data = await Stats.getUpcomingBookings();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async getEarningsComparison(req, res, next) {
    try {
      const data = await Stats.getEarningsComparison();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async getCustomerFunnels(req, res, next) {
    try {
      const data = await Stats.getCustomerFunnels();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async getRevenueByBookingType(req, res, next) {
    try {
      const data = await Stats.getRevenueByBookingType();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = statsController;
