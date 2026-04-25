import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { getOpeningRangesForDate } from '@/lib/schedule'

// GET — fetch all slots for admin (with date filter)
export async function GET(req: NextRequest) {
  const supabase = createServerClient()
  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date')

  let query = supabase
    .from('slots')
    .select('*')
    .order('date', { ascending: true })
    .order('start_time', { ascending: true })

  if (date) {
    query = query.eq('date', date)
  } else {
    // Default: today and next 7 days
    const today = new Date().toISOString().split('T')[0]
    const weekLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    query = query.gte('date', today).lte('date', weekLater)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ slots: data ?? [] })
}

// POST — generate slots for a given date based on admin settings
export async function POST(req: NextRequest) {
  const supabase = createServerClient()

  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { date, open_time, close_time, slot_duration } = body

  if (!date) {
    return NextResponse.json({ error: 'Tanggal wajib diisi' }, { status: 400 })
  }

  const duration = slot_duration || 30
  const ranges = open_time && close_time
    ? [{ start: `${open_time}:00`, end: `${close_time}:00` }]
    : getOpeningRangesForDate(date)

  if (ranges.length === 0) {
    return NextResponse.json({ error: 'Barbershop tutup pada tanggal ini' }, { status: 400 })
  }

  const slots = []
  for (const range of ranges) {
    const [startHour, startMin] = range.start.slice(0, 5).split(':').map(Number)
    const [endHour, endMin] = range.end.slice(0, 5).split(':').map(Number)
    let currentMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin

    while (currentMinutes + duration <= endMinutes) {
      const startH = Math.floor(currentMinutes / 60).toString().padStart(2, '0')
      const startM = (currentMinutes % 60).toString().padStart(2, '0')
      const endMins = currentMinutes + duration
      const endH = Math.floor(endMins / 60).toString().padStart(2, '0')
      const endM = (endMins % 60).toString().padStart(2, '0')

      slots.push({
        date,
        start_time: `${startH}:${startM}`,
        end_time: `${endH}:${endM}`,
        status: 'open',
      })

      currentMinutes += duration
    }
  }

  if (slots.length === 0) {
    return NextResponse.json({ error: 'Tidak ada slot yang bisa dibuat' }, { status: 400 })
  }

  // Upsert to avoid duplicate constraint violation
  const { data, error } = await supabase
    .from('slots')
    .upsert(slots, { onConflict: 'date,start_time', ignoreDuplicates: true })
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ created: data?.length ?? 0, slots: data })
}
