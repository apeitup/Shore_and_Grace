"use client"

import { COOKIE_CONSENT_EVENT } from "@modules/layout/components/cookie-consent"

export default function CookieSettingsButton({
  className,
}: {
  className?: string
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new Event(COOKIE_CONSENT_EVENT))}
    >
      Cookie settings
    </button>
  )
}
