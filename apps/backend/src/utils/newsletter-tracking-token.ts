import { createHmac, timingSafeEqual } from "node:crypto"
import { MedusaError } from "@medusajs/framework/utils"

const TOKEN_VERSION = "v1"

export type NewsletterTrackingAction = "open" | "click"

export type NewsletterTrackingPayload = {
  action: NewsletterTrackingAction
  campaignId: string
  subscriptionId: string
  destination?: string
}

const getSecret = (secret?: string) => {
  const value =
    secret?.trim() ||
    process.env.NEWSLETTER_TRACKING_SECRET?.trim() ||
    process.env.NEWSLETTER_UNSUBSCRIBE_SECRET?.trim() ||
    process.env.COOKIE_SECRET?.trim() ||
    process.env.JWT_SECRET?.trim()

  if (!value) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      "Newsletter tracking token secret is not configured.",
    )
  }

  return value
}

const encode = (value: string) => Buffer.from(value, "utf8").toString("base64url")

export const createNewsletterTrackingToken = (
  payload: NewsletterTrackingPayload,
  secret?: string,
) => {
  const encodedPayload = encode(JSON.stringify(payload))
  const unsigned = `${TOKEN_VERSION}.${encodedPayload}`
  const signature = createHmac("sha256", getSecret(secret))
    .update(unsigned)
    .digest("base64url")

  return `${unsigned}.${signature}`
}

export const verifyNewsletterTrackingToken = (
  token: string,
  secret?: string,
) => {
  const [version, encodedPayload, encodedSignature, ...extra] = token.split(".")

  if (
    version !== TOKEN_VERSION ||
    !encodedPayload ||
    !encodedSignature ||
    extra.length
  ) {
    return null
  }

  try {
    const unsigned = `${version}.${encodedPayload}`
    const expected = createHmac("sha256", getSecret(secret))
      .update(unsigned)
      .digest()
    const actual = Buffer.from(encodedSignature, "base64url")

    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
      return null
    }

    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as NewsletterTrackingPayload
    const validId = (value: unknown) =>
      typeof value === "string" &&
      value.length > 0 &&
      value.length <= 128 &&
      /^[A-Za-z0-9_-]+$/.test(value)

    if (
      !["open", "click"].includes(payload.action) ||
      !validId(payload.campaignId) ||
      !validId(payload.subscriptionId)
    ) {
      return null
    }

    if (payload.action === "click") {
      if (!payload.destination || payload.destination.length > 2048) {
        return null
      }

      const destination = new URL(payload.destination)
      if (!["http:", "https:"].includes(destination.protocol)) {
        return null
      }
    }

    return payload
  } catch {
    return null
  }
}
