'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface QueueItem {
  id: string
  customer_name: string
  customer_phone: string
  booking_code: string
  status: string
  priority: string
  checkin_at: string | null
  slots: { date: string; start_time: string; end_time: string }
  services: { name: string }
}

export default function AdminQueuePage() {
  const router = useRouter()
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchQueue = useCallback(async () => {
    try {
      const res = await fetch('/api/queue')
      const data = await res.json()
      setQueue(data.queue || [])
    } catch { /* empty */ }
    setLoading(false)
  }, [])

  useEffect(() => {
    const initialLoad = window.setTimeout(() => {
      void fetchQueue()
    }, 0)
    const interval = setInterval(fetchQueue, 10000) // Poll every 10s
    return () => {
      window.clearTimeout(initialLoad)
      clearInterval(interval)
    }
  }, [fetchQueue])

  const handleAction = async (endpoint: string, bookingId: string) => {
    setActionLoading(bookingId)
    try {
      const res = await fetch(`/api/booking/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: bookingId }),
      })
      const data = await res.json()
      if (data.downgraded) {
        alert('Pelanggan terlambat, masuk antrian walk-in')
      }
      await fetchQueue()
    } catch {
      alert('Gagal melakukan aksi')
    }
    setActionLoading(null)
  }

  const handleCheckin = async (bookingCode: string) => {
    setActionLoading(bookingCode)
    try {
      const res = await fetch('/api/booking/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_code: bookingCode }),
      })
      const data = await res.json()
      if (data.downgraded) {
        alert(data.message)
      }
      await fetchQueue()
    } catch {
      alert('Gagal check-in')
    }
    setActionLoading(null)
  }

  const inService = queue.filter((q) => q.status === 'in_service')
  const waiting = queue.filter((q) => ['confirmed', 'checked_in', 'downgraded'].includes(q.status))
  const done = queue.filter((q) => q.status === 'done')

  if (loading) {
    return (
      <div className="container">
        <div className="loading-spinner" style={{ minHeight: '60vh' }}><div className="spinner" /></div>
      </div>
    )
  }

  return (
    <div className="container" style={{ paddingBottom: '32px' }}>
      <div className="page-header">
        <button className="back-btn" onClick={() => router.push('/admin/dashboard')}>← Dashboard</button>
        <h1 className="page-title">Antrian</h1>
      </div>

      {/* In Service */}
      {inService.length > 0 && (
        <>
          <div className="queue-section-title">🔴 Sedang Dilayani</div>
          {inService.map((item) => (
            <div key={item.id} className="queue-item fade-in" style={{ borderLeft: '3px solid var(--success)' }}>
              <div className="queue-item-header">
                <span className="queue-item-name">{item.customer_name}</span>
                <span className="badge badge-open">Dilayani</span>
              </div>
              <div className="queue-item-details">
                {item.services?.name} · {item.slots?.start_time?.slice(0, 5)}
              </div>
              <div className="queue-item-actions">
                <button
                  className="btn btn-success btn-sm btn-block"
                  onClick={() => handleAction('done', item.id)}
                  disabled={actionLoading === item.id}
                >
                  ✅ Selesai
                </button>
              </div>
            </div>
          ))}
        </>
      )}

      {/* Waiting */}
      <div className="queue-section-title">⏳ Menunggu ({waiting.length})</div>
      {waiting.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">✨</div>
          <p className="empty-state-text">Tidak ada antrian</p>
        </div>
      ) : (
        waiting.map((item, idx) => (
          <div key={item.id} className="queue-item fade-in" style={{ animationDelay: `${idx * 0.05}s` }}>
            <div className="queue-item-header">
              <span className="queue-item-name">
                {idx + 1}. {item.customer_name}
              </span>
              <span className={`badge ${item.priority === 'booking' ? 'badge-booking' : 'badge-walkin'}`}>
                {item.priority === 'booking' ? '🔵 Booking' : '⚪ Walk-in'}
              </span>
            </div>
            <div className="queue-item-details">
              {item.services?.name} · Jam {item.slots?.start_time?.slice(0, 5)}
              {item.status === 'checked_in' && ' · ✅ Sudah hadir'}
              {item.status === 'confirmed' && ' · ⏳ Belum hadir'}
              {item.status === 'downgraded' && ' · ⚠️ Terlambat'}
            </div>
            <div className="queue-item-actions">
              {item.status === 'confirmed' && (
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => handleCheckin(item.booking_code)}
                  disabled={actionLoading === item.booking_code}
                >
                  📍 Check-in
                </button>
              )}
              <button
                className="btn btn-primary btn-sm"
                onClick={() => handleAction('start', item.id)}
                disabled={actionLoading === item.id}
              >
                ▶ Mulai
              </button>
              {item.priority === 'booking' && item.status !== 'downgraded' && (
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleAction('absent', item.id)}
                  disabled={actionLoading === item.id}
                >
                  ❌
                </button>
              )}
            </div>
          </div>
        ))
      )}

      {/* Done */}
      {done.length > 0 && (
        <>
          <div className="queue-section-title" style={{ marginTop: '16px' }}>✅ Selesai Hari Ini ({done.length})</div>
          {done.map((item) => (
            <div key={item.id} className="queue-item" style={{ opacity: 0.6 }}>
              <div className="queue-item-header">
                <span className="queue-item-name">{item.customer_name}</span>
                <span className="badge badge-done">Selesai</span>
              </div>
              <div className="queue-item-details">{item.services?.name} · {item.slots?.start_time?.slice(0, 5)}</div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
