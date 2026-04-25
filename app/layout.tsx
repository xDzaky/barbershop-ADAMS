import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Plus_Jakarta_Sans } from 'next/font/google'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Barbershop Booking',
  description: 'Sistem booking barbershop online. Pesan jadwal cukur, bayar DP, dan datang tepat waktu.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#3e3b6e',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <head>
        <meta name="theme-color" content="#3e3b6e" />
      </head>
      <body className={plusJakartaSans.className}>{children}</body>
    </html>
  )
}
