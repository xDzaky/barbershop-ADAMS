import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const supabase = createServerClient()

  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { booking_id } = body

  if (!booking_id) {
    return NextResponse.json({ error: 'Booking ID wajib diisi' }, { status: 400 })
  }

  // Fetch booking with slot
  const { data: booking, error } = await supabase
    .from('bookings')
    .select('*, slots(*)')
    .eq('id', booking_id)
    .in('status', ['confirmed', 'checked_in', 'downgraded'])
    .single()

  if (error || !booking) {
    return NextResponse.json({ error: 'Booking tidak ditemukan' }, { status: 404 })
  }

  const now = new Date()

  // If booking is confirmed but not checked in yet, check lateness
  if (booking.status === 'confirmed') {
    const scheduledAt = new Date(`${booking.slots.date}T${booking.slots.start_time}`)
    const diffMinutes = (now.getTime() - scheduledAt.getTime()) / 60000

    if (diffMinutes > 10) {
      // Late — downgrade to walk-in
      await supabase
        .from('bookings')
        .update({
          status: 'downgraded',
          priority: 'walkin',
          checkin_at: now.toISOString(),
        })
        .eq('id', booking.id)

      return NextResponse.json({
        downgraded: true,
        message: 'Pelanggan terlambat, masuk antrian walk-in',
      })
    }
  }

  // Start service
  await supabase
    .from('bookings')
    .update({ status: 'in_service' })
    .eq('id', booking.id)

  return NextResponse.json({ success: true, message: 'Layanan dimulai' })
}
