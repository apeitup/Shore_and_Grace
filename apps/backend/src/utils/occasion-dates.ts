type OccasionDateInput = {
  date_type: "fixed" | "easter" | "mothering_sunday" | "fathers_day"
  month?: number | null
  day?: number | null
}

const easterSunday = (year: number) => {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(Date.UTC(year, month - 1, day))
}

const occurrenceForYear = (occasion: OccasionDateInput, year: number) => {
  if (occasion.date_type === "easter") {
    return easterSunday(year)
  }
  if (occasion.date_type === "mothering_sunday") {
    const date = easterSunday(year)
    date.setUTCDate(date.getUTCDate() - 21)
    return date
  }
  if (occasion.date_type === "fathers_day") {
    const firstJune = new Date(Date.UTC(year, 5, 1))
    const firstSunday = 1 + ((7 - firstJune.getUTCDay()) % 7)
    return new Date(Date.UTC(year, 5, firstSunday + 14))
  }
  return new Date(
    Date.UTC(year, (occasion.month ?? 1) - 1, occasion.day ?? 1)
  )
}

export const resolveNextOccasionDate = (
  occasion: OccasionDateInput,
  from = new Date()
) => {
  const today = new Date(
    Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate())
  )
  let occurrence = occurrenceForYear(occasion, today.getUTCFullYear())
  if (occurrence < today) {
    occurrence = occurrenceForYear(occasion, today.getUTCFullYear() + 1)
  }
  return occurrence.toISOString().slice(0, 10)
}
