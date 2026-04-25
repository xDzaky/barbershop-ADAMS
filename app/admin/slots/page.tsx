'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface Slot {
  id: string
  date: string
  start_time: string
  end_time: string
  status: string
}

export default function AdminSlotsPage() {
  const router = useRouter()
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date()
    return d.toISOString().split('T')[0]
  })
  const [generating, setGenerating] = useState(false)

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return d.toISOString().split('T')[0]
  })

  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

  const fetchSlots = useCallback(async (date: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/slots?date=${date}`)
      const data = await res.json()
      setSlots(data.slots || [])
    } catch { /* empty */ }
    setLoading(false)
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchSlots(selectedDate)
    }, 0)
    return () => window.clearTimeout(timer)
  }, [selectedDate, fetchSlots])

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const res = await fetch('/api/admin/slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate }),
      })
      if (res.ok) {
        await fetchSlots(selectedDate)
      }
    } catch { /* empty */ }
    setGenerating(false)
  }

  const handleSlotAction = async (slotId: string, action: 'block' | 'unblock') => {
    try {
      await fetch('/api/admin/slots/manage', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slot_id: slotId, action }),
      })
      await fetchSlots(selectedDate)
    } catch { /* empty */ }
  }

  const handleBlockAll = async () => {
    if (!confirm('Blokir semua slot hari ini?')) return
    try {
      await fetch('/api/admin/slots/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate, action: 'block_all' }),
      })
      await fetchSlots(selectedDate)
    } catch { /* empty */ }
  }

  const statusColors: Record<string, string> = {
    open: 'open',
    pending: 'pending',
    booked: 'booked',
    blocked: 'blocked',
    done: 'done',
  }

  const statusIcons: Record<string, string> = {
    open: '🟢',
    pending: '🟡',
    booked: '🔵',
    blocked: '⚫',
    done: '✅',
  }

  return (
    <div className="container" style={{ paddingBottom: '32px' }}>
      <div className="page-header">
        <button className="back-btn" onClick={() => router.push('/admin/dashboard')}>← Dashboard</button>
        <h1 className="page-title">Kelola Slot</h1>
      </div>

      {/* Date tabs */}
      <div className="date-tabs">
        {dates.map((d) => {
          const dateObj = new Date(d)
          return (
            <button
              key={d}
              className={`date-tab ${selectedDate === d ? 'active' : ''}`}
              onClick={() => setSelectedDate(d)}
            >
              <span className="date-tab-day">{dayNames[dateObj.getDay()]}</span>
              <span className="date-tab-date">{dateObj.getDate()}</span>
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', margin: '12px 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        {Object.entries(statusIcons).map(([key, icon]) => (
          <span key={key}>{icon} {key}</span>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <button className="btn btn-primary btn-sm" onClick={handleGenerate} disabled={generating} style={{ flex: 1 }}>
          {generating ? '...' : '+ Generate Slot'}
        </button>
        <button className="btn btn-outline btn-sm" onClick={handleBlockAll} style={{ flex: 1 }}>
          🚫 Blokir Semua
        </button>
      </div>

      {/* Slot grid */}
      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : slots.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <p className="empty-state-text">Belum ada slot untuk tanggal ini</p>
          <button className="btn btn-primary btn-sm" style={{ marginTop: '12px' }} onClick={handleGenerate}>
            + Generate Slot
          </button>
        </div>
      ) : (
        <div className="slot-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {slots.map((slot) => (
            <div
              key={slot.id}
              className={`slot-chip ${statusColors[slot.status] || ''}`}
              onClick={() => {
                if (slot.status === 'open') handleSlotAction(slot.id, 'block')
                else if (slot.status === 'blocked') handleSlotAction(slot.id, 'unblock')
              }}
              title={`${slot.start_time.slice(0, 5)} - ${slot.status}`}
            >
              <div>{slot.start_time.slice(0, 5)}</div>
              <div style={{ fontSize: '0.7rem', marginTop: '2px' }}>{statusIcons[slot.status]}</div>
            </div>
          ))}
        </div>
      )}

      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '12px' }}>
        Tap slot 🟢 untuk blokir · Tap ⚫ untuk buka kembali
      </p>
    </div>
  )
}
