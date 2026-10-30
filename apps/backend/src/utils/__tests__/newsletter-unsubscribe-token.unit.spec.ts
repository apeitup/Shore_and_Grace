import {
  createNewsletterUnsubscribeToken,
  verifyNewsletterUnsubscribeToken,
} from "../newsletter-unsubscribe-token"

describe("newsletter unsubscribe tokens", () => {
  const secret = "a-test-secret-that-is-not-used-outside-this-suite"
  const subscriptionId = "newsl_01TESTSUBSCRIPTION"

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

  it.each(["", "v1", "v2.payload.signature", "v1.payload.signature.extra"])(
    "rejects malformed token %p",
    (token) => {
      expect(verifyNewsletterUnsubscribeToken(token, secret)).toBeNull()
    }
  )
})
