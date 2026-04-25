import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// Hanya bisa diakses saat testing mode (SKIP_PAYMENT=true)
export async function GET() {
  if (process.env.SKIP_PAYMENT !== 'true') {
    return NextResponse.json({ error: 'Only available in testing mode' }, { status: 403 })
  }

  const supabase = createServerClient()

  const testEmail = 'admin@barbershop.com'
  const testPassword = 'admin123456'

  // Cek apakah user sudah ada
  const { data: existingUsers } = await supabase.auth.admin.listUsers()
  const alreadyExists = existingUsers?.users?.find((u) => u.email === testEmail)

  let userId: string

  if (alreadyExists) {
    userId = alreadyExists.id
  } else {
    // Buat user baru via admin API
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true, // langsung konfirmasi email
    })

    if (createError || !newUser.user) {
      return NextResponse.json(
        { error: 'Gagal membuat admin user', detail: createError?.message },
        { status: 500 }
      )
    }

    userId = newUser.user.id
  }

  // Pastikan ada di tabel admin_users
  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('id')
    .eq('id', userId)
    .single()

  if (!adminUser) {
    await supabase.from('admin_users').insert({
      id: userId,
      shop_name: 'Barbershop Testing',
      owner_name: 'Admin Testing',
      phone: '081234567890',
      open_time: '09:00',
      close_time: '20:00',
      slot_duration: 30,
      is_setup_done: true, // langsung skip setup wizard
    })
  }

  return NextResponse.json({
    success: true,
    message: '✅ Admin user siap!',
    credentials: {
      email: testEmail,
      password: testPassword,
      url: 'http://localhost:3000/admin/login',
    },
    already_existed: !!alreadyExists,
  })
}
