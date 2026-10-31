import type {
  MedusaNextFunction,
  MedusaRequest,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"

const WINDOW_MS = 15 * 60 * 1000
const MAX_REQUESTS = 5
const attempts = new Map<string, number[]>()

export const passwordResetRateLimit = (
  req: MedusaRequest,
  _res: unknown,
  next: MedusaNextFunction,
) => {
  const forwarded = req.headers["x-forwarded-for"]
  const forwardedClient = Array.isArray(forwarded)
    ? forwarded[0]
    : forwarded?.split(",")[0]?.trim()
  const client = req.ip || forwardedClient || "unknown"
  const now = Date.now()
  const recent = (attempts.get(client) || []).filter(
    (timestamp) => timestamp > now - WINDOW_MS,
  )

  if (recent.length >= MAX_REQUESTS) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Please wait before requesting another password-change email.",
    )
  }

  recent.push(now)
  attempts.set(client, recent)

  if (attempts.size > 5000) {
    for (const [key, timestamps] of attempts) {
      if (!timestamps.some((timestamp) => timestamp > now - WINDOW_MS)) {
        attempts.delete(key)
      }
    }
  }

  next()
}
