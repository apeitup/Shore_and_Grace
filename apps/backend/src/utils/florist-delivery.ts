export type DeliveryZoneConfig = {
  id: string
  name: string
  fulfillment_type: "delivery" | "collection"
  postcode_patterns: unknown
  shipping_option_id?: string | null
  currency_code: string
  fee: number
  minimum_lead_days: number
  same_day_cutoff?: string | null
  daily_capacity: number
  allowed_weekdays: unknown
  delivery_window?: string | null
}

export const normalizePostcode = (postcode: string) =>
  postcode.toUpperCase().replace(/\s+/g, "").trim()

const jsonValues = (value: unknown): unknown[] => {
  if (Array.isArray(value)) {
    return value
  }
  if (
    value &&
    typeof value === "object" &&
    "values" in value &&
    Array.isArray((value as { values: unknown[] }).values)
  ) {
    return (value as { values: unknown[] }).values
  }
  return []
}

export const matchesPostcode = (postcode: string, patterns: unknown) => {
  const values = jsonValues(patterns)
  if (!values.length) {
    return false
  }

  const normalized = normalizePostcode(postcode)
  const outwardCode = normalized.match(/^[A-Z]{1,2}\d[A-Z\d]?/)?.[0] || normalized

  return values.some((pattern) => {
    const rawCandidate = normalizePostcode(String(pattern))
    const isWildcard = rawCandidate.endsWith("*")
    const candidate = rawCandidate.replace(/\*$/, "")
    return (
      candidate.length > 0 &&
      (isWildcard
        ? normalized.startsWith(candidate)
        : outwardCode === candidate || normalized === candidate)
    )
  })
}

export const dateKey = (date: Date) => date.toISOString().slice(0, 10)

export const buildAvailableDates = ({
  zone,
  blockedDates,
  reservationCounts,
  now = new Date(),
  days = 21,
}: {
  zone: DeliveryZoneConfig
  blockedDates: Set<string>
  reservationCounts: Map<string, number>
  now?: Date
  days?: number
}) => {
  const weekdays = jsonValues(zone.allowed_weekdays).map(Number)
  const firstDate = new Date(now)
  firstDate.setHours(12, 0, 0, 0)
  firstDate.setDate(firstDate.getDate() + Math.max(0, zone.minimum_lead_days))

  if (zone.minimum_lead_days === 0 && zone.same_day_cutoff) {
    const [hours, minutes] = zone.same_day_cutoff.split(":").map(Number)
    const cutoff = new Date(now)
    cutoff.setHours(hours || 0, minutes || 0, 0, 0)
    if (now >= cutoff) {
      firstDate.setDate(firstDate.getDate() + 1)
    }
  }

  const results: Array<{ date: string; remaining_capacity: number }> = []
  const cursor = new Date(firstDate)

  for (let offset = 0; offset < days * 2 && results.length < days; offset++) {
    const key = dateKey(cursor)
    const used = reservationCounts.get(key) ?? 0
    const remaining = Math.max(0, zone.daily_capacity - used)

    if (
      weekdays.includes(cursor.getDay()) &&
      !blockedDates.has(key) &&
      remaining > 0
    ) {
      results.push({ date: key, remaining_capacity: remaining })
    }

    cursor.setDate(cursor.getDate() + 1)
  }

  return results
}
