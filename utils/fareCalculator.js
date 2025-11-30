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
  
  const legacyType = vehicleType.toLowerCase();
  return {
    base_fare: 0,
    per_km_rate: LEGACY_RATES.perKm[legacyType] || LEGACY_RATES.perKm.sedan,
    included_km: 20
  };
}

async function calculateFare(booking_type, vehicle_type, distance_km, hours) {
  const fareRule = await getFareRuleForType(vehicle_type);
  
  let fare = fareRule.base_fare;

  if (booking_type === 'point_to_point' || booking_type === 'airport_transfer') {
    const distance = distance_km || 0;
    if (distance > fareRule.included_km) {
      fare += (distance - fareRule.included_km) * fareRule.per_km_rate;
    }
  } else if (booking_type === 'hourly_rental' || booking_type === 'city_tour') {
    const hourlyRate = LEGACY_RATES.hourly[vehicle_type.toLowerCase()] || 75;
    fare = (hours || 1) * hourlyRate;
  }

  return {
    distance_km: distance_km || 0,
    vehicle_type,
    booking_type,
    fare: Math.round(fare * 100) / 100,
    currency: 'AED',
    hours: hours || 0
  };
}

module.exports = {
  LEGACY_RATES,
  calculateFare,
  getFareRuleForType
};
