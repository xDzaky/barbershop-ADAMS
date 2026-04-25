'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Stats {
  active_queue: number
  open_slots: number
  done_today: number
  total_slots_today: number
  pending_checkins: number
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleLogout = () => {
    document.cookie = 'sb-access-token=; path=/; max-age=0'
    router.push('/admin/login')
  }

  const today = new Date()
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

  if (loading) {
    return (
      <div className="container">
        <div className="loading-spinner" style={{ minHeight: '80vh' }}><div className="spinner" /></div>
      </div>
    )
  }

  return (
    <div className="container" style={{ paddingBottom: '32px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">{days[today.getDay()]}, {today.getDate()} {months[today.getMonth()]} {today.getFullYear()}</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
      </div>

      {/* Quick Actions */}
      {stats && stats.total_slots_today === 0 && (
        <div className="alert-banner alert-warning fade-in">
          <span>⚠️</span>
          <span style={{ flex: 1 }}>Belum ada slot untuk hari ini</span>
          <button className="btn btn-warning btn-sm" onClick={() => router.push('/admin/slots')}>
            + Buka Slot
          </button>
        </div>
      )}

      {stats && stats.pending_checkins > 0 && (
        <div className="alert-banner alert-info fade-in">
          <span>🔔</span>
          <span style={{ flex: 1 }}>{stats.pending_checkins} pelanggan belum check-in</span>
          <button className="btn btn-sm" style={{ background: 'var(--info)', color: '#fff' }} onClick={() => router.push('/admin/queue')}>
            Lihat
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid fade-in">
        <div className="stat-card">
          <div className="stat-value">{stats?.active_queue ?? 0}</div>
          <div className="stat-label">Antrian Aktif</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.open_slots ?? 0}</div>
          <div className="stat-label">Slot Kosong</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.done_today ?? 0}</div>
          <div className="stat-label">Selesai</div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="menu-list fade-in" style={{ marginTop: '8px' }}>
        <a className="menu-item" onClick={() => router.push('/admin/queue')}>
          <div className="menu-icon">📋</div>
          <span className="menu-text">Antrian Hari Ini</span>
          <span className="menu-arrow">›</span>
        </a>
        <a className="menu-item" onClick={() => router.push('/admin/slots')}>
          <div className="menu-icon">🕐</div>
          <span className="menu-text">Kelola Slot</span>
          <span className="menu-arrow">›</span>
        </a>
        <a className="menu-item" onClick={() => router.push('/admin/history')}>
          <div className="menu-icon">📜</div>
          <span className="menu-text">Riwayat Booking</span>
          <span className="menu-arrow">›</span>
        </a>
      </div>
    </div>
  )
}
