import {
  buildAvailableDates,
  matchesPostcode,
  normalizePostcode,
} from "../florist-delivery"

describe("florist delivery rules", () => {
  it("normalizes and matches outward postcode prefixes", () => {
    expect(normalizePostcode(" co14 8ls ")).toBe("CO148LS")
    expect(matchesPostcode("CO14 8LS", { values: ["CO14", "IP*"] })).toBe(true)
    expect(matchesPostcode("CO14 8LS", { values: ["CO1"] })).toBe(false)
    expect(matchesPostcode("CM2 1AA", { values: ["CO1", "IP*"] })).toBe(false)
  })

  it("excludes blocked and capacity-full dates", () => {
    const dates = buildAvailableDates({
      zone: {
        id: "zone_local",
        name: "Local delivery",
        fulfillment_type: "delivery",
        postcode_patterns: { values: ["CO"] },
        currency_code: "gbp",
        fee: 10,
        minimum_lead_days: 1,
        daily_capacity: 2,
        allowed_weekdays: { values: [1, 2, 3, 4, 5, 6] },
      },
      blockedDates: new Set(["2026-10-28"]),
      reservationCounts: new Map([["2026-10-29", 2]]),
      now: new Date("2026-10-27T09:00:00.000Z"),
      days: 2,
    })

    expect(dates.map((item) => item.date)).toEqual([
      "2026-10-30",
      "2026-10-31",
    ])
  })

  it("moves same-day ordering past the configured cut-off", () => {
    const dates = buildAvailableDates({
      zone: {
        id: "zone_local",
        name: "Local delivery",
        fulfillment_type: "delivery",
        postcode_patterns: { values: ["CO"] },
        currency_code: "gbp",
        fee: 10,
        minimum_lead_days: 0,
        same_day_cutoff: "12:00",
        daily_capacity: 10,
        allowed_weekdays: { values: [0, 1, 2, 3, 4, 5, 6] },
      },
      blockedDates: new Set(),
      reservationCounts: new Map(),
      now: new Date("2026-10-27T13:00:00.000Z"),
      days: 1,
    })

    expect(dates[0].date).toBe("2026-10-28")
  })
})
