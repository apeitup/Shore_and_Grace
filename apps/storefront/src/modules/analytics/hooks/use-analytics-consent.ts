"use client"

import {
  COOKIE_CONSENT_CHANGED_EVENT,
  hasAnalyticsConsent,
} from "@modules/layout/components/cookie-consent"
import { useSyncExternalStore } from "react"

const subscribe = (onStoreChange: () => void) => {
  window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, onStoreChange)
  return () =>
    window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, onStoreChange)
}

export const useAnalyticsConsent = () =>
  useSyncExternalStore(subscribe, hasAnalyticsConsent, () => false)
