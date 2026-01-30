// Script to update vehicles with color and plate numbers
require('dotenv').config();
const { query } = require('../config/db');

// Sample data - you can customize these
const sampleColors = ['Black', 'White', 'Silver', 'Grey', 'Blue', 'Red'];
const platePrefix = ['ABC', 'XYZ', 'DEF', 'GHI', 'JKL'];

function generatePlateNumber() {
    const prefix = platePrefix[Math.floor(Math.random() * platePrefix.length)];
    const number = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${number}`;
}

async function updateVehicles() {
    try {
        console.log('🔧 Starting vehicle update process...\n');

        // Get all vehicles
        const result = await query('SELECT id, model, color, plate_number FROM vehicles');

        if (result.rows.length === 0) {
            console.log('❌ No vehicles found');
            process.exit(0);
        }

        console.log(`Found ${result.rows.length} vehicles to update\n`);

        let updated = 0;

        for (const vehicle of result.rows) {
            const updates = [];
            const values = [];
            let paramCount = 1;

            // Update color if missing
            if (!vehicle.color) {
                const randomColor = sampleColors[Math.floor(Math.random() * sampleColors.length)];
                updates.push(`color = $${paramCount}`);
                values.push(randomColor);
                paramCount++;
                console.log(`   Setting color to: ${randomColor}`);
            }

            // Update plate_number if missing
            if (!vehicle.plate_number) {
                const plateNumber = generatePlateNumber();
                updates.push(`plate_number = $${paramCount}`);
                values.push(plateNumber);
                paramCount++;
                console.log(`   Setting plate number to: ${plateNumber}`);
            }

            // Only update if there are changes
            if (updates.length > 0) {
                values.push(vehicle.id);
                const updateQuery = `
          UPDATE vehicles 
          SET ${updates.join(', ')}
          WHERE id = $${paramCount}
        `;

                await query(updateQuery, values);
                console.log(`✅ Updated vehicle: ${vehicle.model || vehicle.id}\n`);
                updated++;
            }
        }

        console.log(`\n✅ Update complete! Updated ${updated} vehicles`);

        // Show final state
        const finalResult = await query('SELECT model, color, plate_number FROM vehicles');
        console.log('\n📋 Current vehicle data:');
        console.log('═══════════════════════════════════════════════════');
        finalResult.rows.forEach((v, i) => {
            console.log(`${i + 1}. ${v.model} - ${v.color} (${v.plate_number})`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

updateVehicles();
