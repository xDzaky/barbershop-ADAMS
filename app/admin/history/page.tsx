'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface HistoryItem {
  id: string
  customer_name: string
  booking_code: string
  status: string
  dp_amount: number
  dp_paid: boolean
  created_at: string
  slots: { date: string; start_time: string }
  services: { name: string }
}

interface Summary {
  total_revenue: number
  total_served: number
}

export default function AdminHistoryPage() {
  const router = useRouter()
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [summary, setSummary] = useState<Summary>({ total_revenue: 0, total_served: 0 })
  const [filter, setFilter] = useState('today')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const loadHistory = async () => {
      setLoading(true)
      try {
        const r = await fetch(`/api/admin/history?filter=${filter}`)
        const data = await r.json()
        if (cancelled) return
        setHistory(data.history || [])
        setSummary(data.summary || { total_revenue: 0, total_served: 0 })
      } catch {
        if (cancelled) return
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadHistory()
    return () => {
      cancelled = true
    }
  }, [filter])

  const statusLabels: Record<string, { label: string; badge: string }> = {
    done: { label: 'Selesai', badge: 'badge-done' },
    cancelled: { label: 'Batal', badge: 'badge-cancelled' },
    downgraded: { label: 'Walk-in', badge: 'badge-downgraded' },
  }

  return (
    <div className="container" style={{ paddingBottom: '32px' }}>
      <div className="page-header">
        <button className="back-btn" onClick={() => router.push('/admin/dashboard')}>← Dashboard</button>
        <h1 className="page-title">Riwayat</h1>
      </div>

      {/* Summary Card */}
      <div className="summary-card fade-in">
        <div className="summary-row">
          <span className="summary-label">Total Pelanggan Dilayani</span>
          <span className="summary-value">{summary.total_served}</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        {[
          { key: 'today', label: 'Hari Ini' },
          { key: 'week', label: 'Minggu Ini' },
          { key: 'month', label: 'Bulan Ini' },
        ].map((f) => (
          <button
            key={f.key}
            className={`filter-tab ${filter === f.key ? 'active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* History List */}
      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : history.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <p className="empty-state-text">Belum ada riwayat</p>
        </div>
      ) : (
        history.map((item, idx) => {
          const st = statusLabels[item.status] || { label: item.status, badge: '' }
          return (
            <div key={item.id} className="history-item fade-in" style={{ animationDelay: `${idx * 0.03}s` }}>
              <div className="history-item-row">
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{item.customer_name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {item.services?.name} · {item.slots?.start_time?.slice(0, 5)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={`badge ${st.badge}`}>{st.label}</span>
                </div>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
