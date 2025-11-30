const bookingService = require('./bookingService');
const logger = require('../utils/logger');

const MAX_RETRIES = 3;
const RETRY_DELAY = 500; // ms

class BareerahBookingError extends Error {
  constructor(message, code = 'BOOKING_ERROR') {
    super(message);
    this.code = code;
    this.timestamp = new Date().toISOString();
  }
}

const bareerahBookingService = {
  /**
   * Create booking with retry logic for Bareerah
   */
  async createBookingWithRetry(data, retryCount = 0) {
    try {
      console.log(`\n🎯 [BAREERAH-BOOKING] Attempt ${retryCount + 1}/${MAX_RETRIES}`);
      console.log('   📋 Data:', {
        customer: data.customer_name,
        phone: data.customer_phone,
        passengers: data.passengers_count,
        luggage: data.luggage_count,
        booking_type: data.booking_type,
        vehicle_type: data.vehicle_type
      });

      // Ensure booking_source is set to bareerah_ai
      const bookingData = { ...data, booking_source: 'bareerah_ai' };
      
      const result = await bookingService.createBooking(bookingData);
      
      console.log('✅ [BAREERAH-BOOKING] SUCCESS!');
      console.log('   🆔 Booking ID:', result.booking_id);
      console.log('   💰 Fare: AED', result.fare);
      console.log('   🚗 Vehicle:', result.assigned_vehicle?.model);
      
      return {
        success: true,
        booking_id: result.booking_id,
        booking_type: result.booking_type,
        fare: result.fare,
        currency: 'AED',
        vehicle: result.assigned_vehicle,
        retry_attempts: retryCount,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.log(`❌ [BAREERAH-BOOKING] Attempt ${retryCount + 1} failed:`, error.message);
      
      // If retries available, retry
      if (retryCount < MAX_RETRIES - 1) {
        const delay = RETRY_DELAY * Math.pow(2, retryCount); // exponential backoff
        console.log(`   ⏳ Retrying in ${delay}ms...`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.createBookingWithRetry(data, retryCount + 1);
      }
      
      // All retries exhausted
      console.log(`❌ [BAREERAH-BOOKING] All ${MAX_RETRIES} attempts failed!`);
      console.log('   Error:', error.message);
      console.log('   Code:', error.code || error.statusCode);
      
      throw new BareerahBookingError(error.message, error.code);
    }
  },

  /**
   * Validate Bareerah booking payload
   */
  validateBareerahPayload(data) {
    console.log('🔍 [BAREERAH-BOOKING] Validating payload...');
    
    const required = ['customer_name', 'customer_phone', 'booking_type', 'vehicle_type', 'passengers_count'];
    const missing = required.filter(f => !data[f]);
    
    if (missing.length > 0) {
      console.log('   ❌ Missing fields:', missing);
      throw new BareerahBookingError(`Missing required fields: ${missing.join(', ')}`, 'INVALID_PAYLOAD');
    }
    
    // Validate booking type
    const validBookingTypes = ['point_to_point', 'airport_transfer', 'city_tour', 'hourly_rental'];
    if (!validBookingTypes.includes(data.booking_type)) {
      console.log('   ❌ Invalid booking_type:', data.booking_type);
      throw new BareerahBookingError(`Invalid booking_type. Must be one of: ${validBookingTypes.join(', ')}`, 'INVALID_BOOKING_TYPE');
    }
    
    // Validate vehicle type
    const validVehicleTypes = ['sedan', 'suv', 'luxury', 'van', 'bus', 'minibus'];
    if (!validVehicleTypes.includes(data.vehicle_type)) {
      console.log('   ❌ Invalid vehicle_type:', data.vehicle_type);
      throw new BareerahBookingError(`Invalid vehicle_type. Must be one of: ${validVehicleTypes.join(', ')}`, 'INVALID_VEHICLE_TYPE');
    }
    
    console.log('   ✅ All required fields present and valid');
    return true;
  }
};

module.exports = bareerahBookingService;
