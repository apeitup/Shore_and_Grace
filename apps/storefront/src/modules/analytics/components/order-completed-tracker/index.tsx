"use client"

import { captureStorefrontEventOnce } from "@modules/analytics/lib/posthog-client"
import { hasAnalyticsConsent } from "@modules/layout/components/cookie-consent"
import { useAnalyticsConsent } from "@modules/analytics/hooks/use-analytics-consent"
import { useEffect } from "react"

type OrderCompletedTrackerProps = {
  orderId: string
  orderValue: number
  currencyCode: string
  itemCount: number
  countryCode?: string
}

export default function OrderCompletedTracker({
  orderId,
  orderValue,
  currencyCode,
  itemCount,
  countryCode,
}: OrderCompletedTrackerProps) {
  const analyticsConsent = useAnalyticsConsent()

  useEffect(() => {
    if (!analyticsConsent || !hasAnalyticsConsent()) return

    const storageKey = `sg_analytics_order_completed:${orderId}`
    if (window.sessionStorage.getItem(storageKey) === "true") return

    void captureStorefrontEventOnce(
      `checkout-step:${orderId}:review`,
      "checkout_step_completed",
      {
        step_name: "review",
        cart_value: orderValue,
        currency_code: currencyCode,
        item_count: itemCount,
        country_code: countryCode,
      }
    )
    void captureStorefrontEventOnce(
      `order-completed:${orderId}`,
      "order_completed",
      {
        order_value: orderValue,
        currency_code: currencyCode,
        item_count: itemCount,
        country_code: countryCode,
      }
    ).then((captured) => {
      if (captured) window.sessionStorage.setItem(storageKey, "true")
    })
  }, [
    analyticsConsent,
    countryCode,
    currencyCode,
    itemCount,
    orderId,
    orderValue,
  ])

  return null
}
