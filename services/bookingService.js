const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const { calculateFare } = require('../utils/fareCalculator');
const {
  sendWhatsAppToCustomer,
  sendWhatsAppToDriver,
  sendWhatsAppToAdmin,
  sendEmailToCustomer,
  sendEmailToDriver,
  sendEmailToAdmin
} = require('./notificationService');

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 400;
  }
}

const bookingService = {
  /**
   * STRICT validation for fare calculation
   * Must have: booking_type, vehicle_type, distance_km OR hours
   */
  validateFareInput(data) {
    const { booking_type, vehicle_type, distance_km, hours } = data;
    
    // Strict - no fallbacks
    if (!booking_type) {
      throw new ValidationError('booking_type is required');
    }
    if (!vehicle_type) {
      throw new ValidationError('vehicle_type is required');
    }

    const validBookingTypes = ['point_to_point', 'airport_transfer', 'city_tour', 'hourly_rental'];
    if (!validBookingTypes.includes(booking_type)) {
      throw new ValidationError(`booking_type must be one of: ${validBookingTypes.join(', ')}`);
    }

    const validVehicleTypes = ['sedan', 'suv', 'luxury', 'van'];
    if (!validVehicleTypes.includes(vehicle_type)) {
      throw new ValidationError(`vehicle_type must be one of: ${validVehicleTypes.join(', ')}`);
    }

    // For distance-based bookings
    if (booking_type === 'point_to_point' || booking_type === 'airport_transfer') {
      if (!distance_km || distance_km <= 0) {
        throw new ValidationError('distance_km is required and must be > 0 for distance-based bookings');
      }
    }

    // For time-based bookings
    if (booking_type === 'hourly_rental' || booking_type === 'city_tour') {
      if (!hours || hours <= 0) {
        throw new ValidationError('hours is required and must be > 0 for hourly bookings');
      }
    }
  },

  /**
   * Calculate fare with strict validation and surcharges
   */
  async calculateFare(data) {
    this.validateFareInput(data);
    const { booking_type, vehicle_type, distance_km, hours } = data;
    
    try {
      const result = await calculateFare(booking_type, vehicle_type, distance_km || 0, hours || 0);
      return result;
    } catch (error) {
      throw new ValidationError(error.message);
    }
  },

  /**
   * Validate booking input with strict fields
   */
  validateBookingInput(data) {
    const { 
      customer_name, 
      customer_phone,
      customer_email,
      booking_type,
      vehicle_type,
      distance_km,
      hours,
      passengers_count,
      luggage_count,
      pickup_location,
      dropoff_location
    } = data;
    
    if (!customer_name || !customer_phone) {
      throw new ValidationError('customer_name and customer_phone are required');
    }

    if (!booking_type) {
      throw new ValidationError('booking_type is required');
    }

    const validBookingTypes = ['point_to_point', 'airport_transfer', 'city_tour', 'hourly_rental'];
    if (!validBookingTypes.includes(booking_type)) {
      throw new ValidationError(`booking_type must be one of: ${validBookingTypes.join(', ')}`);
    }

    if (!vehicle_type) {
      throw new ValidationError('vehicle_type is required');
    }

    // Validate based on booking type
    if (booking_type === 'point_to_point' || booking_type === 'airport_transfer') {
      if (!pickup_location || !dropoff_location) {
        throw new ValidationError('pickup_location and dropoff_location are required for distance-based bookings');
      }
      if (!distance_km || distance_km <= 0) {
        throw new ValidationError('distance_km is required and must be > 0');
      }
    }

    if (booking_type === 'hourly_rental' || booking_type === 'city_tour') {
      if (!hours || hours <= 0) {
        throw new ValidationError('hours is required and must be > 0');
      }
    }

    // Validate email if provided
    if (customer_email && !this.isValidEmail(customer_email)) {
      throw new ValidationError('Invalid email format');
    }

    return {
      customers_count: passengers_count || 1,
      luggage_count: luggage_count || 0
    };
  },

  /**
   * Simple email validation
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Create booking with strict validation and smart vehicle selection
   */
  async createBooking(data) {
    const validation = this.validateBookingInput(data);
    const passengers = validation.customers_count;
    const luggage = validation.luggage_count;

    try {
      // Calculate fare
      const fareData = this.calculateFare({
        booking_type: data.booking_type,
        vehicle_type: data.vehicle_type,
        distance_km: data.distance_km || 0,
        hours: data.hours || 0
      });

      // Find cheapest vehicle matching capacity requirements
      let availableVehicle = await Vehicle.findCheapestEligible(passengers, luggage);
      
      // If no vehicle matches capacity, throw error
      if (!availableVehicle) {
        throw new ValidationError(`No available vehicles matching capacity: ${passengers} passengers, ${luggage} luggage`);
      }

      // Create booking with booking_type saved
      const booking = await Booking.create({
        customer_name: data.customer_name,
        customer_phone: data.customer_phone,
        customer_email: data.customer_email || null,
        pickup_location: data.pickup_location || null,
        dropoff_location: data.dropoff_location || null,
        distance_km: data.distance_km || 0,
        fare_aed: fareData.fare,
        vehicle_type: availableVehicle.type,
        booking_type: data.booking_type,
        passengers_count: passengers,
        luggage_count: luggage,
        caller_number: data.caller_number || null,
        confirmed_contact_number: data.confirmed_contact_number || null
      });

      // Trigger notifications (non-blocking)
      try {
        const bookingData = {
          id: booking.id,
          customer_name: data.customer_name,
          customer_phone: data.customer_phone,
          pickup_location: data.pickup_location,
          dropoff_location: data.dropoff_location,
          distance_km: data.distance_km || 0,
          fare_aed: fareData.fare,
          vehicle_type: availableVehicle.type,
          vehicle_model: availableVehicle.model,
          booking_type: data.booking_type,
          status: booking.status,
          driver_name: availableVehicle.driver_name || 'TBD',
          driver_phone: availableVehicle.driver_phone || 'TBD',
          vehicle_plate: availableVehicle.plate_number || 'TBD'
        };

        await sendWhatsAppToCustomer(data.customer_phone, bookingData);
        if (data.customer_email) {
          await sendEmailToCustomer(data.customer_email, bookingData);
        }
        
        if (availableVehicle?.driver_phone) {
          await sendWhatsAppToDriver(availableVehicle.driver_phone, bookingData);
          if (availableVehicle?.driver_email) {
            await sendEmailToDriver(availableVehicle.driver_email, bookingData);
          }
        }

        await sendWhatsAppToAdmin(bookingData);
        await sendEmailToAdmin('admin@bareerah.ae', bookingData);
      } catch (notifError) {
        console.error('Notification error (non-blocking):', notifError.message);
      }
      
      return {
        success: true,
        booking_id: booking.id,
        booking_type: booking.booking_type,
        distance_km: booking.distance_km,
        fare: fareData.fare,
        currency: 'AED',
        assigned_vehicle: {
          id: availableVehicle.id,
          model: availableVehicle.model,
          type: availableVehicle.type,
          plate_number: availableVehicle.plate_number,
          driver_name: availableVehicle.driver_name,
          per_km_price: availableVehicle.per_km_price,
          hourly_price: availableVehicle.hourly_price
        }
      };
    } catch (error) {
      if (error.statusCode === 400) {
        throw error;
      }
      throw new ValidationError(error.message);
    }
  },

  /**
   * Assign vehicle with capacity validation
   */
  async assignVehicle(bookingId, vehicleId, passengers = 1, luggage = 0) {
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

    // Validate vehicle capacity
    if (passengers > vehicle.max_passengers || luggage > vehicle.max_luggage) {
      throw new ValidationError(
        `Vehicle capacity exceeded. Required: ${passengers} passengers, ${luggage} luggage. ` +
        `Available: ${vehicle.max_passengers} passengers, ${vehicle.max_luggage} luggage`
      );
    }
    
    if (vehicle.status !== 'available') {
      throw new ValidationError('Vehicle is not available');
    }

    if (!vehicle.active) {
      throw new ValidationError('Vehicle is not active');
    }
    
    await Vehicle.updateStatus(vehicleId, 'on_trip');
    const updatedBooking = await Booking.updateAssignment(bookingId, vehicleId, vehicle.vendor_id);
    
    return updatedBooking;
  }
};

module.exports = bookingService;
