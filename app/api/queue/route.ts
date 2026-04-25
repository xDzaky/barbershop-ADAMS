import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET() {
  const supabase = createServerClient()
  const today = new Date().toISOString().split('T')[0]

  // Get today's queue ordered by priority (booking first, then walkin), then time
  const { data: queue, error } = await supabase
    .from('bookings')
    .select('*, slots!inner(*), services(*)')
    .eq('slots.date', today)
    .in('status', ['confirmed', 'checked_in', 'in_service', 'downgraded', 'done'])
    .order('priority', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ queue: queue ?? [] })
}
