// Script to check current vehicle data
require('dotenv').config();
const { query } = require('../config/db');

async function checkVehicles() {
    try {
        console.log('🔍 Checking current vehicle data...\n');

        const result = await query(`
      SELECT 
        id, 
        model, 
        type, 
        plate_number, 
        color, 
        status,
        vendor_id
      FROM vehicles 
      ORDER BY created_at DESC
    `);

        if (result.rows.length === 0) {
            console.log('❌ No vehicles found in database');
            return;
        }

        console.log(`✅ Found ${result.rows.length} vehicles:\n`);
        console.log('═══════════════════════════════════════════════════════════════');

        result.rows.forEach((vehicle, index) => {
            console.log(`\n${index + 1}. Vehicle ID: ${vehicle.id}`);
            console.log(`   Model: ${vehicle.model || 'NOT SET'}`);
            console.log(`   Type: ${vehicle.type || 'NOT SET'}`);
            console.log(`   Color: ${vehicle.color || '⚠️  NOT SET'}`);
            console.log(`   Plate Number: ${vehicle.plate_number || '⚠️  NOT SET'}`);
            console.log(`   Status: ${vehicle.status}`);
            console.log(`   Vendor ID: ${vehicle.vendor_id || 'None'}`);
        });

        console.log('\n═══════════════════════════════════════════════════════════════');

        // Count vehicles missing data
        const missingColor = result.rows.filter(v => !v.color).length;
        const missingPlate = result.rows.filter(v => !v.plate_number).length;

        console.log(`\n📊 Summary:`);
        console.log(`   Total Vehicles: ${result.rows.length}`);
        console.log(`   Missing Color: ${missingColor}`);
        console.log(`   Missing Plate Number: ${missingPlate}`);

        if (missingColor > 0 || missingPlate > 0) {
            console.log('\n⚠️  Run update_vehicles.js to add missing data');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkVehicles();
