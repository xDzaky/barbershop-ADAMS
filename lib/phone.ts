export function normalizeIndonesianPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')

  if (!digits) {
    return ''
  }

  if (digits.startsWith('62')) {
    return digits
  }

  if (digits.startsWith('0')) {
    return `62${digits.slice(1)}`
  }

  return `62${digits}`
}

export function isValidIndonesianPhone(phone: string): boolean {
  const normalized = normalizeIndonesianPhone(phone)

  // Allow common mobile prefixes after normalization.
  return /^62\d{8,12}$/.test(normalized)
}
