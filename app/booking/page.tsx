'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isValidIndonesianPhone, normalizeIndonesianPhone } from '@/lib/phone'
import { resolveServiceForPriceListItem, type ServiceRecord } from '@/lib/services'
import { getOpeningRangesForDate, getPeriodForTime } from '@/lib/schedule'

interface Slot {
  id: string
  start_time: string
  end_time: string
}

interface Service {
  id: string
  name: string
  price: number
  dp_amount: number
  service_key?: string | null
  duration_min?: number
}

type TabKey = 'about' | 'service' | 'booking'
type BookingStage = 'select' | 'schedule'
type PeriodKey = 'pagi' | 'sore'

interface PriceListItem {
  key: string
  category: 'haircut' | 'colouring' | 'chemical'
  name: string
  price: number
  onlineBookable: boolean
  keywords: string[]
}

interface PriceListWithService extends PriceListItem {
  service: Service | null
}

const BARBER_NAME = "Kang Cukur Adam's"
const BARBER_ADDRESS = 'Pasar Jl. Taman Kenanga No.89, Sumber Taman, Kec. Wonoasih, Kota Probolinggo, Jawa Timur 67238'
const MAP_URL =
  'https://www.google.com/maps/place/KANG+CUKUR+ADAM\'S/@-7.7795283,113.229954,17z/data=!3m1!4b1!4m6!3m5!1s0x2dd7ad1a21d43c27:0xd8f20d6630565edc!8m2!3d-7.7795283!4d113.229954!16s%2Fg%2F11cn7ckx9w?entry=ttu&g_ep=EgoyMDI2MDQyMi4wIKXMDSoASAFQAw%3D%3D'

const PRICE_LIST: PriceListItem[] = [
  {
    key: 'haircut-basic',
    category: 'haircut',
    name: 'Cukur Dewasa & Anak-anak',
    price: 20000,
    onlineBookable: false,
    keywords: ['dewasa', 'anak'],
  },
  {
    key: 'haircut-wash-simple',
    category: 'haircut',
    name: 'Cukur + keramas + simple hair care',
    price: 25000,
    onlineBookable: true,
    keywords: ['keramas', 'simple hair care'],
  },
  {
    key: 'queue-booking',
    category: 'haircut',
    name: 'Booking Nomor Antrian Cukur',
    price: 25000,
    onlineBookable: true,
    keywords: ['booking nomor antrian', 'antrian cukur'],
  },
  {
    key: 'haircut-wash-shc',
    category: 'haircut',
    name: 'Booking cukur + keramas + SHC',
    price: 30000,
    onlineBookable: true,
    keywords: ['booking cukur', 'shc'],
  },
  {
    key: 'colour-black',
    category: 'colouring',
    name: 'Hitam',
    price: 15000,
    onlineBookable: true,
    keywords: ['hitam'],
  },
  {
    key: 'colour-highlight',
    category: 'colouring',
    name: 'Highlight',
    price: 80000,
    onlineBookable: true,
    keywords: ['highlight', 'hihglight'],
  },
  {
    key: 'colour-highlight-warna',
    category: 'colouring',
    name: 'Highlight + Warna',
    price: 100000,
    onlineBookable: true,
    keywords: ['warna', 'highlight warna', 'hightliht warna'],
  },
  {
    key: 'colour-fashion',
    category: 'colouring',
    name: 'Fashion colour',
    price: 200000,
    onlineBookable: true,
    keywords: ['fashion colour'],
  },
  {
    key: 'chemical-curly',
    category: 'chemical',
    name: 'Curly perm',
    price: 150000,
    onlineBookable: true,
    keywords: ['curly perm'],
  },
]

const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
const MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
]

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15 5L8 12L15 19" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function AboutIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8.4" r="2.2" fill="currentColor" />
      <path d="M7 18C7.8 14.8 9.6 13.3 12 13.3C14.4 13.3 16.2 14.8 17 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M3.5 13.5H6.2M17.8 13.5H20.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function ServiceIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 5L19 19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M5.5 8.8A2.3 2.3 0 1 0 5.5 4.2A2.3 2.3 0 0 0 5.5 8.8Z" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M18.5 19.8A2.3 2.3 0 1 0 18.5 15.2A2.3 2.3 0 0 0 18.5 19.8Z" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

function BookingIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="5.5" width="16" height="14.5" rx="2.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 3.8V7M16 3.8V7M4 10H20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 21C15.8 16.95 19 13.55 19 9.93C19 5.52 15.4 3 12 3S5 5.52 5 9.93C5 13.55 8.2 16.95 12 21Z" fill="currentColor" />
      <circle cx="12" cy="10" r="3.1" fill="#ffffff" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="9" r="3.3" fill="currentColor" />
      <path d="M5.6 19.2C6.5 15.9 8.7 14.3 12 14.3C15.3 14.3 17.5 15.9 18.4 19.2" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}

function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14.5 5L8 12L14.5 19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9.5 5L16 12L9.5 19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const SERVICE_IMAGES = [
  'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1635273051939-2f6f3f2de8b7?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=120&q=80',
]

function createMonthGrid(monthDate: Date) {
  const year = monthDate.getFullYear()
  const month = monthDate.getMonth()
  const firstDay = new Date(year, month, 1)
  const firstWeekday = firstDay.getDay()
  const startDate = new Date(year, month, 1 - firstWeekday)

  return Array.from({ length: 35 }, (_, index) => {
    const cellDate = new Date(startDate)
    cellDate.setDate(startDate.getDate() + index)
    return {
      date: cellDate,
      iso: cellDate.toISOString().slice(0, 10),
      inMonth: cellDate.getMonth() === month,
    }
  })
}

