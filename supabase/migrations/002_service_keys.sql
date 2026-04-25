-- Backfill and stabilize service identifiers for booking mappings.

ALTER TABLE services
ADD COLUMN IF NOT EXISTS service_key TEXT;

CREATE INDEX IF NOT EXISTS idx_services_service_key ON services(service_key);

UPDATE services
SET service_key = CASE
  WHEN service_key IS NOT NULL AND service_key <> '' THEN service_key
  WHEN lower(name) LIKE '%dewasa%' AND lower(name) LIKE '%anak%' THEN 'haircut-basic'
  WHEN lower(name) LIKE '%antrian%' OR lower(name) LIKE '%booking nomor%' THEN 'queue-booking'
  WHEN lower(name) LIKE '%keramas%' AND lower(name) LIKE '%shc%' THEN 'haircut-wash-shc'
  WHEN lower(name) LIKE '%keramas%' OR lower(name) LIKE '%cuci%' OR lower(name) LIKE '%simple hair care%' THEN 'haircut-wash-simple'
  WHEN lower(name) LIKE '%hitam%' THEN 'colour-black'
  WHEN lower(name) LIKE '%highlight + warna%' OR (lower(name) LIKE '%highlight%' AND lower(name) LIKE '%warna%') THEN 'colour-highlight-warna'
  WHEN lower(name) LIKE '%highlight%' THEN 'colour-highlight'
  WHEN lower(name) LIKE '%fashion%' THEN 'colour-fashion'
  WHEN lower(name) LIKE '%curly%' OR lower(name) LIKE '%perm%' THEN 'chemical-curly'
  ELSE lower(regexp_replace(name, '[^a-z0-9]+', '-', 'g'))
END
WHERE service_key IS NULL OR service_key = '';
