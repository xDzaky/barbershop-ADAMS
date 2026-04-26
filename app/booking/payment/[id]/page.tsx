'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

interface BookingData {
  id: string
  booking_code: string
  customer_name: string
  customer_phone: string
  status: string
  slots: { date: string; start_time: string; end_time: string }
  services: { name: string; price: number }
}

export default function PaymentPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params.id as string
  
  const [booking, setBooking] = useState<BookingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'cash'>('cash')
  const [showQRIS, setShowQRIS] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    if (!bookingId) return
    
    // Fetch booking data
    fetch(`/api/booking/status?code=${bookingId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.booking) {
          setBooking(data.booking)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [bookingId])

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`
  }

  const formatPrice = (n: number) => `${(n / 1000).toFixed(0)}K`

  const handlePayment = async () => {
    if (!booking) return
    
    setProcessing(true)

    if (paymentMethod === 'cash') {
      // Bayar langsung - show modal
      setShowQRIS(true)
    } else {
      // QRIS payment - show QRIS image
      setShowQRIS(true)
    }
    
    setProcessing(false)
  }

  const handleConfirmQRIS = async () => {
    if (!booking) return
    
    setProcessing(true)
    
    try {
      const response = await fetch('/api/booking/confirm-cash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: booking.id })
      })

      if (response.ok) {
        // Tutup modal QRIS/Cash
        setShowQRIS(false)
        
        // Tampilkan animasi sukses
        setShowSuccess(true)
        
        // Redirect setelah 2 detik
        setTimeout(() => {
          router.push(`/booking/${booking.booking_code}`)
        }, 2000)
      }
    } catch (error) {
      console.error('Error:', error)
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="payment-container">
        <div className="loading-spinner"><div className="spinner" /></div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="payment-container">
        <div className="empty-state">
          <p>Booking tidak ditemukan</p>
        </div>
      </div>
    )
  }

  return (
    <div className="payment-container">
      {/* Header */}
      <div className="payment-header">
        <button className="back-btn-payment" onClick={() => router.back()}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="payment-title">Bayar Pesanan</h1>
      </div>

      {/* Barbershop Info Card */}
      <div className="payment-shop-card">
        <div className="payment-shop-image">
          <span style={{ fontSize: '3rem' }}>💈</span>
        </div>
        <div className="payment-shop-info">
          <h3 className="payment-shop-name">Kang Cukur Adam's</h3>
          <div className="payment-shop-service">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="3" width="12" height="10" rx="1" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M2 6H14M5 3V1M11 3V1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span>{booking.services.name}</span>
          </div>
        </div>
      </div>

      {/* Payment Details */}
      <div className="payment-details-card">
        <div className="payment-section">
          <h3 className="payment-section-title">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="3" width="12" height="10" rx="1" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M2 6H14M5 3V1M11 3V1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Tanggal & Waktu
          </h3>
          <p className="payment-section-value">
            {formatDate(booking.slots.date)} - Sore - {booking.slots.start_time.slice(0, 5)}
          </p>
        </div>

        <div className="payment-divider"></div>

        <div className="payment-section">
          <h3 className="payment-section-title">Pembayaran</h3>
          <div className="payment-row">
            <span className="payment-label">{booking.services.name}</span>
            <span className="payment-value">{formatPrice(booking.services.price)}</span>
          </div>
          <div className="payment-row payment-total">
            <span className="payment-label-total">Total</span>
            <span className="payment-value-total">{formatPrice(booking.services.price)}</span>
          </div>
        </div>

        <div className="payment-divider"></div>

        <div className="payment-section">
          <h3 className="payment-section-title">Metode pembayaran</h3>
          <div className="payment-methods">
            <button
              className={`payment-method-btn ${paymentMethod === 'qris' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('qris')}
            >
              <div className="payment-method-icon">QRIS</div>
            </button>
            <button
              className={`payment-method-btn ${paymentMethod === 'cash' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('cash')}
            >
              <span>Bayar Langsung</span>
            </button>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="payment-action">
        <button
          className="payment-submit-btn"
          onClick={handlePayment}
          disabled={processing}
        >
          <span>{processing ? 'Memproses...' : 'Bayar Sekarang'}</span>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 3.33334V5.83334M13.3333 3.33334V5.83334M3.33333 9.16667H16.6667M5 5H15C15.9205 5 16.6667 5.74619 16.6667 6.66667V15C16.6667 15.9205 15.9205 16.6667 15 16.6667H5C4.07953 16.6667 3.33333 15.9205 3.33333 15V6.66667C3.33333 5.74619 4.07953 5 5 5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Success Animation Modal */}
      {showSuccess && (
        <div className="success-modal-overlay">
          <div className="success-modal">
            <div className="success-checkmark">
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="40" cy="40" r="38" stroke="#10B981" strokeWidth="4" className="success-circle"/>
                <path d="M25 40L35 50L55 30" stroke="#10B981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="success-check"/>
              </svg>
            </div>
            <h2 className="success-title">Pembayaran Berhasil!</h2>
            <p className="success-message">
              {paymentMethod === 'qris' 
                ? 'Silahkan download QRIS dan lakukan pembayaran'
                : 'Silahkan datang ke barbershop untuk melakukan pembayaran'}
            </p>
            <div className="success-loader">
              <div className="success-loader-bar"></div>
            </div>
            <p className="success-redirect">Mengalihkan ke halaman detail...</p>
          </div>
        </div>
      )}

      {/* QRIS Modal */}
      {showQRIS && (
        <div className="qris-modal-overlay" onClick={() => setShowQRIS(false)}>
          <div className="qris-modal" onClick={(e) => e.stopPropagation()}>
            {paymentMethod === 'qris' ? (
              // QRIS Payment
              <>
                <div className="qris-content">
                  <h2 className="qris-title-main">Bayar dengan Qris</h2>
                  <p className="qris-subtitle-main">
                    Silahkan download lalu scan dengan<br />
                    aplikasi dompet digital Anda.
                  </p>
                </div>

                <div className="qris-image-container">
                  <div className="qris-image-wrapper">
                    <div className="qris-placeholder">
                      <div className="qris-placeholder-header">
                        <div className="qris-logo">QRIS</div>
                        <div className="qris-logo-gpn">GPN</div>
                      </div>
                      
                      <div className="qris-placeholder-merchant">
                        <p className="qris-merchant-name">Kang Cukur Adam's</p>
                        <p className="qris-merchant-id">NMID: XXXXXXXXXXXX</p>
                        <p className="qris-merchant-tid">TID</p>
                      </div>
                      
                      <div className="qris-qr-code">
                        <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
                          <rect width="120" height="120" fill="white"/>
                          
                          {/* Top-left corner */}
                          <rect x="8" y="8" width="28" height="28" fill="black"/>
                          <rect x="12" y="12" width="20" height="20" fill="white"/>
                          <rect x="16" y="16" width="12" height="12" fill="black"/>
                          
                          {/* Top-right corner */}
                          <rect x="84" y="8" width="28" height="28" fill="black"/>
                          <rect x="88" y="12" width="20" height="20" fill="white"/>
                          <rect x="92" y="16" width="12" height="12" fill="black"/>
                          
                          {/* Bottom-left corner */}
                          <rect x="8" y="84" width="28" height="28" fill="black"/>
                          <rect x="12" y="88" width="20" height="20" fill="white"/>
                          <rect x="16" y="92" width="12" height="12" fill="black"/>
                          
                          {/* QR pattern - horizontal lines */}
                          <rect x="44" y="12" width="4" height="4" fill="black"/>
                          <rect x="52" y="12" width="4" height="4" fill="black"/>
                          <rect x="60" y="12" width="4" height="4" fill="black"/>
                          <rect x="68" y="12" width="4" height="4" fill="black"/>
                          
                          <rect x="44" y="20" width="4" height="4" fill="black"/>
                          <rect x="56" y="20" width="4" height="4" fill="black"/>
                          <rect x="64" y="20" width="4" height="4" fill="black"/>
                          
                          <rect x="48" y="28" width="4" height="4" fill="black"/>
                          <rect x="60" y="28" width="4" height="4" fill="black"/>
                          <rect x="72" y="28" width="4" height="4" fill="black"/>
                          
                          {/* Middle section */}
                          <rect x="12" y="44" width="4" height="4" fill="black"/>
                          <rect x="20" y="44" width="4" height="4" fill="black"/>
                          <rect x="28" y="44" width="4" height="4" fill="black"/>
                          
                          <rect x="44" y="44" width="4" height="4" fill="black"/>
                          <rect x="52" y="44" width="4" height="4" fill="black"/>
                          <rect x="60" y="44" width="4" height="4" fill="black"/>
                          <rect x="68" y="44" width="4" height="4" fill="black"/>
                          
                          <rect x="88" y="44" width="4" height="4" fill="black"/>
                          <rect x="96" y="44" width="4" height="4" fill="black"/>
                          <rect x="104" y="44" width="4" height="4" fill="black"/>
                          
                          <rect x="16" y="52" width="4" height="4" fill="black"/>
                          <rect x="32" y="52" width="4" height="4" fill="black"/>
                          <rect x="48" y="52" width="4" height="4" fill="black"/>
                          <rect x="64" y="52" width="4" height="4" fill="black"/>
                          <rect x="80" y="52" width="4" height="4" fill="black"/>
                          <rect x="96" y="52" width="4" height="4" fill="black"/>
                          
                          <rect x="12" y="60" width="4" height="4" fill="black"/>
                          <rect x="28" y="60" width="4" height="4" fill="black"/>
                          <rect x="44" y="60" width="4" height="4" fill="black"/>
                          <rect x="60" y="60" width="4" height="4" fill="black"/>
                          <rect x="76" y="60" width="4" height="4" fill="black"/>
                          <rect x="92" y="60" width="4" height="4" fill="black"/>
                          <rect x="108" y="60" width="4" height="4" fill="black"/>
                          
                          <rect x="20" y="68" width="4" height="4" fill="black"/>
                          <rect x="36" y="68" width="4" height="4" fill="black"/>
                          <rect x="52" y="68" width="4" height="4" fill="black"/>
                          <rect x="68" y="68" width="4" height="4" fill="black"/>
                          <rect x="84" y="68" width="4" height="4" fill="black"/>
                          <rect x="100" y="68" width="4" height="4" fill="black"/>
                          
                          {/* Bottom section */}
                          <rect x="44" y="88" width="4" height="4" fill="black"/>
                          <rect x="52" y="88" width="4" height="4" fill="black"/>
                          <rect x="60" y="88" width="4" height="4" fill="black"/>
                          <rect x="68" y="88" width="4" height="4" fill="black"/>
                          <rect x="76" y="88" width="4" height="4" fill="black"/>
                          
                          <rect x="48" y="96" width="4" height="4" fill="black"/>
                          <rect x="64" y="96" width="4" height="4" fill="black"/>
                          <rect x="80" y="96" width="4" height="4" fill="black"/>
                          <rect x="96" y="96" width="4" height="4" fill="black"/>
                          
                          <rect x="44" y="104" width="4" height="4" fill="black"/>
                          <rect x="60" y="104" width="4" height="4" fill="black"/>
                          <rect x="76" y="104" width="4" height="4" fill="black"/>
                          <rect x="92" y="104" width="4" height="4" fill="black"/>
                          <rect x="108" y="104" width="4" height="4" fill="black"/>
                        </svg>
                      </div>
                      
                      <p className="qris-instruction">SATU QRIS UNTUK SEMUA</p>
                      <p className="qris-footer">Cek aplikasi penyedia gopay di www.aspi-qris.id</p>
                      <p className="qris-amount">Diciptakan oleh: (Bisnis NMID: Versi cetak: 6.24.08.20</p>
                    </div>
                  </div>
                </div>

                <div className="qris-details">
                  <div className="qris-shop-info">
                    <h3 className="qris-shop-name">Kang Cukur Adam's</h3>
                    <p className="qris-shop-date">{formatDate(booking.slots.date)}</p>
                  </div>
                  <p className="qris-service-name">{booking.services.name}</p>
                  
                  <div className="qris-payment-section">
                    <h4 className="qris-payment-title">Pembayaran</h4>
                    <div className="qris-payment-row">
                      <span>{booking.services.name}</span>
                      <span>{formatPrice(booking.services.price)}</span>
                    </div>
                    <div className="qris-payment-divider"></div>
                    <div className="qris-payment-row qris-payment-total">
                      <span>Total</span>
                      <span>{formatPrice(booking.services.price)}</span>
                    </div>
                  </div>

                  <div className="qris-actions">
                    <button className="qris-btn-cancel" onClick={() => setShowQRIS(false)}>
                      Batalkan
                    </button>
                    <button className="qris-btn-download" onClick={handleConfirmQRIS} disabled={processing}>
                      <span>{processing ? 'Memproses...' : 'Download'}</span>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 11L8 3M8 11L5 8M8 11L11 8M2 13H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              // Cash Payment
              <>
                <div className="qris-content">
                  <div className="qris-badge">
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="24" cy="24" r="24" fill="white"/>
                      <path d="M20 24L22.5 26.5L28 21" stroke="#3D3B6B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h2 className="qris-title">Bayar Langsung</h2>
                  <p className="qris-subtitle">
                    Silahkan datang ke BaberShop<br />
                    Kang Cukur Adam's untuk melakukan<br />
                    pembayaran.
                  </p>
                </div>

                <div className="qris-details">
                  <div className="qris-shop-info">
                    <h3 className="qris-shop-name">Kang Cukur Adam's</h3>
                    <p className="qris-shop-date">{formatDate(booking.slots.date)}</p>
                  </div>
                  <p className="qris-service-name">{booking.services.name}</p>
                  
                  <div className="qris-payment-section">
                    <h4 className="qris-payment-title">Pembayaran</h4>
                    <div className="qris-payment-row">
                      <span>{booking.services.name}</span>
                      <span>{formatPrice(booking.services.price)}</span>
                    </div>
                    <div className="qris-payment-divider"></div>
                    <div className="qris-payment-row qris-payment-total">
                      <span>Total</span>
                      <span>{formatPrice(booking.services.price)}</span>
                    </div>
                  </div>

                  <div className="qris-actions">
                    <button className="qris-btn-cancel" onClick={() => setShowQRIS(false)}>
                      Batalkan
                    </button>
                    <button className="qris-btn-confirm" onClick={handleConfirmQRIS} disabled={processing}>
                      {processing ? 'Memproses...' : 'Oke'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
