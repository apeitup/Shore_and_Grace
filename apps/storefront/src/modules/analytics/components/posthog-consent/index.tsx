"use client"

import {
  COOKIE_CONSENT_CHANGED_EVENT,
  hasAnalyticsConsent,
  type CookieConsent,
} from "@modules/layout/components/cookie-consent"
import { useEffect } from "react"
import { setPostHogConsent } from "@modules/analytics/lib/posthog-client"

export default function PostHogConsent() {
  useEffect(() => {
    void setPostHogConsent(hasAnalyticsConsent())

    const onConsentChanged = (event: Event) => {
      const consent = (event as CustomEvent<CookieConsent>).detail
      void setPostHogConsent(consent.analytics)
    }

    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, onConsentChanged)
    return () =>
      window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, onConsentChanged)
  }, [])

  return null
}
