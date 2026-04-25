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

  // Fetch booking
  const { data: booking, error } = await supabase
    .from('bookings')
    .select('slot_id')
    .eq('id', booking_id)
    .in('status', ['confirmed', 'checked_in'])
    .single()

  if (error || !booking) {
    return NextResponse.json({ error: 'Booking tidak ditemukan' }, { status: 404 })
  }

  // Mark booking as cancelled (absent)
  await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', booking_id)

  // Release the slot back to open
  await supabase
    .from('slots')
    .update({ status: 'open', pending_until: null })
    .eq('id', booking.slot_id)

  return NextResponse.json({ success: true, message: 'Pelanggan ditandai tidak hadir' })
}
