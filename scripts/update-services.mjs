import fs from 'fs'
import { createClient } from '@supabase/supabase-js'

function loadEnv(path) {
  const raw = fs.readFileSync(path, 'utf8')
  return raw
    .split(/\r?\n/)
    .filter(Boolean)
    .reduce((acc, line) => {
      if (line.startsWith('#')) return acc
      const idx = line.indexOf('=')
      if (idx > 0) {
        acc[line.slice(0, idx)] = line.slice(idx + 1)
      }
      return acc
    }, {})
}

const env = loadEnv(new URL('../.env.local', import.meta.url))
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

const updates = [
  ['0bbe2f54-4398-4075-bc4a-c46c9a5bb86a', { name: 'Cukur Dewasa & Anak-anak', price: 20000, dp_amount: 10000, duration_min: 30, is_active: true }],
  ['07a78aaa-e0c2-4335-bf04-d5e33048676b', { name: 'Cukur + keramas + simple hair care', price: 25000, dp_amount: 12500, duration_min: 45, is_active: true }],
  ['34c03904-c60e-42f4-9011-a154b1e4ac1e', { name: 'Booking cukur + keramas + SHC', price: 30000, dp_amount: 15000, duration_min: 60, is_active: true }],
  ['dab78c77-4dd5-4f48-83d0-a8034a18aa16', { is_active: false }],
  ['91318905-d1dd-4764-9d09-9f1fff300c93', { is_active: false }],
  ['23c2194b-f9ee-4a56-b62a-0307a03a424c', { is_active: false }],
]

const canonical = [
  { name: 'Cukur Dewasa & Anak-anak', price: 20000, dp_amount: 10000, duration_min: 30, is_active: true },
  { name: 'Cukur + keramas + simple hair care', price: 25000, dp_amount: 12500, duration_min: 45, is_active: true },
  { name: 'Booking Nomor Antrian Cukur', price: 25000, dp_amount: 12500, duration_min: 30, is_active: true },
  { name: 'Booking cukur + keramas + SHC', price: 30000, dp_amount: 15000, duration_min: 60, is_active: true },
  { name: 'Hitam', price: 15000, dp_amount: 7500, duration_min: 45, is_active: true },
  { name: 'Highlight', price: 80000, dp_amount: 40000, duration_min: 90, is_active: true },
  { name: 'Highlight + Warna', price: 100000, dp_amount: 50000, duration_min: 120, is_active: true },
  { name: 'Fashion colour', price: 200000, dp_amount: 100000, duration_min: 120, is_active: true },
  { name: 'Curly perm', price: 150000, dp_amount: 75000, duration_min: 120, is_active: true },
]

async function main() {
  for (const [id, payload] of updates) {
    const { error } = await supabase.from('services').update(payload).eq('id', id)
    if (error) throw new Error(`update ${id}: ${error.message}`)
  }

  const { data: existing, error: selectError } = await supabase
    .from('services')
    .select('name')
    .in('name', canonical.map((item) => item.name))

  if (selectError) throw new Error(`select: ${selectError.message}`)

  const existingNames = new Set((existing || []).map((row) => row.name))
  const missing = canonical.filter((item) => !existingNames.has(item.name))

  if (missing.length > 0) {
    const { error: insertError } = await supabase.from('services').insert(missing)
    if (insertError) throw new Error(`insert: ${insertError.message}`)
  }

  const { data: finalData, error: finalError } = await supabase
    .from('services')
    .select('name, price, dp_amount, duration_min, is_active')
    .order('name')

  if (finalError) throw new Error(`final select: ${finalError.message}`)

  console.log(JSON.stringify(finalData, null, 2))
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
