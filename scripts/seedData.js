const { query } = require('../config/db');

const seedData = async () => {
  try {
    console.log('🌱 Starting database seed...');

    // Clear existing data (respect foreign keys)
    await query('DELETE FROM vendor_payouts');
    await query('DELETE FROM bookings');
    await query('DELETE FROM vehicles');
    await query('DELETE FROM drivers');
    await query('DELETE FROM customers');
    await query('DELETE FROM vendors');

    // Create vendors
    const vendors = [
      { name: 'Gold Rush Limo', phone: '+971501111111', email: 'gold@rush.ae', commission_rate: 0.8 },
      { name: 'Elite Rides', phone: '+971502222222', email: 'elite@rides.ae', commission_rate: 0.75 }
    ];
    
    let vendorIds = [];
    for (const v of vendors) {
      const result = await query(
        'INSERT INTO vendors (name, phone, email, commission_rate) VALUES ($1, $2, $3, $4) RETURNING id',
        [v.name, v.phone, v.email, v.commission_rate]
      );
      vendorIds.push(result.rows[0].id);
      console.log(`✅ Created vendor: ${v.name}`);
    }

    // Create 16 drivers (doubled from 8)
    const drivers = [
      { vendor_id: vendorIds[0], name: 'Ahmed Hassan', phone: '+971503333333', status: 'online' },
      { vendor_id: vendorIds[0], name: 'Mohammed Ali', phone: '+971504444444', status: 'online' },
      { vendor_id: vendorIds[0], name: 'Fatima Khan', phone: '+971505555555', status: 'offline' },
      { vendor_id: vendorIds[0], name: 'Ali Hussain', phone: '+971506666666', status: 'online' },
      { vendor_id: vendorIds[0], name: 'Hassan Mahmoud', phone: '+971507777777', status: 'offline' },
      { vendor_id: vendorIds[0], name: 'Rashid Al Mansoori', phone: '+971508888888', status: 'online' },
      { vendor_id: vendorIds[0], name: 'Ibrahim Khan', phone: '+971509999999', status: 'offline' },
      { vendor_id: vendorIds[0], name: 'Marwan Ali', phone: '+971500000000', status: 'online' },
      { vendor_id: vendorIds[1], name: 'Sara Ahmed', phone: '+971501111112', status: 'online' },
      { vendor_id: vendorIds[1], name: 'Khalid Mansour', phone: '+971502222223', status: 'online' },
      { vendor_id: vendorIds[1], name: 'Noor Ibrahim', phone: '+971503333334', status: 'offline' },
      { vendor_id: vendorIds[1], name: 'Hassan Ibrahim', phone: '+971504444445', status: 'online' },
      { vendor_id: vendorIds[1], name: 'Omar Al Mazrouei', phone: '+971505555556', status: 'offline' },
      { vendor_id: vendorIds[1], name: 'Aisha Abdullah', phone: '+971506666667', status: 'online' },
      { vendor_id: vendorIds[1], name: 'Zainab Mohamed', phone: '+971507777778', status: 'online' },
      { vendor_id: vendorIds[1], name: 'Karim Hassan', phone: '+971508888889', status: 'offline' }
    ];

    let driverIds = [];
    for (const d of drivers) {
      const result = await query(
        'INSERT INTO drivers (vendor_id, name, phone, status, updated_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id',
        [d.vendor_id, d.name, d.phone, d.status]
      );
      driverIds.push(result.rows[0].id);
      console.log(`✅ Created driver: ${d.name} (${d.status})`);
    }

    // Create vehicles (using correct column names: plate_number, type)
    const vehicles = [
      { vendor_id: vendorIds[0], driver_id: driverIds[0], plate_number: 'DXB-1001', model: 'Toyota Corolla', type: 'sedan' },
      { vendor_id: vendorIds[0], driver_id: driverIds[1], plate_number: 'DXB-1002', model: 'Toyota Camry', type: 'sedan' },
      { vendor_id: vendorIds[0], driver_id: driverIds[2], plate_number: 'DXB-2001', model: 'Ford Explorer', type: 'suv' },
      { vendor_id: vendorIds[0], driver_id: driverIds[3], plate_number: 'DXB-2002', model: 'GMC Yukon', type: 'suv' },
      { vendor_id: vendorIds[1], driver_id: driverIds[4], plate_number: 'ABU-1001', model: 'BMW 5 Series', type: 'luxury' },
      { vendor_id: vendorIds[1], driver_id: driverIds[5], plate_number: 'ABU-1002', model: 'Mercedes E-Class', type: 'luxury' },
      { vendor_id: vendorIds[1], driver_id: driverIds[6], plate_number: 'ABU-2001', model: 'Range Rover', type: 'suv' },
      { vendor_id: vendorIds[1], driver_id: driverIds[7], plate_number: 'ABU-3001', model: 'Honda Civic', type: 'sedan' }
    ];

    let vehicleIds = [];
    for (const v of vehicles) {
      const result = await query(
        'INSERT INTO vehicles (vendor_id, driver_id, plate_number, model, type, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        [v.vendor_id, v.driver_id, v.plate_number, v.model, v.type, 'available']
      );
      vehicleIds.push(result.rows[0].id);
      console.log(`✅ Created vehicle: ${v.model}`);
    }

    // Create customers
    const customers = [
      { name: 'John Smith', phone: '+971506001111', email: 'john@example.com' },
      { name: 'Fatima Al Mansoori', phone: '+971506001112', email: 'fatima@example.com' },
      { name: 'Ahmed Al Mazrouei', phone: '+971506001113', email: 'ahmed@example.com' },
      { name: 'Sarah Johnson', phone: '+971506001114', email: 'sarah@example.com' },
      { name: 'Mohammed Ibrahim', phone: '+971506001115', email: 'mibrahim@example.com' },
      { name: 'Layla Khan', phone: '+971506001116', email: 'layla@example.com' },
      { name: 'Omar Rashid', phone: '+971506001117', email: 'omar@example.com' },
      { name: 'Aisha Abdullah', phone: '+971506001118', email: 'aisha@example.com' },
      { name: 'David Wilson', phone: '+971506001119', email: 'david@example.com' },
      { name: 'Noor Ahmed', phone: '+971506001120', email: 'noor@example.com' },
      { name: 'Hassan Al Ansari', phone: '+971506001121', email: 'hassan@example.com' },
      { name: 'Mariam Al Ketbi', phone: '+971506001122', email: 'mariam@example.com' }
    ];

    let customerIds = [];
    for (const c of customers) {
      const result = await query(
        'INSERT INTO customers (name, phone, email, preferred_vehicle, whatsapp) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [c.name, c.phone, c.email, 'sedan', c.phone]
      );
      customerIds.push(result.rows[0].id);
      console.log(`✅ Created customer: ${c.name}`);
    }

    // Create bookings with assigned vehicle_type from vehicles
    const statuses = ['completed', 'completed', 'completed', 'pending', 'cancelled'];
    const locations = {
      pickups: ['Dubai Airport', 'Dubai Marina', 'Downtown Dubai', 'Mall of Emirates', 'Burj Khalifa'],
      dropoffs: ['Atlantis The Palm', 'Jumeirah Beach', 'Dubai Mall', 'Emirates Towers', 'Deira City Center']
    };

    for (let i = 0; i < 15; i++) {
      const status = statuses[i % statuses.length];
      const driverId = driverIds[i % driverIds.length];
      const vehicleIdx = i % vehicleIds.length;
      const vehicleId = vehicleIds[vehicleIdx];
      const vendorId = vendorIds[i % vendorIds.length];
      const customerData = customers[i % customers.length];
      const pickup = locations.pickups[i % locations.pickups.length];
      const dropoff = locations.dropoffs[i % locations.dropoffs.length];
      const distance = 15 + (i % 30);
      
      // Get vehicle type from the vehicles array
      const vehicleType = vehicles[vehicleIdx].type;
      
      const rates = { sedan: 3.5, suv: 4.5, luxury: 6.5 };
      const fare = 5 + (distance * rates[vehicleType]);

      await query(`
        INSERT INTO bookings (
          customer_name, customer_phone, driver_id,
          pickup_location, dropoff_location, distance_km, fare_aed, vehicle_type,
          assigned_vehicle_id, vendor_id, status, payment_method, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 
                  NOW() - INTERVAL '${i} days', NOW() - INTERVAL '${i} days')
      `, [
        customerData.name,
        customerData.phone,
        driverId,
        pickup,
        dropoff,
        distance,
        Math.round(fare * 100) / 100,
        vehicleType,
        vehicleId,
        vendorId,
        status,
        ['cash', 'card'][i % 2]
      ]);
      console.log(`✅ Created booking - ${vehicleType} - ${status}`);
    }

    console.log('\n✨ Seed data completed successfully!');
    console.log(`
📊 Created:
  - 2 vendors
  - 16 drivers (8 online, 8 offline)
  - 8 vehicles
  - 12 customers
  - 15 bookings (with vehicle types assigned)
    `);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
};

seedData();
