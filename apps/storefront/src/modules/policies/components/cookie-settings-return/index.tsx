"use client"

import { COOKIE_CONSENT_EVENT } from "@modules/layout/components/cookie-consent"
import { NavArrowLeft } from "iconoir-react"
import { useSearchParams } from "next/navigation"

export default function CookieSettingsReturn() {
  const searchParams = useSearchParams()

  if (searchParams.get("from") !== "cookie-settings") {
    return null
  }

  return (
    <button
      type="button"
      className="sg-policy-page__consent-back"
      onClick={() => window.dispatchEvent(new Event(COOKIE_CONSENT_EVENT))}
    >
      <NavArrowLeft aria-hidden="true" />
      Back to cookie settings
    </button>
  )
}
