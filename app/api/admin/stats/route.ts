import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET() {
  const supabase = createServerClient()
  const today = new Date().toISOString().split('T')[0]

  // Active queue count
  const { count: activeQueue } = await supabase
    .from('bookings')
    .select('*, slots!inner(*)', { count: 'exact', head: true })
    .eq('slots.date', today)
    .in('status', ['confirmed', 'checked_in', 'in_service', 'downgraded'])

  // Open slots today
  const { count: openSlots } = await supabase
    .from('slots')
    .select('*', { count: 'exact', head: true })
    .eq('date', today)
    .eq('status', 'open')

  // Done today
  const { count: doneToday } = await supabase
    .from('bookings')
    .select('*, slots!inner(*)', { count: 'exact', head: true })
    .eq('slots.date', today)
    .eq('status', 'done')

  // Check if today has any slots at all
  const { count: totalSlotsToday } = await supabase
    .from('slots')
    .select('*', { count: 'exact', head: true })
    .eq('date', today)

  // Pending check-ins (confirmed but not checked in yet)
  const { count: pendingCheckins } = await supabase
    .from('bookings')
    .select('*, slots!inner(*)', { count: 'exact', head: true })
    .eq('slots.date', today)
    .eq('status', 'confirmed')

  return NextResponse.json({
    active_queue: activeQueue ?? 0,
    open_slots: openSlots ?? 0,
    done_today: doneToday ?? 0,
    total_slots_today: totalSlotsToday ?? 0,
    pending_checkins: pendingCheckins ?? 0,
  })
}