export default function BookingPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabKey>('about')
  const [bookingStage, setBookingStage] = useState<BookingStage>('select')
  const [services, setServices] = useState<Service[]>([])
  const [slots, setSlots] = useState<Slot[]>([])
  const [loadingServices, setLoadingServices] = useState(true)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [selectedServiceKeys, setSelectedServiceKeys] = useState<string[]>(['queue-booking'])
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodKey>('sore')
  const [selectedSlotId, setSelectedSlotId] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    const loadServices = async () => {
      setLoadingServices(true)
      try {
        const res = await fetch('/api/services')
        const data = await res.json()
        if (!mounted) return
        setServices(data.services || [])
      } catch {
        if (!mounted) return
        setServices([])
      }
      if (mounted) setLoadingServices(false)
    }

    loadServices()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    let mounted = true
    const loadSlots = async () => {
      setLoadingSlots(true)
      try {
        const res = await fetch(`/api/slots?date=${selectedDate}`)
        const data = await res.json()
        if (!mounted) return
        const nextSlots = data.slots || []
        setSlots(nextSlots)
      } catch {
        if (!mounted) return
        setSlots([])
      }
      if (mounted) setLoadingSlots(false)
    }

    if (bookingStage === 'schedule') {
      loadSlots()
    }

    return () => {
      mounted = false
    }
  }, [bookingStage, selectedDate])

  const servicesByPriceList: PriceListWithService[] = useMemo(() => {
    return PRICE_LIST.map((item) => {
      const matchedService = resolveServiceForPriceListItem(item, services as ServiceRecord[])

      return { ...item, service: matchedService }
    })
  }, [services])

  const groupedServices = useMemo(() => {
    return {
      haircut: servicesByPriceList.filter((item) => item.category === 'haircut'),
      colouring: servicesByPriceList.filter((item) => item.category === 'colouring'),
      chemical: servicesByPriceList.filter((item) => item.category === 'chemical'),
    }
  }, [servicesByPriceList])

  const selectedItems = useMemo(
    () => servicesByPriceList.filter((item) => selectedServiceKeys.includes(item.key)),
    [selectedServiceKeys, servicesByPriceList]
  )
  const selectedHaircutItem = selectedItems.find((item) => item.category === 'haircut') || null
  const selectedPriceItem = selectedHaircutItem || selectedItems[0] || null
  const selectedService = selectedPriceItem
    ? resolveServiceForPriceListItem(selectedPriceItem, services as ServiceRecord[])
    : null
  const totalSelectedPrice = selectedItems.reduce((sum, item) => sum + item.price, 0)

  const daySlotRanges = useMemo(() => getOpeningRangesForDate(selectedDate), [selectedDate])
  const isClosedDay = daySlotRanges.length === 0
  const availablePeriods = useMemo<PeriodKey[]>(() => {
    if (isClosedDay) return []
    const periods = new Set<PeriodKey>()
    daySlotRanges.forEach((range) => periods.add(getPeriodForTime(range.start)))
    return Array.from(periods)
  }, [daySlotRanges, isClosedDay])
  const effectiveSelectedPeriod: PeriodKey | null =
    availablePeriods.includes(selectedPeriod) ? selectedPeriod : availablePeriods[0] || null

  const periodSlots = useMemo(() => {
    if (!effectiveSelectedPeriod) return []
    return slots.filter((slot) => getPeriodForTime(slot.start_time) === effectiveSelectedPeriod)
  }, [effectiveSelectedPeriod, slots])

  const activeSelectedSlotId =
    selectedSlotId && periodSlots.some((slot) => slot.id === selectedSlotId)
      ? selectedSlotId
      : periodSlots[0]?.id || ''
  const selectedSlot = slots.find((slot) => slot.id === activeSelectedSlotId) || null
  const monthGrid = useMemo(() => createMonthGrid(selectedMonth), [selectedMonth])

  const validateIdentity = () => {
    if (customerName.trim().length < 2) {
      setError('Nama minimal 2 karakter')
      return false
    }
    if (!isValidIndonesianPhone(customerPhone)) {
      setError('Nomor telepon tidak valid')
      return false
    }
    setError('')
    return true
  }

  const handleTogglePrice = (serviceKey: string) => {
    const item = servicesByPriceList.find((entry) => entry.key === serviceKey)
    if (!item) return

    if (!item.onlineBookable) {
      setError('Layanan 20K hanya untuk datang langsung, tidak bisa booking online')
      return
    }
    setError('')

    setSelectedServiceKeys((current) =>
      current.includes(item.key) ? current.filter((key) => key !== item.key) : [...current, item.key]
    )
  }

  const handleContinueBooking = () => {
    if (!validateIdentity()) {
      setActiveTab('booking')
      return
    }

    if (selectedItems.length === 0) {
      setError('Pilih minimal satu pricelist booking')
      return
    }

    if (!selectedItems.some((item) => item.category === 'haircut')) {
      setError('Untuk booking cukur rambut, pilih salah satu layanan 25K atau 30K')
      return
    }

    if (!selectedService) {
      setError('Layanan utama booking belum tersedia di sistem')
      return
    }

    setError('')
    setBookingStage('schedule')
  }

  const handleBookingNow = async () => {
    if (!validateIdentity() || !selectedService || !selectedSlot) {
      if (!selectedSlot) setError('Pilih jam yang tersedia terlebih dahulu')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/booking/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slot_id: selectedSlot.id,
          service_id: selectedService.id,
          customer_name: customerName.trim(),
          customer_phone: normalizeIndonesianPhone(customerPhone.trim()),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Gagal membuat booking')
        setSubmitting(false)
        return
      }
      router.push(`/booking/${data.booking_code}`)
    } catch {
      setError('Terjadi kesalahan, coba beberapa saat lagi')
      setSubmitting(false)
    }
  }

  const renderPriceRow = (
    item: (PriceListItem & { service: Service | null }),
    idx: number,
    clickable = false
  ) => {
    const isActive = selectedServiceKeys.includes(item.key)
    const isDisabled = clickable && !item.onlineBookable

    return (
      <button
        key={item.key}
        type="button"
        className={`bookingv3-service-row ${clickable ? 'bookingv3-service-row-selectable' : ''} ${isActive ? 'bookingv3-service-row-active' : ''} ${
          isDisabled ? 'bookingv3-service-row-disabled' : ''
        }`}
        onClick={clickable && !isDisabled ? () => handleTogglePrice(item.key) : undefined}
        disabled={clickable ? isDisabled : false}
      >
        <span className="bookingv3-service-thumb">
          <img src={SERVICE_IMAGES[idx % SERVICE_IMAGES.length]} alt={item.name} />
        </span>
        <span className="bookingv3-service-copy">
          <span className="bookingv3-service-name">{item.name}</span>
          {clickable && !item.onlineBookable && <span className="bookingv3-service-note">Khusus datang langsung</span>}
        </span>
        <span className="bookingv3-service-price">{Math.round(item.price / 1000)}K</span>
      </button>
    )
  }

  return (
    <div className="bookingv3-page">
      <header className="bookingv3-header">
        <button
          type="button"
          className="bookingv3-back-btn"
          onClick={() => (activeTab === 'booking' && bookingStage === 'schedule' ? setBookingStage('select') : router.push('/'))}
        >
          <BackIcon />
        </button>
        <h1>{BARBER_NAME}</h1>
      </header>

      <section className="bookingv3-shop-card">
        <div className="bookingv3-hero-wrap">
          <img
            src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=1200&q=80"
            alt={BARBER_NAME}
            className="bookingv3-hero"
          />
          <button type="button" className="bookingv3-open-badge" onClick={() => window.open(MAP_URL, '_blank')}>
            Open
          </button>
        </div>
        <h2>{BARBER_NAME}</h2>
        <div className="bookingv3-address">
          <span className="bookingv3-address-icon">
            <PinIcon />
          </span>
          <p>{BARBER_ADDRESS}</p>
        </div>
      </section>

      <nav className="bookingv3-tabs">
        <button type="button" className={`bookingv3-tab ${activeTab === 'about' ? 'active' : ''}`} onClick={() => setActiveTab('about')}>
          <span className="bookingv3-tab-icon"><AboutIcon /></span>
          <span>About</span>
        </button>
        <button type="button" className={`bookingv3-tab ${activeTab === 'service' ? 'active' : ''}`} onClick={() => setActiveTab('service')}>
          <span className="bookingv3-tab-icon"><ServiceIcon /></span>
          <span>Service</span>
        </button>
        <button type="button" className={`bookingv3-tab ${activeTab === 'booking' ? 'active' : ''}`} onClick={() => setActiveTab('booking')}>
          <span className="bookingv3-tab-icon"><BookingIcon /></span>
          <span>Booking</span>
        </button>
      </nav>

      <main className="bookingv3-content">
        {loadingServices ? (
          <p className="bookingv3-loading">Memuat data barbershop...</p>
        ) : (
          <>
            {activeTab === 'about' && (
              <section>
                <h3>Opening Hours</h3>
                <div className="bookingv3-hours">
                  <div><span>Senin</span><span>09:00-12:00, 16:00-22:00</span></div>
                  <div><span>Selasa</span><span>09:00-12:00, 16:00-22:00</span></div>
                  <div><span>Rabu</span><span>09:00-12:00, 16:00-22:00</span></div>
                  <div><span>Kamis</span><span>09:00-12:00, 16:00-22:00</span></div>
                  <div><span>Jum&apos;at</span><span>Tutup</span></div>
                  <div><span>Sabtu</span><span>09:00-12:00, 16:00-22:00</span></div>
                  <div><span>Minggu</span><span>16:00-22:00</span></div>
                </div>
              </section>
            )}

            {activeTab === 'service' && (
              <section className="bookingv3-service-list">
                <h3>Cukur Rambut</h3>
                {groupedServices.haircut.map((item, idx) => renderPriceRow(item, idx))}

                <h3>Colouring Rambut</h3>
                {groupedServices.colouring.map((item, idx) => renderPriceRow(item, idx + 1))}

                <h3>Hair Chemical Service</h3>
                {groupedServices.chemical.map((item, idx) => renderPriceRow(item, idx + 2))}
              </section>
            )}

            {activeTab === 'booking' && bookingStage === 'select' && (
              <section>
                <h3>Isi identitas</h3>

                <div className="bookingv3-field">
                  <label>Nama</label>
                  <div className="bookingv3-input-wrap">
                    <span className="bookingv3-input-icon"><UserIcon /></span>
                    <input
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>
                </div>

                <div className="bookingv3-field">
                  <label>Nomor telepon</label>
                  <div className="bookingv3-phone-wrap">
                    <span className="bookingv3-country">+62</span>
                    <input
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="089-568-000-000"
                      inputMode="tel"
                    />
                  </div>
                </div>

                <h3>Pilih Booking</h3>
                <div className="bookingv3-service-list">
                  <h4 className="bookingv3-group-title">Cukur Rambut</h4>
                  {groupedServices.haircut.map((item, idx) => renderPriceRow(item, idx, true))}

                  <h4 className="bookingv3-group-title">Colouring Rambut</h4>
                  {groupedServices.colouring.map((item, idx) => renderPriceRow(item, idx + 1, true))}

                  <h4 className="bookingv3-group-title">Hair Chemical Service</h4>
                  {groupedServices.chemical.map((item, idx) => renderPriceRow(item, idx + 2, true))}
                </div>

                <p className="bookingv3-helper">
                  Untuk booking cukur rambut, pilih salah satu layanan 25K atau 30K. Layanan 20K hanya untuk datang langsung.
                </p>
                {selectedItems.length > 0 && (
                  <div className="bookingv3-selected-box">
                    <div className="bookingv3-selected-title">Pilihan booking</div>
                    {selectedItems.map((item) => (
                      <div key={item.key} className="bookingv3-selected-row">
                        <span>{item.name}</span>
                        <button type="button" onClick={() => handleTogglePrice(item.key)}>
                          Hapus
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {error && <p className="bookingv3-error">{error}</p>}
                <button type="button" className="bookingv3-submit" onClick={handleContinueBooking}>
                  Lanjut Booking
                </button>
              </section>
            )}

            {activeTab === 'booking' && bookingStage === 'schedule' && selectedPriceItem && (
              <section className="bookingv3-schedule">
                <button type="button" className="bookingv3-link-back" onClick={() => setBookingStage('select')}>
                  Ganti layanan
                </button>

                <h3>Pilih tanggal</h3>
                <div className="bookingv3-month-bar">
                  <button
                    type="button"
                    className="bookingv3-month-arrow"
                    onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1))}
                  >
                    <ChevronLeftIcon />
                  </button>
                  <span>{MONTH_NAMES[selectedMonth.getMonth()]} {selectedMonth.getFullYear()}</span>
                  <button
                    type="button"
                    className="bookingv3-month-arrow"
                    onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1))}
                  >
                    <ChevronRightIcon />
                  </button>
                </div>

                <div className="bookingv3-weekdays">
                  {DAY_NAMES.map((day) => (
                    <span key={day}>{day}</span>
                  ))}
                </div>

                <div className="bookingv3-calendar-grid">
                  {monthGrid.map((cell) => {
                    const isSelected = cell.iso === selectedDate
                    const isPast = cell.iso < new Date().toISOString().slice(0, 10)
                    return (
                      <button
                        key={cell.iso}
                        type="button"
                        className={`bookingv3-day-cell ${cell.inMonth ? '' : 'is-muted'} ${isSelected ? 'is-selected' : ''}`}
                        disabled={isPast}
                        onClick={() => setSelectedDate(cell.iso)}
                      >
                        {cell.date.getDate().toString().padStart(2, '0')}
                      </button>
                    )
                  })}
                </div>

                <h3>Waktu</h3>
                {isClosedDay ? (
                  <p className="bookingv3-helper">Barbershop tutup setiap Jumat.</p>
                ) : (
                  <>
                    <div className="bookingv3-periods">
                      {availablePeriods.includes('pagi') && (
                        <button
                          type="button"
                          className={`bookingv3-period-btn ${effectiveSelectedPeriod === 'pagi' ? 'active' : ''}`}
                          onClick={() => setSelectedPeriod('pagi')}
                        >
                          Pagi
                        </button>
                      )}
                      {availablePeriods.includes('sore') && (
                        <button
                          type="button"
                          className={`bookingv3-period-btn ${effectiveSelectedPeriod === 'sore' ? 'active' : ''}`}
                          onClick={() => setSelectedPeriod('sore')}
                        >
                          Sore
                        </button>
                      )}
                    </div>

                    <div className="bookingv3-available-title">Jam tersedia</div>
                    {loadingSlots ? (
                      <p className="bookingv3-loading">Memuat jam tersedia...</p>
                    ) : periodSlots.length === 0 ? (
                      <p className="bookingv3-helper">Belum ada slot tersedia untuk tanggal dan waktu ini.</p>
                    ) : (
                      <div className="bookingv3-slot-grid">
                        {periodSlots.map((slot) => (
                          <button
                            key={slot.id}
                            type="button"
                            className={`bookingv3-slot-btn ${activeSelectedSlotId === slot.id ? 'active' : ''}`}
                            onClick={() => setSelectedSlotId(slot.id)}
                          >
                            {slot.start_time.slice(0, 5)}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}

                <div className="bookingv3-payment-card">
                  <h3>Pembayaran</h3>
                  {selectedItems.map((item) => (
                    <div key={item.key} className="bookingv3-payment-row">
                      <span>{item.name}</span>
                      <span>{Math.round(item.price / 1000)}K</span>
                    </div>
                  ))}
                  <div className="bookingv3-payment-total">
                    <span>Total</span>
                    <span>{Math.round(totalSelectedPrice / 1000)}K</span>
                  </div>
                </div>

                {error && <p className="bookingv3-error">{error}</p>}
                <button type="button" className="bookingv3-submit" onClick={handleBookingNow} disabled={submitting || !selectedSlot}>
                  {submitting ? 'Memproses...' : 'Booking Now'}
                </button>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  )
}
