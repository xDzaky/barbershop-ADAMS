import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { validateBookingForm } from '@/lib/validations'
import { normalizeIndonesianPhone } from '@/lib/phone'

export async function POST(req: NextRequest) {
  const supabase = createServerClient()

  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { slot_id, service_id, customer_name, customer_phone } = body

  // Validate form data
  const validationErrors = validateBookingForm({ slot_id, service_id, customer_name, customer_phone })
  if (validationErrors.length > 0) {
    return NextResponse.json({ errors: validationErrors }, { status: 422 })
  }

  // 1. Fetch slot data
  const { data: slot, error: slotError } = await supabase
    .from('slots')
    .select('*')
    .eq('id', slot_id)
    .single()

  if (slotError || !slot) {
    return NextResponse.json({ error: 'Slot tidak ditemukan' }, { status: 404 })
  }

  // 2. Check slot is still open
  if (slot.status !== 'open') {
    return NextResponse.json({ error: 'Slot tidak tersedia' }, { status: 409 })
  }

  // 3. Validate 30-minute rule (server time)
  const slotDateTime = new Date(`${slot.date}T${slot.start_time}`)
  const minAllowed = new Date(Date.now() + 30 * 60 * 1000)
  if (slotDateTime <= minAllowed) {
    return NextResponse.json(
      { error: 'Booking minimal 30 menit sebelum jadwal' },
      { status: 422 }
    )
  }

  // 4. Lock slot (optimistic lock, 5 minutes)
  const pendingUntil = new Date(Date.now() + 5 * 60 * 1000).toISOString()
  const { error: lockError, count } = await supabase
    .from('slots')
    .update({ status: 'pending', pending_until: pendingUntil })
    .eq('id', slot_id)
    .eq('status', 'open') // Double-check for race condition

  if (lockError || count === 0) {
    return NextResponse.json({ error: 'Slot baru saja dipesan orang lain' }, { status: 409 })
  }

  // 5. Generate unique booking code with format DD-XXX (reset monthly)
  const now = new Date()
  const day = now.getDate().toString().padStart(2, '0')
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString()
  
  // Count bookings this month to get next queue number
  const { count: monthCount } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', monthStart)
    .lt('created_at', monthEnd)
  
  const queueNumber = ((monthCount || 0) + 1).toString().padStart(3, '0')
  const bookingCode = `${day}-${queueNumber}`

  // 6. Fetch service for dp_amount
  const { data: service, error: serviceError } = await supabase
    .from('services')
    .select('dp_amount, name, price')
    .eq('id', service_id)
    .eq('is_active', true)
    .single()

  if (serviceError || !service) {
    // Release slot lock if service is invalid
    await supabase
      .from('slots')
      .update({ status: 'open', pending_until: null })
      .eq('id', slot_id)
    return NextResponse.json({ error: 'Layanan tidak ditemukan' }, { status: 404 })
  }

  // 7. Insert booking
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert({
      slot_id,
      service_id,
      customer_name: customer_name.trim(),
      customer_phone: normalizeIndonesianPhone(customer_phone.trim()),
      booking_code: bookingCode,
      dp_amount: service.dp_amount,
      status: 'pending_payment',
      priority: 'booking',
    })
    .select()
    .single()

  if (bookingError || !booking) {
    // Release slot if booking insert fails
    await supabase
      .from('slots')
      .update({ status: 'open', pending_until: null })
      .eq('id', slot_id)
    return NextResponse.json({ error: 'Gagal membuat booking' }, { status: 500 })
  }

  // 8. Payment step — bypass jika SKIP_PAYMENT=true (testing mode)
  const skipPayment = process.env.SKIP_PAYMENT === 'true'

  if (skipPayment) {
    // Langsung konfirmasi booking tanpa payment gateway
    await supabase
      .from('bookings')
      .update({ status: 'confirmed', dp_paid: true })
      .eq('id', booking.id)

    await supabase
      .from('slots')
      .update({ status: 'booked', pending_until: null })
      .eq('id', slot_id)

    return NextResponse.json({
      booking_code: bookingCode,
      booking_id: booking.id,
      snap_token: null,
      dp_amount: service.dp_amount,
      skip_payment: true,
    })
  }

  // Normal flow: Midtrans Snap
  try {
    const { createMidtransTransaction } = await import('@/lib/midtrans')
    const snapToken = await createMidtransTransaction({
      order_id: booking.id,
      gross_amount: service.dp_amount,
      customer_name: customer_name.trim(),
      customer_phone: normalizeIndonesianPhone(customer_phone.trim()),
      item_name: `DP Booking ${service.name} - ${bookingCode}`,
    })

    return NextResponse.json({
      booking_code: bookingCode,
      booking_id: booking.id,
      snap_token: snapToken,
      dp_amount: service.dp_amount,
    })
  } catch (error) {
    console.error('[Midtrans] Error creating transaction:', error)
    await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', booking.id)
    await supabase.from('slots').update({ status: 'open', pending_until: null }).eq('id', slot_id)
    return NextResponse.json({ error: 'Gagal membuat pembayaran' }, { status: 500 })
  }
}
