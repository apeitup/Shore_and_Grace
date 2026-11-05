const LOOPBACK_HOSTNAMES = new Set(["localhost", "127.0.0.1", "::1"])

export const resolveMediaUrl = (value?: string | null) => {
  if (!value) {
    return value ?? ""
  }

  if (value.startsWith("/static/")) {
    return `/medusa${value}`
  }

  try {
    const url = new URL(value)

    if (LOOPBACK_HOSTNAMES.has(url.hostname) && url.pathname.startsWith("/static/")) {
      return `/medusa${url.pathname}${url.search}${url.hash}`
    }
  } catch {
    return value
  }

  return value
}
