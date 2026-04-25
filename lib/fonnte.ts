import { normalizeIndonesianPhone } from './phone'

interface SendWhatsAppParams {
  phone: string
  message: string
}

export async function sendWhatsApp({ phone, message }: SendWhatsAppParams) {
  const token = process.env.FONNTE_TOKEN

  if (!token) {
    console.warn('[Fonnte] No FONNTE_TOKEN configured, skipping WhatsApp notification')
    return null
  }

  // Normalize phone number to Indonesian format
  const normalizedPhone = normalizeIndonesianPhone(phone)

  try {
    const response = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        target: normalizedPhone,
        message,
      }),
    })

    const data = await response.json()
    console.log('[Fonnte] Response:', data)
    return data
  } catch (error) {
    console.error('[Fonnte] Error sending WhatsApp:', error)
    return null
  }
}

interface BookingData {
  customer_name: string
  booking_code: string
  services: { name: string; price: number }
  slots: { date: string; start_time: string }
  dp_amount: number
}

export function formatBookingConfirmation(booking: BookingData): string {
  const date = new Date(booking.slots.date)
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

  const dayName = days[date.getDay()]
  const dateStr = `${dayName}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
  const sisaBayar = booking.services.price - booking.dp_amount

  return `Halo ${booking.customer_name}! 👋

Booking kamu berhasil dikonfirmasi ✅

📋 Kode Booking : ${booking.booking_code}
💇 Layanan       : ${booking.services.name}
📅 Tanggal       : ${dateStr}
🕐 Jam           : ${booking.slots.start_time.slice(0, 5)}
💰 DP Dibayar    : Rp ${booking.dp_amount.toLocaleString('id-ID')}
💳 Sisa Bayar    : Rp ${sisaBayar.toLocaleString('id-ID')} (bayar di tempat)

Harap datang tepat waktu.
Toleransi keterlambatan: 10 menit.

Sampai jumpa! ✂️`
}

export function formatReminder(booking: BookingData): string {
  return `Reminder ⏰

Booking kamu ${booking.booking_code}
akan dimulai dalam 1 jam lagi!

🕐 Jam  : ${booking.slots.start_time.slice(0, 5)}

Jangan sampai telat ya! 😊`
}
