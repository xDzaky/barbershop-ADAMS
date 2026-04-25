import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { getPeriodForTime } from '@/lib/schedule'

export async function GET(req: NextRequest) {
  const supabase = createServerClient()
  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date') ?? new Date().toISOString().split('T')[0]

  // Calculate minimum booking time (NOW + 30 minutes) using server time
  const now = new Date()
  const minBookingTime = new Date(now.getTime() + 30 * 60 * 1000)

  // If requested date is today, filter by time. If future date, show all open slots.
  const today = now.toISOString().split('T')[0]
  const isToday = date === today

  let query = supabase
    .from('slots')
    .select('id, start_time, end_time, status')
    .eq('date', date)
    .eq('status', 'open')
    .order('start_time', { ascending: true })

  if (isToday) {
    const minTimeStr = minBookingTime.toTimeString().slice(0, 5)
    query = query.gt('start_time', minTimeStr)
  }

  const { data, error } = await query

  const normalizedSlots = (data ?? []).map((slot) => ({
    ...slot,
    period: getPeriodForTime(slot.start_time),
  }))

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ slots: normalizedSlots })
}
