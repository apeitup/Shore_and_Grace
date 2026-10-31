import {
  createNewsletterTrackingToken,
  verifyNewsletterTrackingToken,
} from "../newsletter-tracking-token"

describe("newsletter tracking tokens", () => {
  const secret = "a-test-secret-that-is-not-used-outside-this-suite"
  const basePayload = {
    campaignId: "newscamp_01TESTCAMPAIGN",
    subscriptionId: "newsl_01TESTSUBSCRIPTION",
  }

  it("round trips an open token", () => {
    const token = createNewsletterTrackingToken(
      { ...basePayload, action: "open" },
      secret,
    )

    expect(verifyNewsletterTrackingToken(token, secret)).toEqual({
      ...basePayload,
      action: "open",
    })
  })

  it("round trips an http click destination", () => {
    const payload = {
      ...basePayload,
      action: "click" as const,
      destination: "https://shoreandgrace.com/products/roses",
    }
    const token = createNewsletterTrackingToken(payload, secret)

    expect(verifyNewsletterTrackingToken(token, secret)).toEqual(payload)
  })

  it("rejects unsafe destinations and tampering", () => {
    const unsafe = createNewsletterTrackingToken(
      {
        ...basePayload,
        action: "click",
        destination: "javascript:alert(1)",
      },
      secret,
    )
    const valid = createNewsletterTrackingToken(
      { ...basePayload, action: "open" },
      secret,
    )

    expect(verifyNewsletterTrackingToken(unsafe, secret)).toBeNull()
    expect(
      verifyNewsletterTrackingToken(`${valid.slice(0, -1)}x`, secret),
    ).toBeNull()
  })
})
