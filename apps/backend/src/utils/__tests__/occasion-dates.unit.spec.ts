import { resolveNextOccasionDate } from "../occasion-dates"

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
