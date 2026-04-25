import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// Toggle individual slot status (block/unblock)
export async function PATCH(req: NextRequest) {
  const supabase = createServerClient()

  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { slot_id, action } = body

  if (!slot_id || !action) {
    return NextResponse.json({ error: 'slot_id dan action wajib diisi' }, { status: 400 })
  }

  if (action === 'block') {
    await supabase
      .from('slots')
      .update({ status: 'blocked' })
      .eq('id', slot_id)
      .in('status', ['open'])
  } else if (action === 'unblock') {
    await supabase
      .from('slots')
      .update({ status: 'open' })
      .eq('id', slot_id)
      .eq('status', 'blocked')
  }

  return NextResponse.json({ success: true })
}

// Block all slots for a date (holiday/day off)
export async function POST(req: NextRequest) {
  const supabase = createServerClient()

  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { date, action } = body

  if (!date || !action) {
    return NextResponse.json({ error: 'date dan action wajib' }, { status: 400 })
  }

  if (action === 'block_all') {
    await supabase
      .from('slots')
      .update({ status: 'blocked' })
      .eq('date', date)
      .eq('status', 'open')
  } else if (action === 'unblock_all') {
    await supabase
      .from('slots')
      .update({ status: 'open' })
      .eq('date', date)
      .eq('status', 'blocked')
  }

  return NextResponse.json({ success: true })
}
