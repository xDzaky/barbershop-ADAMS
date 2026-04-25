export interface ServiceRecord {
  id: string
  name: string
  price: number
  dp_amount: number
  duration_min?: number
  service_key?: string | null
}

export interface PriceListEntry {
  key: string
  name: string
  price: number
  keywords: string[]
}

const SERVICE_KEY_ALIASES: Record<string, string[]> = {
  'haircut-basic': ['dewasa', 'anak', 'basic', 'potong rambut'],
  'haircut-wash-simple': ['keramas', 'cuci', 'simple hair care', 'wash'],
  'queue-booking': ['antrian', 'booking', 'nomor'],
  'haircut-wash-shc': ['shc', 'hair care', 'keramas'],
  'colour-black': ['hitam'],
  'colour-highlight': ['highlight'],
  'colour-highlight-warna': ['highlight warna', 'warna'],
  'colour-fashion': ['fashion colour', 'fashion'],
  'chemical-curly': ['curly', 'perm'],
}

export function normalizeServiceKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

export function resolveServiceForPriceListItem(
  item: PriceListEntry,
  services: ServiceRecord[]
): ServiceRecord | null {
  const normalizedItemName = normalizeText(item.name)
  const aliasTerms = SERVICE_KEY_ALIASES[item.key] || []

  const scored = services
    .map((service) => {
      const serviceKey = service.service_key ? normalizeServiceKey(service.service_key) : ''
      const normalizedName = normalizeText(service.name)
      let score = 0

      if (serviceKey === normalizeServiceKey(item.key)) {
        score += 100
      }

      if (aliasTerms.some((term) => normalizedName.includes(normalizeText(term)))) {
        score += 60
      }

      if (item.keywords.some((keyword) => normalizedName.includes(normalizeText(keyword)))) {
        score += 40
      }

      if (normalizedName.includes(normalizedItemName) || normalizedItemName.includes(normalizedName)) {
        score += 30
      }

      if (service.price === item.price) {
        score += 10
      }

      return { service, score }
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)

  return scored[0]?.service ?? null
}
