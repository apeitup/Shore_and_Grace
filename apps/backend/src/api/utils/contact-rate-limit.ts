import type {
  MedusaNextFunction,
  MedusaRequest,
} from "@medusajs/framework/http";
import { MedusaError } from "@medusajs/framework/utils";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 5;
const attempts = new Map<string, number[]>();

export const contactRateLimit = (
  req: MedusaRequest,
  _res: unknown,
  next: MedusaNextFunction,
) => {
  const forwarded = req.headers["x-forwarded-for"];
  const client = Array.isArray(forwarded)
    ? forwarded[0]
    : forwarded?.split(",")[0]?.trim() || req.ip || "unknown";
  const now = Date.now();
  const recent = (attempts.get(client) || []).filter(
    (timestamp) => timestamp > now - WINDOW_MS,
  );

  if (recent.length >= MAX_REQUESTS) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Please wait before sending another message.",
    );
  }

  recent.push(now);
  attempts.set(client, recent);

  if (attempts.size > 5000) {
    for (const [key, timestamps] of attempts) {
      if (!timestamps.some((timestamp) => timestamp > now - WINDOW_MS)) {
        attempts.delete(key);
      }
    }
  }

  next();
};
