'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

interface BookingDetail {
  id: string
  booking_code: string
  customer_name: string
  customer_phone: string
  status: string
  priority: string
  checkin_at: string | null
  created_at: string
  slots: { date: string; start_time: string; end_time: string }
  services: { name: string; price: number }
}

const statusLabels: Record<string, { label: string; badge: string; icon: string }> = {
  pending_payment: { label: 'Menunggu Konfirmasi', badge: 'badge-pending', icon: '⏳' },
  confirmed: { label: 'Terkonfirmasi', badge: 'badge-booking', icon: '✅' },
  checked_in: { label: 'Sudah Check-in', badge: 'badge-booking', icon: '📍' },
  in_service: { label: 'Sedang Dilayani', badge: 'badge-open', icon: '✂️' },
  done: { label: 'Selesai', badge: 'badge-done', icon: '🎉' },
  cancelled: { label: 'Dibatalkan', badge: 'badge-cancelled', icon: '❌' },
  downgraded: { label: 'Antrian Walk-in', badge: 'badge-downgraded', icon: '⚠️' },
}

export default function BookingStatusPage() {
  const params = useParams()
  const router = useRouter()
  const bookingCode = params.id as string
  const [booking, setBooking] = useState<BookingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!bookingCode) return
    fetch(`/api/booking/status?code=${bookingCode}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.booking) {
          setBooking(data.booking)
        } else {
          setNotFound(true)
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [bookingCode])

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
  }

  if (loading) {
    return (
      <div className="container">
        <div className="loading-spinner" style={{ minHeight: '60vh' }}><div className="spinner" /></div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="container">
        <div className="empty-state" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="empty-state-icon">🔍</div>
          <p className="empty-state-text">Booking tidak ditemukan</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>Kode: {bookingCode}</p>
          <button className="btn btn-outline" style={{ marginTop: '16px' }} onClick={() => router.push('/')}>
            Kembali ke Home
          </button>
        </div>
      </div>
    )
  }

  if (!booking) return null

  const status = statusLabels[booking.status] || { label: booking.status, badge: '', icon: '📋' }

  return (
    <div className="container" style={{ paddingBottom: '32px' }}>
      <div className="page-header">
        <button className="back-btn" onClick={() => router.push('/')}>← Home</button>
      </div>

      {/* Status Badge */}
      <div className="fade-in" style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ fontSize: '2.25rem', marginBottom: '12px' }}>{status.icon}</div>
        
        {/* Nomor Antrian Display */}
        <div style={{ marginBottom: '12px' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
            Nomor Antrian
          </p>
          <div className="booking-code" style={{ fontSize: '2rem', padding: '16px 32px', letterSpacing: '0.15em' }}>
            {booking.booking_code}
          </div>
        </div>
        
        <div style={{ marginTop: '12px' }}>
          <span className={`badge ${status.badge}`}>{status.label}</span>
        </div>
      </div>

      {/* Detail Booking */}
      <div className="card fade-in" style={{ marginBottom: '12px' }}>
        <h3 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Detail Booking
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Nama</span>
            <span style={{ fontWeight: 600 }}>{booking.customer_name}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>WhatsApp</span>
            <span style={{ fontWeight: 600 }}>{booking.customer_phone}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Layanan</span>
            <span style={{ fontWeight: 600 }}>{booking.services?.name}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Tanggal</span>
            <span style={{ fontWeight: 600 }}>{formatDate(booking.slots?.date)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Jam</span>
            <span style={{ fontWeight: 600 }}>
              {booking.slots?.start_time?.slice(0, 5)} – {booking.slots?.end_time?.slice(0, 5)}
            </span>
          </div>
        </div>
      </div>

      {/* Pembayaran */}
      <div className="card fade-in">
        <h3 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Pembayaran
        </h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Total Harga</span>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--accent-primary)' }}>
            Rp {booking.services?.price?.toLocaleString('id-ID')}
          </span>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
          💵 Bayar langsung di tempat saat tiba
        </p>
      </div>

      {/* Alert info */}
      {booking.status === 'confirmed' && (
        <div className="alert-banner alert-info" style={{ marginTop: '16px' }}>
          ⏰ Harap datang tepat waktu. Toleransi keterlambatan: 10 menit.
        </div>
      )}
      {booking.status === 'in_service' && (
        <div className="alert-banner alert-info" style={{ marginTop: '16px' }}>
          ✂️ Kamu sedang dilayani. Silakan tunggu!
        </div>
      )}
      {booking.status === 'done' && (
        <div className="alert-banner" style={{ marginTop: '16px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: 'var(--success)' }}>
          🎉 Terima kasih sudah berkunjung!
        </div>
      )}
    </div>
  )
}
