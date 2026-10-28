import { addCalendarMonth } from "../privacy-request"

describe("addCalendarMonth", () => {
  it("keeps the same day when the next month contains it", () => {
    expect(addCalendarMonth(new Date("2026-10-15T12:00:00.000Z"))).toEqual(
      new Date("2026-11-15T12:00:00.000Z")
    )
  })

  it("uses the final day when the next month is shorter", () => {
    expect(addCalendarMonth(new Date("2027-01-31T12:00:00.000Z"))).toEqual(
      new Date("2027-02-28T12:00:00.000Z")
    )
  })

  it("handles leap years", () => {
    expect(addCalendarMonth(new Date("2028-01-31T12:00:00.000Z"))).toEqual(
      new Date("2028-02-29T12:00:00.000Z")
    )
  })
})
