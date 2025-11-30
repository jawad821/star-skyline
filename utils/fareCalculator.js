const { query } = require('../config/db');

const LEGACY_RATES = {
  perKm: {
    sedan: 3.5,
    suv: 4.5,
    luxury: 6.5,
    van: 5.0
  },
  hourly: {
    sedan: 75,
    suv: 90,
    luxury: 150,
    van: 120
  }
};

/**
 * Get fare rules from database for a vehicle type (with slab logic)
 * Returns: base_fare, per_km_rate, included_km
 */
async function getFareRuleForType(vehicleType) {
  try {
    const result = await query(
      'SELECT base_fare, per_km_rate, included_km FROM fare_rules WHERE vehicle_type = $1 AND active = true',
      [vehicleType.toLowerCase()]
    );
    
    if (result.rows && result.rows.length > 0) {
      return {
        base_fare: parseFloat(result.rows[0].base_fare),
        per_km_rate: parseFloat(result.rows[0].per_km_rate),
        included_km: parseInt(result.rows[0].included_km || 20, 10)
      };
    }
  } catch (error) {
    console.error('Error fetching fare rules:', error);
  }
  
  // Fallback to legacy rates with default included_km
  const legacyType = vehicleType.toLowerCase();
  return {
    base_fare: 0,
    per_km_rate: LEGACY_RATES.perKm[legacyType] || LEGACY_RATES.perKm.sedan,
    included_km: 20
  };
}

/**
 * DYNAMIC fare calculation using DB rules
 * @param {string} booking_type - point_to_point, airport_transfer, city_tour, hourly_rental
 * @param {string} vehicle_type - vehicle category from fare_rules table
 * @param {number} distance_km - required for distance-based bookings
 * @param {number} hours - required for time-based bookings
 * @returns {object} {distance_km, vehicle_type, booking_type, fare, currency}
 */
async function calculateFare(booking_type, vehicle_type, distance_km = 0, hours = 0) {
  // STRICT validation - no fallbacks
  if (!booking_type || !vehicle_type) {
    throw new Error('Missing required fields: booking_type and vehicle_type');
  }

  if (!distance_km && !hours) {
    throw new Error('Either distance_km or hours must be provided');
  }

  const validTypes = ['point_to_point', 'airport_transfer', 'city_tour', 'hourly_rental'];
  if (!validTypes.includes(booking_type)) {
    throw new Error(`Invalid booking_type. Must be one of: ${validTypes.join(', ')}`);
  }

  let fare = 0;

  if (booking_type === 'hourly_rental' || booking_type === 'city_tour') {
    // Time-based: use hourly rate from legacy
    if (!hours || hours <= 0) {
      throw new Error('hours is required and must be > 0 for hourly bookings');
    }
    const hourlyRate = LEGACY_RATES.hourly[vehicle_type.toLowerCase()] || LEGACY_RATES.hourly.sedan;
    fare = hours * hourlyRate;
  } else {
    // Distance-based: use dynamic fare rules from DB with slab logic
    if (!distance_km || distance_km <= 0) {
      throw new Error('distance_km is required and must be > 0 for distance-based bookings');
    }

    const fareRule = await getFareRuleForType(vehicle_type);
    const baseFare = fareRule.base_fare || 0;
    const perKmRate = fareRule.per_km_rate || 0;
    const includedKm = fareRule.included_km || 20;

    // CLIENT-APPROVED SLAB LOGIC:
    // If distance <= included_km: fare = base_fare
    // Else: fare = base_fare + (distance × per_km_rate)
    let calculatedFare;
    if (distance_km <= includedKm) {
      calculatedFare = baseFare;
    } else {
      calculatedFare = baseFare + (distance_km * perKmRate);
    }

    // Apply surcharges
    if (booking_type === 'airport_transfer') {
      calculatedFare = calculatedFare * 1.10; // +10% surcharge
    }

    fare = calculatedFare;
  }

  // Round to 2 decimals
  fare = Math.round(fare * 100) / 100;

  return {
    distance_km: distance_km || 0,
    hours: hours || 0,
    vehicle_type,
    booking_type,
    fare,
    currency: 'AED'
  };
}

module.exports = {
  LEGACY_RATES,
  calculateFare,
  getFareRuleForType
};
