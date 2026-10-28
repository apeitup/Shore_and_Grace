"use client"

import { captureStorefrontEventOnce } from "@modules/analytics/lib/posthog-client"
import { useAnalyticsConsent } from "@modules/analytics/hooks/use-analytics-consent"
import { useEffect } from "react"

type CartViewTrackerProps = {
  cartId: string
  cartValue: number
  currencyCode: string
  itemCount: number
  countryCode?: string
}

export default function CartViewTracker({
  cartId,
  cartValue,
  currencyCode,
  itemCount,
  countryCode,
}: CartViewTrackerProps) {
  const analyticsConsent = useAnalyticsConsent()

  useEffect(() => {
    if (!analyticsConsent) return

    const key = `cart-viewed:${cartId}:${itemCount}:${cartValue}`
    void captureStorefrontEventOnce(key, "cart_viewed", {
      cart_value: cartValue,
      currency_code: currencyCode,
      item_count: itemCount,
      country_code: countryCode,
    })
  }, [
    analyticsConsent,
    cartId,
    cartValue,
    countryCode,
    currencyCode,
    itemCount,
  ])

  return null
}
