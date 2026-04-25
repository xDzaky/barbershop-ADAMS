import { isValidIndonesianPhone } from './phone'

export interface BookingFormData {
  customer_name: string
  customer_phone: string
  slot_id: string
  service_id: string
}

export interface ValidationError {
  field: string
  message: string
}

export function validateBookingForm(data: BookingFormData): ValidationError[] {
  const errors: ValidationError[] = []

  // customer_name: wajib, 2–50 karakter
  if (!data.customer_name || data.customer_name.trim().length < 2) {
    errors.push({ field: 'customer_name', message: 'Nama minimal 2 karakter' })
  }
  if (data.customer_name && data.customer_name.trim().length > 50) {
    errors.push({ field: 'customer_name', message: 'Nama maksimal 50 karakter' })
  }

  // customer_phone: wajib, terima 08xx, 8xx, 62xx, atau +62xx
  if (!data.customer_phone) {
    errors.push({ field: 'customer_phone', message: 'Nomor HP wajib diisi' })
  } else if (!isValidIndonesianPhone(data.customer_phone)) {
    errors.push({ field: 'customer_phone', message: 'Format nomor HP tidak valid (contoh: 08123456789 atau 8123456789)' })
  }

  // slot_id: wajib, UUID valid
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!data.slot_id || !uuidRegex.test(data.slot_id)) {
    errors.push({ field: 'slot_id', message: 'Slot tidak valid' })
  }

  // service_id: wajib, UUID valid
  if (!data.service_id || !uuidRegex.test(data.service_id)) {
    errors.push({ field: 'service_id', message: 'Layanan tidak valid' })
  }

  return errors
}
