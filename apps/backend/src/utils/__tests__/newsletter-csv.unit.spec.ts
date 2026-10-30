import { createNewsletterCsv } from "../newsletter-csv"

describe("createNewsletterCsv", () => {
  it("exports newsletter consent and lifecycle evidence", () => {
    const csv = createNewsletterCsv([
      {
        email: "amanda@example.com",
        status: "subscribed",
        consent_source: "storefront_footer",
        consented_at: "2026-10-30T09:00:00.000Z",
        confirmed_at: "2026-10-30T09:05:00.000Z",
        unsubscribed_at: null,
        created_at: "2026-10-30T09:00:00.000Z",
      },
    ])

    expect(csv).toContain('"amanda@example.com","subscribed"')
    expect(csv).toContain('"storefront_footer"')
    expect(csv).toContain('"2026-10-30T09:05:00.000Z"')
  })

  it("escapes quotes, commas, and spreadsheet formula prefixes", () => {
    const csv = createNewsletterCsv([
      {
        email: "=cmd@example.com",
        status: "pending",
        consent_source: 'footer, "mobile"',
        created_at: "2026-10-30T09:00:00.000Z",
      },
    ])

    expect(csv).toContain('"\'=cmd@example.com"')
    expect(csv).toContain('"footer, ""mobile"""')
  })
})
