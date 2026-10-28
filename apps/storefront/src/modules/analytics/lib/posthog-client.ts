"use client"

import {
  hasAnalyticsConsent,
} from "@modules/layout/components/cookie-consent"
import type { PostHog } from "posthog-js/dist/module.no-external"
import {
  sanitizeStorefrontEventProperties,
  type StorefrontEventName,
  type StorefrontEventProperties,
} from "./event-contract"

const projectToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST
const captureLocalhost =
  process.env.NEXT_PUBLIC_POSTHOG_CAPTURE_LOCALHOST === "true"

let client: PostHog | null = null
let clientPromise: Promise<PostHog | null> | null = null
const capturedOnce = new Set<string>()

const isLocalhost = () =>
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"

const analyticsConfigured = () =>
  Boolean(projectToken && apiHost) && (!isLocalhost() || captureLocalhost)

export const loadPostHogClient = async () => {
  if (!analyticsConfigured()) {
    return null
  }

  if (client) return client
  if (clientPromise) return clientPromise

  clientPromise = import("posthog-js/dist/module.no-external")
    .then(({ default: posthog }) => {
      posthog.init(projectToken!, {
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
    })
    .catch(() => {
      clientPromise = null
      return null
    })

  return clientPromise
}

export const setPostHogConsent = async (enabled: boolean) => {
  if (!enabled) {
    client?.opt_out_capturing()
    return
  }

  const posthog = await loadPostHogClient()
  posthog?.opt_in_capturing({ captureEventName: false })
}

export const captureStorefrontEvent = async <
  EventName extends StorefrontEventName,
>(
  eventName: EventName,
  properties: StorefrontEventProperties[EventName]
) => {
  if (typeof window === "undefined" || !hasAnalyticsConsent()) {
    return false
  }

  const posthog = await loadPostHogClient()
  if (!posthog) {
    return false
  }

  if (posthog.has_opted_out_capturing()) {
    posthog.opt_in_capturing({ captureEventName: false })
  }

  posthog.capture(
    eventName,
    sanitizeStorefrontEventProperties(eventName, properties)
  )
  return true
}

export const captureStorefrontEventOnce = async <
  EventName extends StorefrontEventName,
>(
  dedupeKey: string,
  eventName: EventName,
  properties: StorefrontEventProperties[EventName]
) => {
  if (capturedOnce.has(dedupeKey)) {
    return false
  }

  const captured = await captureStorefrontEvent(eventName, properties)
  if (captured) capturedOnce.add(dedupeKey)
  return captured
}
