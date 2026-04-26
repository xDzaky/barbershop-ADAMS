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
    return NextResponse.json({ error: 'Booking ID required' }, { status: 400 })
  }

  // Get booking data
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('*, slots(*)')
    .eq('id', booking_id)
    .single()

  if (bookingError || !booking) {
    return NextResponse.json({ error: 'Booking tidak ditemukan' }, { status: 404 })
  }

  // Update booking status to confirmed (cash payment)
  const { error: updateError } = await supabase
    .from('bookings')
    .update({
      status: 'confirmed',
      dp_paid: false, // Belum bayar, akan bayar di tempat
    })
    .eq('id', booking_id)

  if (updateError) {
    return NextResponse.json({ error: 'Gagal update booking' }, { status: 500 })
  }

  // Update slot status to booked
  const { error: slotError } = await supabase
    .from('slots')
    .update({
      status: 'booked',
      pending_until: null,
    })
    .eq('id', booking.slot_id)

  if (slotError) {
    console.error('Error updating slot:', slotError)
  }

  return NextResponse.json({
    success: true,
    booking_code: booking.booking_code,
  })
}
