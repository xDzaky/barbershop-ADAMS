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
    .select('*, slots(*)')
    .eq('id', booking_id)
    .eq('status', 'in_service')
    .single()

  if (error || !booking) {
    return NextResponse.json({ error: 'Booking tidak ditemukan atau belum dimulai' }, { status: 404 })
  }

  // Mark booking as done
  await supabase
    .from('bookings')
    .update({ status: 'done' })
    .eq('id', booking.id)

  // Mark slot as done
  await supabase
    .from('slots')
    .update({ status: 'done' })
    .eq('id', booking.slot_id)

  return NextResponse.json({ success: true, message: 'Layanan selesai' })
}
