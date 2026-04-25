import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const supabase = createServerClient()
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.json({ error: 'Kode booking wajib diisi' }, { status: 400 })
  }

  const { data: booking, error } = await supabase
    .from('bookings')
    .select('*, slots(*), services(*)')
    .eq('booking_code', code)
    .single()

  if (error || !booking) {
    return NextResponse.json({ error: 'Booking tidak ditemukan' }, { status: 404 })
  }

  return NextResponse.json({ booking })
}
