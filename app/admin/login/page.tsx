'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError || !data.session) {
      setError('Email atau password salah')
      setLoading(false)
      return
    }

    // Store token in cookie for middleware
    document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=86400; SameSite=Lax`

    // Check if setup is done
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('is_setup_done')
      .eq('id', data.user.id)
      .single()

    if (!adminUser || !adminUser.is_setup_done) {
      router.push('/admin/setup')
    } else {
      router.push('/admin/dashboard')
    }

    setLoading(false)
  }

  return (
    <div className="container" style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div className="fade-in" style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '8px' }}>🔒</div>
        <h1 className="page-title" style={{ fontSize: '1.5rem' }}>Admin Login</h1>
        <p className="page-subtitle">Masuk ke dashboard barbershop</p>
      </div>

      <form onSubmit={handleLogin} className="fade-in">
        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            className="form-input"
            type="email"
            placeholder="admin@barbershop.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            className="form-input"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && (
          <div className="alert-banner" style={{ background: 'var(--danger-bg)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--danger)', marginBottom: '12px' }}>
            ❌ {error}
          </div>
        )}

        <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
          {loading ? 'Memproses...' : 'Masuk'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <button className="btn btn-ghost" onClick={() => router.push('/')}>
          ← Kembali ke Home
        </button>
      </div>
    </div>
  )
}
