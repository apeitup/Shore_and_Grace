import { randomBytes } from "crypto"

export const addCalendarMonth = (value: Date) => {
  const result = new Date(value)
  const originalDay = result.getUTCDate()
  result.setUTCDate(1)
  result.setUTCMonth(result.getUTCMonth() + 1)
  const lastDayOfTargetMonth = new Date(
    Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0)
  ).getUTCDate()
  result.setUTCDate(Math.min(originalDay, lastDayOfTargetMonth))
  return result
}

export const createPrivacyRequestReference = (now = new Date()) => {
  const date = now.toISOString().slice(0, 10).replaceAll("-", "")
  return `SG-PR-${date}-${randomBytes(4).toString("hex").toUpperCase()}`
}
