import {
  isOccasionReminderDue,
  resolveNextOccasionDate,
  resolveNextPersonalOccasionDate,
} from "../occasion-dates"

describe("resolveNextOccasionDate", () => {
  const from = new Date("2027-01-01T00:00:00Z")

  it("resolves a fixed annual date", () => {
    expect(
      resolveNextOccasionDate(
        { date_type: "fixed", month: 2, day: 14 },
        from
      )
    ).toBe("2027-02-14")
  })

  it("calculates Easter Sunday", () => {
    expect(resolveNextOccasionDate({ date_type: "easter" }, from)).toBe(
      "2027-03-28"
    )
  })

  it("calculates UK Mothering Sunday", () => {
    expect(
      resolveNextOccasionDate({ date_type: "mothering_sunday" }, from)
    ).toBe("2027-03-07")
  })

  it("calculates the third Sunday in June", () => {
    expect(resolveNextOccasionDate({ date_type: "fathers_day" }, from)).toBe(
      "2027-06-20"
    )
  })
})

describe("personal occasion reminders", () => {
  it("rolls an annual personal date into the next year", () => {
    expect(
      resolveNextPersonalOccasionDate(
        "2026-07-14",
        true,
        new Date("2026-10-29T09:00:00Z")
      )
    ).toBe("2027-07-14")
  })

  it("keeps a one-off date fixed", () => {
    expect(
      resolveNextPersonalOccasionDate(
        "2026-07-14",
        false,
        new Date("2026-10-29T09:00:00Z")
      )
    ).toBe("2026-07-14")
  })

  it("matches the configured reminder day", () => {
    expect(
      isOccasionReminderDue(
        "2026-12-25",
        21,
        new Date("2026-12-04T08:00:00Z")
      )
    ).toBe(true)
    expect(
      isOccasionReminderDue(
        "2026-12-25",
        21,
        new Date("2026-12-05T08:00:00Z")
      )
    ).toBe(false)
  })
})
