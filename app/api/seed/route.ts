import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { getOpeningRangesForDate } from '@/lib/schedule'

export async function GET() {
  // Hanya aktif jika SKIP_PAYMENT=true (testing mode)
  if (process.env.SKIP_PAYMENT !== 'true') {
    return NextResponse.json({ error: 'Seed only available in testing mode' }, { status: 403 })
  }

  const supabase = createServerClient()

  // 1. Insert services
  const { data: existingServices } = await supabase.from('services').select('id').limit(1)

  if (!existingServices || existingServices.length === 0) {
    const { error: svcError } = await supabase.from('services').insert([
      { name: 'Cukur Dewasa & Anak-anak', price: 20000, dp_amount: 10000, duration_min: 30, is_active: true },
      { name: 'Cukur + keramas + simple hair care', price: 25000, dp_amount: 12500, duration_min: 45, is_active: true },
      { name: 'Booking Nomor Antrian Cukur', price: 25000, dp_amount: 12500, duration_min: 30, is_active: true },
      { name: 'Booking cukur + keramas + SHC', price: 30000, dp_amount: 15000, duration_min: 60, is_active: true },
      { name: 'Hitam', price: 15000, dp_amount: 7500, duration_min: 45, is_active: true },
      { name: 'Highlight', price: 80000, dp_amount: 40000, duration_min: 90, is_active: true },
      { name: 'Highlight + Warna', price: 100000, dp_amount: 50000, duration_min: 120, is_active: true },
      { name: 'Fashion colour', price: 200000, dp_amount: 100000, duration_min: 120, is_active: true },
      { name: 'Curly perm', price: 150000, dp_amount: 75000, duration_min: 120, is_active: true },
    ])

    if (svcError) {
      return NextResponse.json({ error: 'Gagal insert services', detail: svcError.message }, { status: 500 })
    }
  }

  // 2. Generate slots for today + next 3 days
  const slotsToInsert = []
  for (let dayOffset = 0; dayOffset < 4; dayOffset++) {
    const date = new Date()
    date.setDate(date.getDate() + dayOffset)
    const dateStr = date.toISOString().split('T')[0]

    // Check if slots already exist for this date
    const { data: existingSlots } = await supabase
      .from('slots')
      .select('id')
      .eq('date', dateStr)
      .limit(1)

    if (existingSlots && existingSlots.length > 0) continue

    const ranges = getOpeningRangesForDate(dateStr)
    for (const range of ranges) {
      const [startHour, startMin] = range.start.slice(0, 5).split(':').map(Number)
      const [endHour, endMin] = range.end.slice(0, 5).split(':').map(Number)
      const startTotal = startHour * 60 + startMin
      const endTotal = endHour * 60 + endMin

      for (let current = startTotal; current + 30 <= endTotal; current += 30) {
        const sH = Math.floor(current / 60).toString().padStart(2, '0')
        const sM = (current % 60).toString().padStart(2, '0')
        const next = current + 30
        const eH = Math.floor(next / 60).toString().padStart(2, '0')
        const eM = (next % 60).toString().padStart(2, '0')

        slotsToInsert.push({
          date: dateStr,
          start_time: `${sH}:${sM}:00`,
          end_time: `${eH}:${eM}:00`,
          status: 'open',
        })
      }
    }
  }

  if (slotsToInsert.length > 0) {
    const { error: slotError } = await supabase.from('slots').insert(slotsToInsert)
    if (slotError) {
      return NextResponse.json({ error: 'Gagal insert slots', detail: slotError.message }, { status: 500 })
    }
  }

  // 3. Get summary
  const { data: services } = await supabase.from('services').select('service_key, name, price')
  const { count: slotCount } = await supabase.from('slots').select('*', { count: 'exact', head: true }).eq('status', 'open')

  return NextResponse.json({
    success: true,
    message: '✅ Seed berhasil!',
    services_count: services?.length ?? 0,
    services,
    open_slots: slotCount ?? 0,
  })
}
