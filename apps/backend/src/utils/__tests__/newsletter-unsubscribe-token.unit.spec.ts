import {
  createCampaignNewsletterUnsubscribeToken,
  createNewsletterUnsubscribeToken,
  verifyCampaignNewsletterUnsubscribeToken,
  verifyNewsletterUnsubscribeToken,
} from "../newsletter-unsubscribe-token"

describe("newsletter unsubscribe tokens", () => {
  const secret = "a-test-secret-that-is-not-used-outside-this-suite"
  const subscriptionId = "newsl_01TESTSUBSCRIPTION"
  const campaignId = "newscamp_01TESTCAMPAIGN"

  it("round trips a subscription id", () => {
    const token = createNewsletterUnsubscribeToken(subscriptionId, secret)

    expect(verifyNewsletterUnsubscribeToken(token, secret)).toBe(
      subscriptionId
    )
  })

  it("rejects a tampered payload", () => {
    const token = createNewsletterUnsubscribeToken(subscriptionId, secret)
    const [, , signature] = token.split(".")
    const tamperedId = Buffer.from("newsl_01OTHER", "utf8").toString(
      "base64url"
    )

    expect(
      verifyNewsletterUnsubscribeToken(`v1.${tamperedId}.${signature}`, secret)
    ).toBeNull()
  })

  it("rejects a token signed with another secret", () => {
    const token = createNewsletterUnsubscribeToken(subscriptionId, secret)

    expect(
      verifyNewsletterUnsubscribeToken(token, "another-secret")
    ).toBeNull()
  })

  it("round trips campaign attribution without breaking legacy tokens", () => {
    const token = createCampaignNewsletterUnsubscribeToken(
      subscriptionId,
      campaignId,
      secret,
    )

    expect(verifyCampaignNewsletterUnsubscribeToken(token, secret)).toEqual({
      subscriptionId,
      campaignId,
    })
    expect(verifyNewsletterUnsubscribeToken(token, secret)).toBeNull()
  })

  it.each(["", "v1", "v2.payload.signature", "v1.payload.signature.extra"])(
    "rejects malformed token %p",
    (token) => {
      expect(verifyNewsletterUnsubscribeToken(token, secret)).toBeNull()
    }
  )
})
