import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { sendWhatsApp, formatReminder } from '@/lib/fonnte'

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const supabase = createServerClient()

  // Window: bookings starting in 55–65 minutes from now
  const windowStart = new Date(Date.now() + 55 * 60 * 1000)
  const windowEnd = new Date(Date.now() + 65 * 60 * 1000)

  const { data: upcomingBookings } = await supabase
    .from('bookings')
    .select('*, slots(*)')
    .eq('status', 'confirmed')
    .eq('reminder_sent', false)

  if (!upcomingBookings || upcomingBookings.length === 0) {
    return NextResponse.json({ reminders_sent: 0 })
  }

  // Filter bookings within the reminder window
  const toRemind = upcomingBookings.filter((b) => {
    const slotTime = new Date(`${b.slots.date}T${b.slots.start_time}`)
    return slotTime >= windowStart && slotTime <= windowEnd
  })

  let sentCount = 0
  for (const booking of toRemind) {
    await sendWhatsApp({
      phone: booking.customer_phone,
      message: formatReminder(booking),
    })
    await supabase
      .from('bookings')
      .update({ reminder_sent: true })
      .eq('id', booking.id)
    sentCount++
  }

  return NextResponse.json({ reminders_sent: sentCount })
}
