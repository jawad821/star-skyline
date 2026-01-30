-- Manual SQL script to update specific vehicles
-- Replace the vehicle IDs and values with your actual data

-- Example: Update a specific vehicle
-- UPDATE vehicles 
-- SET color = 'Black', plate_number = 'ABC-1234' 
-- WHERE id = 'your-vehicle-id-here';

-- Example: Update multiple vehicles at once
-- UPDATE vehicles SET color = 'Black', plate_number = 'ABC-1001' WHERE model = 'Mercedes S-Class';
-- UPDATE vehicles SET color = 'White', plate_number = 'ABC-1002' WHERE model = 'BMW 7 Series';
-- UPDATE vehicles SET color = 'Silver', plate_number = 'ABC-1003' WHERE model = 'Audi A8';

-- Check current vehicles (run this first to see what needs updating)
SELECT id, model, type, color, plate_number, status 
FROM vehicles 
ORDER BY created_at DESC;

-- Update all vehicles with random sample data (use with caution!)
-- UPDATE vehicles SET 
--   color = CASE 
--     WHEN color IS NULL THEN 'Black'
--     ELSE color 
--   END,
--   plate_number = CASE 
--     WHEN plate_number IS NULL THEN 'ABC-' || LPAD(FLOOR(RANDOM() * 9999)::TEXT, 4, '0')
--     ELSE plate_number 
--   END;

-- Verify the updates
-- SELECT model, color, plate_number FROM vehicles;
