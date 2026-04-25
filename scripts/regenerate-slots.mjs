import fs from 'fs'

function loadEnv(path) {
  const raw = fs.readFileSync(path, 'utf8')
  return raw
    .split(/\r?\n/)
    .filter(Boolean)
    .reduce((acc, line) => {
      if (line.startsWith('#')) return acc
      const idx = line.indexOf('=')
      if (idx > 0) acc[line.slice(0, idx)] = line.slice(idx + 1)
      return acc
    }, {})
}

function dayIndexFromDate(date) {
  return new Date(`${date}T00:00:00`).getDay()
}

function getRanges(date) {
  const day = dayIndexFromDate(date)
  if (day === 5) return []
  if (day === 0) return [{ start: '16:00:00', end: '22:00:00' }]
  return [
    { start: '09:00:00', end: '12:00:00' },
    { start: '16:00:00', end: '22:00:00' },
  ]
}

const env = loadEnv(new URL('../.env.local', import.meta.url))
const baseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const headers = {
  apikey: env.SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
}

function dateToISO(date) {
  return date.toISOString().slice(0, 10)
}

async function main() {
  const today = new Date()
  const dates = []
  for (let i = 0; i < 8; i += 1) {
    const d = new Date(today)
    d.setDate(d.getDate() + i)
    dates.push(dateToISO(d))
  }

  for (const date of dates) {
    const deleteUrl = `${baseUrl}/rest/v1/slots?date=eq.${date}&status=eq.open`
    const deleteResponse = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        apikey: headers.apikey,
        Authorization: headers.Authorization,
        Prefer: 'return=minimal',
      },
    })

    if (!deleteResponse.ok) {
      throw new Error(`delete ${date}: ${deleteResponse.status} ${await deleteResponse.text()}`)
    }

    const ranges = getRanges(date)
    if (ranges.length === 0) continue

    const rows = []
    for (const range of ranges) {
      const [startHour, startMin] = range.start.slice(0, 5).split(':').map(Number)
      const [endHour, endMin] = range.end.slice(0, 5).split(':').map(Number)
      let current = startHour * 60 + startMin
      const end = endHour * 60 + endMin

      while (current + 30 <= end) {
        const sH = String(Math.floor(current / 60)).padStart(2, '0')
        const sM = String(current % 60).padStart(2, '0')
        const next = current + 30
        const eH = String(Math.floor(next / 60)).padStart(2, '0')
        const eM = String(next % 60).padStart(2, '0')
        rows.push({
          date,
          start_time: `${sH}:${sM}:00`,
          end_time: `${eH}:${eM}:00`,
          status: 'open',
        })
        current += 30
      }
    }

    if (rows.length > 0) {
      const insertResponse = await fetch(`${baseUrl}/rest/v1/slots?on_conflict=date,start_time`, {
        method: 'POST',
        headers: {
          ...headers,
          Prefer: 'resolution=ignore-duplicates,return=minimal',
        },
        body: JSON.stringify(rows),
      })

      if (!insertResponse.ok) {
        throw new Error(`insert ${date}: ${insertResponse.status} ${await insertResponse.text()}`)
      }
    }
  }

  const selectResponse = await fetch(
    `${baseUrl}/rest/v1/slots?date=gte.${dateToISO(today)}&select=date,status,start_time&order=date.asc&order=start_time.asc`,
    {
      headers: {
        apikey: headers.apikey,
        Authorization: headers.Authorization,
      },
    }
  )

  if (!selectResponse.ok) {
    throw new Error(`final select: ${selectResponse.status} ${await selectResponse.text()}`)
  }

  console.log(JSON.stringify(await selectResponse.json(), null, 2))
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
