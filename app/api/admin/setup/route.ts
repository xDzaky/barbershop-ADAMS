import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const supabase = createServerClient()

  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { shop_name, owner_name, phone, address, open_time, close_time, slot_duration, services, user_id } = body

  if (!shop_name || !owner_name || !user_id) {
    return NextResponse.json({ error: 'Data wajib tidak lengkap' }, { status: 400 })
  }

  // 1. Update or insert admin_users profile
  const { error: profileError } = await supabase
    .from('admin_users')
    .upsert({
      id: user_id,
      shop_name,
      owner_name,
      phone: phone || null,
      address: address || null,
      open_time: open_time || '09:00',
      close_time: close_time || '20:00',
      slot_duration: slot_duration || 30,
      is_setup_done: true,
    })

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  // 2. Insert services if provided
  if (services && Array.isArray(services) && services.length > 0) {
    const serviceRows = services.map((s: { name: string; price: number; dp_amount: number; duration_min?: number }) => ({
      name: s.name,
      price: s.price,
      dp_amount: s.dp_amount,
      duration_min: s.duration_min || slot_duration || 30,
      is_active: true,
    }))

    const { error: servicesError } = await supabase
      .from('services')
      .insert(serviceRows)

    if (servicesError) {
      console.error('[Setup] Services insert error:', servicesError)
    }
  }

  // 3. Auto-generate slots for 7 days
  const effectiveOpen = open_time || '09:00'
  const effectiveClose = close_time || '20:00'
  const effectiveDuration = slot_duration || 30

  const allSlots = []
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const date = new Date()
    date.setDate(date.getDate() + dayOffset)
    const dateStr = date.toISOString().split('T')[0]

    const [openH, openM] = effectiveOpen.split(':').map(Number)
    const [closeH, closeM] = effectiveClose.split(':').map(Number)

    let currentMin = openH * 60 + openM
    const endMin = closeH * 60 + closeM

    while (currentMin + effectiveDuration <= endMin) {
      const sH = Math.floor(currentMin / 60).toString().padStart(2, '0')
      const sM = (currentMin % 60).toString().padStart(2, '0')
      const eMin = currentMin + effectiveDuration
      const eH = Math.floor(eMin / 60).toString().padStart(2, '0')
      const eM = (eMin % 60).toString().padStart(2, '0')

      allSlots.push({
        date: dateStr,
        start_time: `${sH}:${sM}`,
        end_time: `${eH}:${eM}`,
        status: 'open',
      })

      currentMin += effectiveDuration
    }
  }

  if (allSlots.length > 0) {
    await supabase
      .from('slots')
      .upsert(allSlots, { onConflict: 'date,start_time', ignoreDuplicates: true })
  }

  return NextResponse.json({ success: true, slots_created: allSlots.length })
}
