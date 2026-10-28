"use client"

import {
  COOKIE_CONSENT_CHANGED_EVENT,
  hasAnalyticsConsent,
  type CookieConsent,
} from "@modules/layout/components/cookie-consent"
import type { PostHog } from "posthog-js/dist/module.no-external"
import { useEffect } from "react"

const projectToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST
const captureLocalhost =
  process.env.NEXT_PUBLIC_POSTHOG_CAPTURE_LOCALHOST === "true"

let client: PostHog | null = null
let clientPromise: Promise<PostHog | null> | null = null

const isLocalhost = () =>
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"

const loadClient = async () => {
  if (!projectToken || !apiHost || (isLocalhost() && !captureLocalhost)) {
    return null
  }

  if (client) return client
  if (clientPromise) return clientPromise

  clientPromise = import("posthog-js/dist/module.no-external").then(
    ({ default: posthog }) => {
      posthog.init(projectToken, {
        api_host: apiHost,
        defaults: "2026-08-30",
        autocapture: false,
        capture_pageview: "history_change",
        capture_pageleave: true,
        disable_session_recording: true,
        disable_surveys: true,
        opt_out_capturing_by_default: true,
        opt_out_persistence_by_default: true,
        persistence: "localStorage",
        persistence_name: "sg_posthog",
        person_profiles: "identified_only",
      })
      client = posthog
      return posthog
    },
  )

  return clientPromise
}

const applyAnalyticsConsent = async (enabled: boolean) => {
  if (!enabled) {
    client?.opt_out_capturing()
    return
  }

  const posthog = await loadClient()
  posthog?.opt_in_capturing({ captureEventName: false })
}

export default function PostHogConsent() {
  useEffect(() => {
    void applyAnalyticsConsent(hasAnalyticsConsent())

    const onConsentChanged = (event: Event) => {
      const consent = (event as CustomEvent<CookieConsent>).detail
      void applyAnalyticsConsent(consent.analytics)
    }

    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, onConsentChanged)
    return () =>
      window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, onConsentChanged)
  }, [])

  return null
}
