-- Update services to only include the 2 booking options
-- Run this in Supabase SQL Editor

-- 1. Deactivate all services except the 2 booking options
UPDATE services
SET is_active = false
WHERE service_key NOT IN ('queue-booking', 'haircut-wash-shc');

-- 2. Ensure the 2 booking services exist and are active
-- If they don't exist, they will be created with the service_key from migration 002

-- 3. Update service details for queue-booking (25K)
UPDATE services
SET 
  name = 'Booking Nomor Antrian Cukur',
  price = 25000,
  dp_amount = 0,
  duration_min = 30,
  is_active = true,
  service_key = 'queue-booking'
WHERE service_key = 'queue-booking' OR (service_key IS NULL AND lower(name) LIKE '%antrian%');

-- 4. Update service details for haircut-wash-shc (30K)
UPDATE services
SET 
  name = 'Booking cukur + keramas + SHC',
  price = 30000,
  dp_amount = 0,
  duration_min = 30,
  is_active = true,
  service_key = 'haircut-wash-shc'
WHERE service_key = 'haircut-wash-shc' OR (service_key IS NULL AND lower(name) LIKE '%keramas%' AND lower(name) LIKE '%shc%');

-- 5. Verify the services
SELECT id, service_key, name, price, is_active 
FROM services 
WHERE is_active = true 
ORDER BY service_key;
