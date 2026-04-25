import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const supabase = createServerClient()
  const now = new Date().toISOString()

  // Release all slots whose pending lock has expired
  const { count: releasedSlots } = await supabase
    .from('slots')
    .update({ status: 'open', pending_until: null })
    .eq('status', 'pending')
    .lt('pending_until', now)

  // Cancel bookings whose payment has expired (older than 6 minutes)
  const sixMinutesAgo = new Date(Date.now() - 6 * 60 * 1000).toISOString()
  const { count: cancelledBookings } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('status', 'pending_payment')
    .lt('created_at', sixMinutesAgo)

  return NextResponse.json({
    released_slots: releasedSlots ?? 0,
    cancelled_bookings: cancelledBookings ?? 0,
  })
}
