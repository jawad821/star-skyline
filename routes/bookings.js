const express = require('express');
const router = express.Router();
const { query } = require('../db/db');

const RATES = {
  perKm: {
    sedan: 3.5,
    suv: 4.5,
    luxury: 6.5
  },
  pickupFee: 5,
  hourly: {
    sedan: { rate: 75, minHours: 2, includedKmPerHour: 20 },
    suv: { rate: 90, minHours: 2, includedKmPerHour: 20 },
    luxury: { rate: 150, minHours: 2, includedKmPerHour: 20 }
  }
};

function calculateFare(bookingType, vehicleType, distanceKm = 0, hours = 0) {
  let fareBeforeDiscount = 0;
  
  if (bookingType === 'point') {
    const ratePerKm = RATES.perKm[vehicleType] || RATES.perKm.sedan;
    fareBeforeDiscount = RATES.pickupFee + (distanceKm * ratePerKm);
  } else if (bookingType === 'hourly') {
    const hourlyConfig = RATES.hourly[vehicleType] || RATES.hourly.sedan;
    const billedHours = Math.max(hours, hourlyConfig.minHours);
    fareBeforeDiscount = billedHours * hourlyConfig.rate;
  }
  
  const fareAfterDiscount = fareBeforeDiscount;
  
  return {
    fare_before_discount: Math.round(fareBeforeDiscount * 100) / 100,
    fare_after_discount: Math.round(fareAfterDiscount * 100) / 100
  };
}

router.post('/calculate-fare', async (req, res) => {
  try {
    const { booking_type, vehicle_type, distance_km, hours } = req.body;
    
    if (!booking_type || !vehicle_type) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: booking_type and vehicle_type are required' 
      });
    }
    
    if (!['point', 'hourly'].includes(booking_type)) {
      return res.status(400).json({ 
        success: false, 
        error: 'booking_type must be either "point" or "hourly"' 
      });
    }
    
    if (!['sedan', 'suv', 'luxury'].includes(vehicle_type)) {
      return res.status(400).json({ 
        success: false, 
        error: 'vehicle_type must be sedan, suv, or luxury' 
      });
    }
    
    if (booking_type === 'point' && (!distance_km || distance_km <= 0)) {
      return res.status(400).json({ 
        success: false, 
        error: 'distance_km is required for point bookings' 
      });
    }
    
    if (booking_type === 'hourly' && (!hours || hours <= 0)) {
      return res.status(400).json({ 
        success: false, 
        error: 'hours is required for hourly bookings' 
      });
    }
    
    const fare = calculateFare(booking_type, vehicle_type, distance_km || 0, hours || 0);
    
    res.json({
      success: true,
      ...fare
    });
  } catch (error) {
    console.error('Calculate fare error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.get('/available-vehicles', async (req, res) => {
  try {
    const { type } = req.query;
    
    let sql = `
      SELECT 
        v.id, v.plate_number, v.model, v.type, v.status,
        d.id as driver_id, d.name as driver_name, d.phone as driver_phone,
        vn.name as vendor_name
      FROM vehicles v
      LEFT JOIN drivers d ON v.driver_id = d.id
      LEFT JOIN vendors vn ON v.vendor_id = vn.id
      WHERE v.status = 'available'
    `;
    
    const params = [];
    if (type) {
      sql += ' AND v.type = $1';
      params.push(type);
    }
    
    sql += ' ORDER BY v.type, v.model';
    
    const result = await query(sql, params);
    
    res.json({
      success: true,
      vehicles: result.rows
    });
  } catch (error) {
    console.error('Available vehicles error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.post('/create-booking', async (req, res) => {
  try {
    const { 
      customer_name, 
      customer_phone, 
      pickup_location, 
      dropoff_location,
      hours,
      booking_type,
      vehicle_type,
      distance_km
    } = req.body;
    
    if (!customer_name || !customer_phone) {
      return res.status(400).json({ 
        success: false, 
        error: 'customer_name and customer_phone are required' 
      });
    }
    
    const isPointBooking = pickup_location && dropoff_location;
    const isHourlyBooking = hours && booking_type === 'hourly';
    
    if (!isPointBooking && !isHourlyBooking) {
      return res.status(400).json({ 
        success: false, 
        error: 'Either pickup_location and dropoff_location, OR hours with booking_type="hourly" are required' 
      });
    }
    
    const vType = vehicle_type || 'sedan';
    if (!['sedan', 'suv', 'luxury'].includes(vType)) {
      return res.status(400).json({ 
        success: false, 
        error: 'vehicle_type must be sedan, suv, or luxury' 
      });
    }
    
    const bType = isHourlyBooking ? 'hourly' : 'point';
    const km = distance_km || 10;
    const hrs = hours || 0;
    
    const fare = calculateFare(bType, vType, km, hrs);
    
    const vehicleResult = await query(`
      SELECT 
        v.id, v.plate_number, v.model, v.type,
        d.name as driver_name, d.phone as driver_phone
      FROM vehicles v
      LEFT JOIN drivers d ON v.driver_id = d.id
      WHERE v.status = 'available' AND v.type = $1
      LIMIT 1
    `, [vType]);
    
    const availableVehicle = vehicleResult.rows[0] || null;
    
    const bookingResult = await query(`
      INSERT INTO bookings (
        customer_name, customer_phone, pickup_location, dropoff_location,
        distance_km, fare_aed, vehicle_type, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
      RETURNING id
    `, [
      customer_name,
      customer_phone,
      pickup_location || null,
      dropoff_location || null,
      km,
      fare.fare_after_discount,
      vType
    ]);
    
    res.json({
      success: true,
      booking_id: bookingResult.rows[0].id,
      fare_before_discount: fare.fare_before_discount,
      fare_after_discount: fare.fare_after_discount,
      available_vehicle_info: availableVehicle
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.post('/assign-vehicle', async (req, res) => {
  try {
    const { booking_id, vehicle_id } = req.body;
    
    if (!booking_id || !vehicle_id) {
      return res.status(400).json({ 
        success: false, 
        error: 'booking_id and vehicle_id are required' 
      });
    }
    
    const bookingCheck = await query(
      'SELECT id, status FROM bookings WHERE id = $1',
      [booking_id]
    );
    
    if (bookingCheck.rows.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Booking not found' 
      });
    }
    
    const vehicleCheck = await query(
      'SELECT id, status, vendor_id FROM vehicles WHERE id = $1',
      [vehicle_id]
    );
    
    if (vehicleCheck.rows.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Vehicle not found' 
      });
    }
    
    if (vehicleCheck.rows[0].status !== 'available') {
      return res.status(400).json({ 
        success: false, 
        error: 'Vehicle is not available' 
      });
    }
    
    await query(
      'UPDATE vehicles SET status = $1 WHERE id = $2',
      ['on_trip', vehicle_id]
    );
    
    const updatedBooking = await query(`
      UPDATE bookings 
      SET assigned_vehicle_id = $1, vendor_id = $2, status = 'assigned'
      WHERE id = $3
      RETURNING *
    `, [vehicle_id, vehicleCheck.rows[0].vendor_id, booking_id]);
    
    res.json({
      success: true,
      booking: updatedBooking.rows[0]
    });
  } catch (error) {
    console.error('Assign vehicle error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;
