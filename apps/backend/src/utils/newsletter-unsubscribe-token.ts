import { createHmac, timingSafeEqual } from "node:crypto"
import { MedusaError } from "@medusajs/framework/utils"

const TOKEN_VERSION = "v1"

const getSecret = (secret?: string) => {
  const value =
    secret?.trim() ||
    process.env.NEWSLETTER_UNSUBSCRIBE_SECRET?.trim() ||
    process.env.COOKIE_SECRET?.trim() ||
    process.env.JWT_SECRET?.trim()

  if (!value) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      "Newsletter unsubscribe token secret is not configured."
    )
  }

  return value
}

const sign = (payload: string, secret?: string) =>
  createHmac("sha256", getSecret(secret)).update(payload).digest()

export const createNewsletterUnsubscribeToken = (
  subscriptionId: string,
  secret?: string
) => {
  const encodedId = Buffer.from(subscriptionId, "utf8").toString("base64url")
  const payload = `${TOKEN_VERSION}.${encodedId}`
  const signature = sign(payload, secret).toString("base64url")

  return `${payload}.${signature}`
}

export const verifyNewsletterUnsubscribeToken = (
  token: string,
  secret?: string
) => {
  const [version, encodedId, encodedSignature, ...extra] = token.split(".")

  if (
    version !== TOKEN_VERSION ||
    !encodedId ||
    !encodedSignature ||
    extra.length
  ) {
    return null
  }

  try {
    const payload = `${version}.${encodedId}`
    const expectedSignature = sign(payload, secret)
    const actualSignature = Buffer.from(encodedSignature, "base64url")

    if (
      actualSignature.length !== expectedSignature.length ||
      !timingSafeEqual(actualSignature, expectedSignature)
    ) {
      return null
    }

    const subscriptionId = Buffer.from(encodedId, "base64url").toString("utf8")

    if (
      !subscriptionId ||
      subscriptionId.length > 128 ||
      !/^[A-Za-z0-9_-]+$/.test(subscriptionId)
    ) {
      return null
    }

    return subscriptionId
  } catch {
    return null
  }
}
