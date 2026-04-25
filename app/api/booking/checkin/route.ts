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

  const { booking_code } = body

  if (!booking_code) {
    return NextResponse.json({ error: 'Kode booking wajib diisi' }, { status: 400 })
  }

  // Fetch booking with slot data
  const { data: booking, error } = await supabase
    .from('bookings')
    .select('*, slots(*)')
    .eq('booking_code', booking_code)
    .eq('status', 'confirmed')
    .single()

  if (error || !booking) {
    return NextResponse.json({ error: 'Booking tidak ditemukan atau sudah check-in' }, { status: 404 })
  }

  const now = new Date()

  // Check lateness tolerance (10 minutes)
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
      message: 'Pelanggan terlambat lebih dari 10 menit, masuk antrian walk-in',
    })
  }

  // Normal check-in
  await supabase
    .from('bookings')
    .update({
      status: 'checked_in',
      checkin_at: now.toISOString(),
    })
    .eq('id', booking.id)

  return NextResponse.json({ success: true, message: 'Check-in berhasil' })
}
