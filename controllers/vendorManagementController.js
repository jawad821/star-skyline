const { query } = require('../config/db');
const logger = require('../utils/logger');
const bcryptjs = require('bcryptjs');
const auditLogger = require('../utils/auditLogger');

const vendorManagementController = {
  async createVendor(req, res, next) {
    try {
      const { name, email, phone, password, bank_account_number, bank_name, account_holder_name } = req.body;

      if (!name || !email || !phone || !password) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
      }

      // Check for existing vendor
      const existing = await query('SELECT id FROM vendors WHERE email = $1', [email]);
      if (existing.rows.length > 0) {
        return res.status(400).json({ success: false, error: 'Vendor with this email already exists' });
      }

      const passwordHash = await bcryptjs.hash(password, 10);

      const result = await query(`
        INSERT INTO vendors (
          name, email, phone, password_hash, 
          bank_account_number, bank_name, account_holder_name,
          status, approval_reason, created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'approved', 'Created by admin', NOW())
        RETURNING id, name, email, status
      `, [name, email, phone, passwordHash, bank_account_number, bank_name, account_holder_name]);

      const newVendor = result.rows[0];
      logger.info(`Vendor created by admin: ${newVendor.name}`);

      // AUDIT LOG
      await auditLogger.logChange(
        'vendor',
        newVendor.id,
        'CREATE',
        { name, email, status: 'approved' },
        req.user.id,
        req.user.name,
        req.user.role,
        req.ip
      );

      res.status(201).json({
        success: true,
        message: 'Vendor created successfully',
        vendor: newVendor
      });
    } catch (error) {
      next(error);
    }
  },
  async getPendingVendors(req, res, next) {
    try {
      const result = await query(`
        SELECT id, name, email, phone, status, approval_reason, created_at
        FROM vendors
        WHERE status IN ('pending', 'rejected')
        ORDER BY created_at DESC
      `);
      res.json({ success: true, data: result.rows });
    } catch (error) {
      next(error);
    }
  },

  async approveVendor(req, res, next) {
    try {
      const { vendorId } = req.params;
      const result = await query(`
        UPDATE vendors
        SET status = 'approved', approval_reason = 'Approved by admin'
        WHERE id = $1
        RETURNING *
      `, [vendorId]);

      logger.info(`Vendor approved: ${result.rows[0].name}`);

      // AUDIT LOG
      await auditLogger.logChange(
        'vendor',
        vendorId,
        'UPDATE',
        { status: 'approved' },
        req.user.id,
        req.user.name,
        req.user.role,
        req.ip
      );

      res.json({ success: true, message: 'Vendor approved', vendor: result.rows[0] });
    } catch (error) {
      next(error);
    }
  },

  async rejectVendor(req, res, next) {
    try {
      const { vendorId } = req.params;
      const { reason } = req.body;

      const result = await query(`
        UPDATE vendors
        SET status = 'rejected', approval_reason = $1
        WHERE id = $2
        RETURNING *
      `, [reason || 'Rejected by admin', vendorId]);

      // AUDIT LOG
      await auditLogger.logChange(
        'vendor',
        vendorId,
        'UPDATE',
        { status: 'rejected', reason },
        req.user.id,
        req.user.name,
        req.user.role,
        req.ip
      );

      res.json({ success: true, message: 'Vendor rejected', vendor: result.rows[0] });
    } catch (error) {
      next(error);
    }
  },

  async updateVendor(req, res, next) {
    try {
      const { vendorId } = req.params;
      const updates = req.body;

      // Fetch old vendor data
      const oldVendor = await query('SELECT * FROM vendors WHERE id = $1', [vendorId]);
      if (oldVendor.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Vendor not found' });
      }

      // Build dynamic update query
      const fields = Object.keys(updates).filter(k => k !== 'id' && k !== 'password'); // Exclude ID and password from direct update
      if (fields.length === 0) {
        return res.json({ success: true, message: 'No changes made' });
      }

      const setClause = fields.map((f, i) => `${f} = $${i + 2}`).join(', ');
      const values = fields.map(f => updates[f]);

      const result = await query(`
          UPDATE vendors
          SET ${setClause}, updated_at = NOW()
          WHERE id = $1
          RETURNING *
        `, [vendorId, ...values]);

      // Calculate changes for audit log
      const changes = {};
      fields.forEach(f => {
        if (oldVendor.rows[0][f] != updates[f]) {
          changes[f] = { old: oldVendor.rows[0][f], new: updates[f] };
        }
      });

      // AUDIT LOG
      if (Object.keys(changes).length > 0) {
        await auditLogger.logChange(
          'vendor',
          vendorId,
          'UPDATE',
          changes,
          req.user.id,
          req.user.name,
          req.user.role,
          req.ip
        );
      }

      logger.info(`Vendor updated: ${result.rows[0].name}`);
      res.json({ success: true, message: 'Vendor updated successfully', vendor: result.rows[0] });
    } catch (error) {
      next(error);
    }
  },



  async deleteVendor(req, res, next) {
    try {
      const { vendorId } = req.params;

      // First unassign vehicles
      await query(`UPDATE vehicles SET vendor_id = NULL WHERE vendor_id = $1`, [vendorId]);

      // Also check/handle other constraints if necessary (e.g., payouts, bookings)
      // For now, vehicles is the reported blocker.
      // If bookings are linked directly to vendor (not just via vehicle), they might blocked too.
      // Based on schema, bookings usually link to vehicle. 
      // But if there are other constraints, we might need to handle them.
      // Let's assume decoupling vehicles is enough for now as per the error.

      const result = await query(`
        DELETE FROM vendors
        WHERE id = $1
        RETURNING *
      `, [vendorId]);

      if (result.rowCount === 0) {
        return res.status(404).json({ success: false, error: 'Vendor not found' });
      }

      logger.info(`Vendor deleted: ${result.rows[0].name}`);

      // AUDIT LOG
      await auditLogger.logChange(
        'vendor',
        vendorId,
        'DELETE',
        { name: result.rows[0].name },
        req.user.id,
        req.user.name,
        req.user.role,
        req.ip
      );

      res.json({ success: true, message: 'Vendor deleted successfully' });
    } catch (error) {
      if (error.code === '23503') { // Foreign key violation
        return res.status(400).json({ success: false, error: 'Cannot delete vendor because they have active data linked to them (Bookings/Payouts).' });
      }
      next(error);
    }
  },

  async getVendorFleet(req, res, next) {
    try {
      const vendorId = req.params.vendorId;
      const result = await query(`
        SELECT v.*, 
               COUNT(DISTINCT vc.id)::int as vehicle_count,
               STRING_AGG(DISTINCT vc.type, ', ')::text as vehicle_types
        FROM vendors v
        LEFT JOIN vehicles vc ON v.id = vc.vendor_id
        WHERE v.id = $1
        GROUP BY v.id
      `, [vendorId]);

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Vendor not found' });
      }

      const vehiclesResult = await query(`
        SELECT id, model, type, plate_number, color, status
        FROM vehicles
        WHERE vendor_id = $1
        ORDER BY type
      `, [vendorId]);

      res.json({
        success: true,
        vendor: result.rows[0],
        vehicles: vehiclesResult.rows
      });
    } catch (error) {
      next(error);
    }
  },

  async getVendorEarnings(req, res, next) {
    try {
      const vendorId = req.params.vendorId;
      const result = await query(`
        SELECT 
          COUNT(DISTINCT b.id)::int as total_bookings,
          COALESCE(SUM(b.fare_aed * 0.8), 0)::float as total_earnings,
          COALESCE(SUM(CASE WHEN p.status = 'completed' THEN p.amount_aed ELSE 0 END), 0)::float as paid_amount,
          COALESCE(SUM(CASE WHEN p.status = 'pending' THEN p.amount_aed ELSE 0 END), 0)::float as pending_payout
        FROM vendors v
        LEFT JOIN vehicles vc ON v.id = vc.vendor_id
        LEFT JOIN bookings b ON vc.id = b.vehicle_id
        LEFT JOIN payouts p ON v.id = p.vendor_id
        WHERE v.id = $1
      `, [vendorId]);

      res.json({ success: true, earnings: result.rows[0] });
    } catch (error) {
      next(error);
    }
  },

  async approvePendingDrivers(req, res, next) {
    try {
      const result = await query(`
        SELECT id, name, email, license_number, driver_registration_status, created_at
        FROM drivers
        WHERE driver_registration_status IN ('pending', 'rejected')
        ORDER BY created_at DESC
      `);
      res.json({ success: true, data: result.rows });
    } catch (error) {
      next(error);
    }
  },

  async approveDriver(req, res, next) {
    try {
      const { driverId } = req.params;
      const result = await query(`
        UPDATE drivers
        SET driver_registration_status = 'approved'
        WHERE id = $1
        RETURNING *
      `, [driverId]);

      res.json({ success: true, message: 'Driver approved', driver: result.rows[0] });
    } catch (error) {
      next(error);
    }
  },

  async rejectDriver(req, res, next) {
    try {
      const { driverId } = req.params;
      const { reason } = req.body;

      const result = await query(`
        UPDATE drivers
        SET driver_registration_status = 'rejected'
        WHERE id = $1
        RETURNING *
      `, [driverId]);

      res.json({ success: true, message: 'Driver rejected', driver: result.rows[0] });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = vendorManagementController;
