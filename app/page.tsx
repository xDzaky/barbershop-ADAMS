'use client'

import { useRouter } from 'next/navigation'

const MAP_URL =
  'https://www.google.com/maps/place/KANG+CUKUR+ADAM\'S/@-7.7795283,113.229954,17z/data=!3m1!4b1!4m6!3m5!1s0x2dd7ad1a21d43c27:0xd8f20d6630565edc!8m2!3d-7.7795283!4d113.229954!16s%2Fg%2F11cn7ckx9w?entry=ttu&g_ep=EgoyMDI2MDQyMi4wIKXMDSoASAFQAw%3D%3D'
const MAP_EMBED_URL =
  'https://maps.google.com/maps?q=-7.7795283,113.229954(KANG%20CUKUR%20ADAM%27S)&z=16&output=embed&maptype=satellite'

function ScissorIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M5.5 7.5A2.5 2.5 0 1 0 5.5 12.5A2.5 2.5 0 0 0 5.5 7.5ZM5.5 11A1 1 0 1 1 5.5 9A1 1 0 0 1 5.5 11Z"
        fill="currentColor"
      />
      <path
        d="M5.5 15.5A2.5 2.5 0 1 0 5.5 20.5A2.5 2.5 0 0 0 5.5 15.5ZM5.5 19A1 1 0 1 1 5.5 17A1 1 0 0 1 5.5 19Z"
        fill="currentColor"
      />
      <path d="M20 5.2L11.1 13L20 20.8H17.7L9.95 14.1V9.9L17.7 3.2H20Z" fill="currentColor" />
      <path d="M9.9 11.9L8.75 13L17.7 20.8H20L9.9 11.9Z" fill="currentColor" />
    </svg>
  )
}

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 21C15.8 16.95 19 13.55 19 9.93C19 5.52 15.87 3 12 3S5 5.52 5 9.93C5 13.55 8.2 16.95 12 21Z"
        fill="currentColor"
      />
      <circle cx="12" cy="10" r="3.2" fill="#ffffff" />
    </svg>
  )
}

function MapIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 6.5L9.5 4L14.5 6L20 3.5V17.5L14.5 20L9.5 18L4 20.5V6.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M9.5 4V18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M14.5 6V20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12H19" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path
        d="M13 6L19 12L13 18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 3.2L14.72 8.71L20.8 9.6L16.4 13.88L17.44 19.9L12 17.04L6.56 19.9L7.6 13.88L3.2 9.6L9.28 8.71L12 3.2Z"
        fill="currentColor"
      />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="5.8" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M16 16L20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 10L12 4L20 10V20H4V10Z" fill="currentColor" />
      <path d="M9 20V13H15V20" fill="#ffffff" opacity="0.15" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="5.5" width="16" height="14.5" rx="2.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 3.8V7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M16 3.8V7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M4 10H20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export default function HomePage() {
  const router = useRouter()

  return (
    <div className="homev3">
      <header className="homev3-topbar">
        <div className="homev3-topbar-inner">
          <div className="homev3-brand">
            <div className="homev3-brand-row">
              <span className="homev3-brand-icon">
                <ScissorIcon />
              </span>
              <h1 className="homev3-brand-title">KANGCUKURADAM</h1>
            </div>
            <div className="homev3-brand-underline" aria-hidden="true" />
          </div>
        </div>
      </header>

      <main className="homev3-main">
        <section className="homev3-status-card" aria-label="Alamat Barbershop">
          <div className="homev3-status-pattern" aria-hidden="true" />
          <div className="homev3-status-inner">
            <div className="homev3-status-left">
              <span className="homev3-status-loc-icon">
                <LocationIcon />
              </span>
              <span className="homev3-status-text homev3-status-text-address">
                Pasar Jl. Taman Kenanga No.89, Sumber Taman, Kec. Wonoasih, Kota Probolinggo
              </span>
            </div>

            <button
              type="button"
              className="homev3-status-map-button"
              onClick={() => window.open(MAP_URL, '_blank')}
              aria-label="Buka map"
            >
              <MapIcon />
            </button>
          </div>
        </section>

        <section className="homev3-section">
          <h2 className="homev3-section-title">Booking Sekarang</h2>
          <article className="homev3-service-card">
            <div className="homev3-service-media">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCh94ZVmhkONrBynJZQpSoAI-2-6K3559T2IAfQi-_zotKO5U2ADrUHJgD8pBG7WEd4m549Yr-FJF8EYGg5pH29LqyPlJniJaWpXAIr8tT_jgjQ3HD590XFhm0tZThJ7UFjoTYyKTxS9KX88rhKO7SpAWkobHwAVkI2yVeZQqlIqa0W15DQXCci6TXGQHu1FqOXskxFtLvHV1nsX0HZuPuGUvRfikKLNx3aH0lv5GGIn4gRfS_4_9MN3r5p5cRVd0DheVoyQnhs6nA"
                alt="Barber at work"
                className="homev3-service-image"
              />
              <button type="button" className="homev3-book-button" onClick={() => router.push('/booking')}>
                <span>Booking</span>
                <span className="homev3-book-button-icon">
                  <ArrowIcon />
                </span>
              </button>
            </div>

            <div className="homev3-service-body">
              <h3 className="homev3-service-title">Booking Cukur Rambut Profesional Tanpa Antre</h3>
              <div className="homev3-service-meta">
                <div className="homev3-service-location">
                  <span className="homev3-service-location-icon">
                    <LocationIcon />
                  </span>
                  <span>Kang Cukur Adam’s</span>
                </div>

                <div className="homev3-service-rating">
                  <span className="homev3-service-star">
                    <StarIcon />
                  </span>
                  <span>5.0</span>
                </div>
              </div>
            </div>
          </article>
        </section>

        <section className="homev3-section">
          <h2 className="homev3-section-title">Lokasi Barbershop</h2>
          <article className="homev3-map-card">
            <iframe
              className="homev3-map-iframe"
              src={MAP_EMBED_URL}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Lokasi Kang Cukur Adam"
            />

            <button type="button" className="homev3-find-button" onClick={() => window.open(MAP_URL, '_blank')}>
              <span className="homev3-find-button-icon">
                <SearchIcon />
              </span>
              <span>Find now</span>
            </button>
          </article>
        </section>
      </main>

      <nav className="homev3-bottom-nav" aria-label="Bottom navigation">
        <button className="homev3-nav-item homev3-nav-item-active" type="button">
          <span className="homev3-nav-icon">
            <HomeIcon />
          </span>
          <span>Beranda</span>
        </button>
        <button className="homev3-nav-item" type="button" onClick={() => router.push('/booking')}>
          <span className="homev3-nav-icon">
            <CalendarIcon />
          </span>
          <span>Booking</span>
        </button>
      </nav>
    </div>
  )
}
