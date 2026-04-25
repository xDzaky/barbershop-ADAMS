export type TimeRange = { start: string; end: string }

function dayIndexFromDate(date: string): number {
  return new Date(`${date}T00:00:00`).getDay()
}

function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`
}

function buildRange(start: number, end: number, step = 30): TimeRange[] {
  const ranges: TimeRange[] = []
  for (let current = start; current + step <= end; current += step) {
    ranges.push({
      start: minutesToTime(current),
      end: minutesToTime(current + step),
    })
  }
  return ranges
}

export function getOpeningRangesForDate(date: string): TimeRange[] {
  const day = dayIndexFromDate(date)

  if (day === 5) {
    return []
  }

  if (day === 0) {
    return buildRange(16 * 60, 22 * 60)
  }

  return [
    ...buildRange(9 * 60, 12 * 60),
    ...buildRange(16 * 60, 22 * 60),
  ]
}

export function getPeriodForTime(startTime: string): 'pagi' | 'sore' {
  const hour = Number(startTime.slice(0, 2))
  return hour < 12 ? 'pagi' : 'sore'
}

export function isSlotAllowedForDate(date: string, startTime: string): boolean {
  const allowed = getOpeningRangesForDate(date)
  return allowed.some((range) => range.start.slice(0, 5) === startTime.slice(0, 5))
}
