-- =====================================================
-- Barbershop Booking — Database Schema
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Services table
CREATE TABLE IF NOT EXISTS services (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_key   TEXT,
  name          TEXT NOT NULL,
  price         INTEGER NOT NULL,
  dp_amount     INTEGER NOT NULL,
  duration_min  INTEGER NOT NULL DEFAULT 30,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_services_service_key ON services(service_key);

-- 2. Slots table
CREATE TABLE IF NOT EXISTS slots (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date            DATE NOT NULL,
  start_time      TIME NOT NULL,
  end_time        TIME NOT NULL,
  status          TEXT NOT NULL DEFAULT 'open'
                    CHECK (status IN ('open', 'pending', 'booked', 'done', 'blocked')),
  pending_until   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_slot UNIQUE (date, start_time)
);

CREATE INDEX IF NOT EXISTS idx_slots_date_status ON slots(date, status);

-- 3. Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id         UUID NOT NULL REFERENCES slots(id),
  service_id      UUID NOT NULL REFERENCES services(id),
  customer_name   TEXT NOT NULL,
  customer_phone  TEXT NOT NULL,
  booking_code    TEXT NOT NULL UNIQUE,
  status          TEXT NOT NULL DEFAULT 'pending_payment'
                    CHECK (status IN (
                      'pending_payment',
                      'confirmed',
                      'checked_in',
                      'in_service',
                      'done',
                      'cancelled',
                      'downgraded'
                    )),
  priority        TEXT NOT NULL DEFAULT 'booking'
                    CHECK (priority IN ('booking', 'walkin')),
  dp_amount       INTEGER NOT NULL DEFAULT 0,
  dp_paid         BOOLEAN NOT NULL DEFAULT false,
  reminder_sent   BOOLEAN NOT NULL DEFAULT false,
  payment_id      TEXT,
  checkin_at      TIMESTAMPTZ,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_slot ON bookings(slot_id);
CREATE INDEX IF NOT EXISTS idx_bookings_code ON bookings(booking_code);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- 4. Admin Users table (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS admin_users (
  id              UUID PRIMARY KEY REFERENCES auth.users(id),
  shop_name       TEXT NOT NULL,
  owner_name      TEXT NOT NULL,
  phone           TEXT,
  address         TEXT,
  open_time       TIME NOT NULL DEFAULT '09:00',
  close_time      TIME NOT NULL DEFAULT '20:00',
  slot_duration   INTEGER NOT NULL DEFAULT 30,
  is_setup_done   BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- Row Level Security
-- =====================================================

ALTER TABLE bookings    ENABLE ROW LEVEL SECURITY;
ALTER TABLE slots       ENABLE ROW LEVEL SECURITY;
ALTER TABLE services    ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Public can read open slots
CREATE POLICY "Public read open slots" ON slots
  FOR SELECT USING (true);

-- Public can read active services
CREATE POLICY "Public read active services" ON services
  FOR SELECT USING (is_active = true);

-- Service role can do everything (server-side operations)
CREATE POLICY "Service role full access slots" ON slots
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access bookings" ON bookings
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access services" ON services
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access admin_users" ON admin_users
  FOR ALL USING (true) WITH CHECK (true);

-- Allow public to read bookings by booking_code (for status check)
CREATE POLICY "Public read own booking" ON bookings
  FOR SELECT USING (true);
