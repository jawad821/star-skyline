const { query } = require('../config/db');
const { calculateFare } = require('../utils/fareCalculator');

const pushController = {
  async bareerahEvent(req, res, next) {
    try {
      const {
        external_id,
        customer_name,
        customer_phone,
        pickup_location,
        dropoff_location,
        distance_km,
        hours,
        booking_type,
        vehicle_type
      } = req.body;
      
      if (!customer_name || !customer_phone) {
        return res.status(400).json({
          success: false,
          error: 'customer_name and customer_phone are required'
        });
      }
      
      if (external_id) {
        const existingBooking = await query(
          'SELECT id, fare_aed, status FROM bookings WHERE external_id = $1',
          [external_id]
        );
        
        if (existingBooking.rows.length > 0) {
          return res.json({
            success: true,
            message: 'Booking already exists',
            booking_id: existingBooking.rows[0].id,
            fare: parseFloat(existingBooking.rows[0].fare_aed),
            status: existingBooking.rows[0].status,
            idempotent: true
          });
        }
      }
      
      const vType = vehicle_type || 'sedan';
      const bType = booking_type || 'point';
      const km = distance_km || 10;
      const hrs = hours || 0;
      
      const fare = calculateFare(bType, vType, km, hrs);
      
      const bookingResult = await query(`
        INSERT INTO bookings (
          external_id, customer_name, customer_phone, pickup_location, dropoff_location,
          distance_km, fare_aed, vehicle_type, booking_type, booking_source, pickup_time, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending')
        RETURNING id
      `, [
        external_id || null,
        customer_name,
        customer_phone,
        pickup_location || null,
        dropoff_location || null,
        km,
        fare.fare_after_discount,
        vType,
        bType,
        'bareerah_ai',
        req.body.pickup_time || null
      ]);
      
      const bookingId = bookingResult.rows[0].id;
      
      const availableVehicle = await query(`
        SELECT v.id as vehicle_id, v.vendor_id, v.model as vehicle_model, v.color as vehicle_color, v.driver_id
        FROM vehicles v
        WHERE v.status = 'available' AND v.type = $1
        LIMIT 1
      `, [vType]);
      
      let vendorPayout = null;
      
      if (availableVehicle.rows.length > 0) {
        const vehicle = availableVehicle.rows[0];
        
        await query('UPDATE vehicles SET status = $1 WHERE id = $2', ['on_trip', vehicle.vehicle_id]);
        await query(`
          UPDATE bookings 
          SET assigned_vehicle_id = $1, vendor_id = $2, status = 'assigned', vehicle_model = $3, vehicle_color = $4, driver_id = $5
          WHERE id = $6
        `, [vehicle.vehicle_id, vehicle.vendor_id, vehicle.vehicle_model, vehicle.vehicle_color, vehicle.driver_id, bookingId]);
        
        const vendorResult = await query(
          'SELECT commission_rate FROM vendors WHERE id = $1',
          [vehicle.vendor_id]
        );
        
        if (vendorResult.rows.length > 0) {
          const commissionRate = vendorResult.rows[0].commission_rate || 0.8;
          const vendorAmount = fare.fare_after_discount * commissionRate;
          const companyProfit = fare.fare_after_discount - vendorAmount;
          
          const payoutResult = await query(`
            INSERT INTO vendor_payouts (vendor_id, booking_id, vendor_amount, company_profit)
            VALUES ($1, $2, $3, $4)
            RETURNING *
          `, [vehicle.vendor_id, bookingId, vendorAmount, companyProfit]);
          
          vendorPayout = payoutResult.rows[0];
        }
      }
      
      res.json({
        success: true,
        booking_id: bookingId,
        fare: fare.fare_after_discount,
        status: availableVehicle.rows.length > 0 ? 'assigned' : 'pending',
        vendor_payout: vendorPayout,
        idempotent: false
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = pushController;
