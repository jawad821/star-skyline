const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const { calculateFare } = require('../utils/fareCalculator');

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 400;
  }
}

const bookingService = {
  validateFareInput(data) {
    const { booking_type, vehicle_type, distance_km, hours } = data;
    
    if (!booking_type || !vehicle_type) {
      throw new ValidationError('Missing required fields: booking_type and vehicle_type are required');
    }
    
    if (!['point', 'hourly'].includes(booking_type)) {
      throw new ValidationError('booking_type must be either "point" or "hourly"');
    }
    
    if (!['sedan', 'suv', 'luxury'].includes(vehicle_type)) {
      throw new ValidationError('vehicle_type must be sedan, suv, or luxury');
    }
    
    if (booking_type === 'point' && (!distance_km || distance_km <= 0)) {
      throw new ValidationError('distance_km is required for point bookings');
    }
    
    if (booking_type === 'hourly' && (!hours || hours <= 0)) {
      throw new ValidationError('hours is required for hourly bookings');
    }
  },

  calculateFare(data) {
    this.validateFareInput(data);
    const { booking_type, vehicle_type, distance_km, hours } = data;
    return calculateFare(booking_type, vehicle_type, distance_km || 0, hours || 0);
  },

  validateBookingInput(data) {
    const { customer_name, customer_phone, pickup_location, dropoff_location, hours, booking_type, vehicle_type } = data;
    
    if (!customer_name || !customer_phone) {
      throw new ValidationError('customer_name and customer_phone are required');
    }
    
    const isPointBooking = pickup_location && dropoff_location;
    const isHourlyBooking = hours && booking_type === 'hourly';
    
    if (!isPointBooking && !isHourlyBooking) {
      throw new ValidationError('Either pickup_location and dropoff_location, OR hours with booking_type="hourly" are required');
    }
    
    const vType = vehicle_type || 'sedan';
    if (!['sedan', 'suv', 'luxury'].includes(vType)) {
      throw new ValidationError('vehicle_type must be sedan, suv, or luxury');
    }
    
    return { isPointBooking, isHourlyBooking, vehicleType: vType };
  },

  async createBooking(data) {
    const { isHourlyBooking, vehicleType } = this.validateBookingInput(data);
    
    const bookingType = isHourlyBooking ? 'hourly' : 'point';
    const distanceKm = data.distance_km || 10;
    const hours = data.hours || 0;
    
    const fare = calculateFare(bookingType, vehicleType, distanceKm, hours);
    const availableVehicle = await Vehicle.findFirstAvailableByType(vehicleType);
    
    const booking = await Booking.create({
      customer_name: data.customer_name,
      customer_phone: data.customer_phone,
      pickup_location: data.pickup_location,
      dropoff_location: data.dropoff_location,
      distance_km: distanceKm,
      fare_aed: fare.fare_after_discount,
      vehicle_type: vehicleType
    });
    
    return {
      booking_id: booking.id,
      fare_before_discount: fare.fare_before_discount,
      fare_after_discount: fare.fare_after_discount,
      available_vehicle_info: availableVehicle
    };
  },

  async assignVehicle(bookingId, vehicleId) {
    if (!bookingId || !vehicleId) {
      throw new ValidationError('booking_id and vehicle_id are required');
    }
    
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new ValidationError('Booking not found');
    }
    
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      throw new ValidationError('Vehicle not found');
    }
    
    if (vehicle.status !== 'available') {
      throw new ValidationError('Vehicle is not available');
    }
    
    await Vehicle.updateStatus(vehicleId, 'on_trip');
    const updatedBooking = await Booking.updateAssignment(bookingId, vehicleId, vehicle.vendor_id);
    
    return updatedBooking;
  }
};

module.exports = bookingService;
