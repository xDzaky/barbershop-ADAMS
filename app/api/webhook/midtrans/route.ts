import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { sendWhatsApp, formatBookingConfirmation } from '@/lib/fonnte'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const supabase = createServerClient()

  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  // 1. Verify Midtrans signature
  const serverKey = process.env.MIDTRANS_SERVER_KEY!
  const expectedSignature = crypto
    .createHash('sha512')
    .update(`${body.order_id}${body.status_code}${body.gross_amount}${serverKey}`)
    .digest('hex')

  if (body.signature_key !== expectedSignature) {
    console.error('[Webhook] Invalid Midtrans signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const bookingId = body.order_id
  const isSuccess = ['capture', 'settlement'].includes(body.transaction_status)
  const isFailed = ['deny', 'cancel', 'expire', 'failure'].includes(body.transaction_status)

  if (isSuccess) {
    // Confirm booking
    const { data: booking } = await supabase
      .from('bookings')
      .update({
        status: 'confirmed',
        dp_paid: true,
        payment_id: body.transaction_id,
      })
      .eq('id', bookingId)
      .select('*, slots(*), services(*)')
      .single()

    if (booking) {
      // Update slot to booked
      await supabase
        .from('slots')
        .update({ status: 'booked', pending_until: null })
        .eq('id', booking.slot_id)

      // Send WhatsApp notification
      await sendWhatsApp({
        phone: booking.customer_phone,
        message: formatBookingConfirmation(booking),
      })
    }
  }

  if (isFailed) {
    // Cancel booking and release slot
    const { data: booking } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId)
      .select('slot_id')
      .single()

    if (booking) {
      await supabase
        .from('slots')
        .update({ status: 'open', pending_until: null })
        .eq('id', booking.slot_id)
    }
  }

  return NextResponse.json({ received: true })
}
