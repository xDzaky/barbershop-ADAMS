import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const supabase = createServerClient()
  const { searchParams } = new URL(req.url)
  const filter = searchParams.get('filter') || 'today'

  let dateFilter: { start: string; end: string }
  const now = new Date()

  switch (filter) {
    case 'week': {
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - now.getDay())
      dateFilter = {
        start: weekStart.toISOString().split('T')[0],
        end: now.toISOString().split('T')[0],
      }
      break
    }
    case 'month': {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      dateFilter = {
        start: monthStart.toISOString().split('T')[0],
        end: now.toISOString().split('T')[0],
      }
      break
    }
    default: {
      const today = now.toISOString().split('T')[0]
      dateFilter = { start: today, end: today }
    }
  }

  const { data, error } = await supabase
    .from('bookings')
    .select('*, slots!inner(*), services(*)')
    .gte('slots.date', dateFilter.start)
    .lte('slots.date', dateFilter.end)
    .in('status', ['done', 'cancelled', 'downgraded'])
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Calculate summary
  const totalDP = (data ?? [])
    .filter((b) => b.dp_paid && b.status === 'done')
    .reduce((sum, b) => sum + (b.dp_amount || 0), 0)

  const totalServed = (data ?? []).filter((b) => b.status === 'done').length

  return NextResponse.json({
    history: data ?? [],
    summary: {
      total_dp: totalDP,
      total_served: totalServed,
    },
  })
}
