"use client"

import { captureStorefrontEventOnce } from "@modules/analytics/lib/posthog-client"
import { useAnalyticsConsent } from "@modules/analytics/hooks/use-analytics-consent"
import { useEffect } from "react"

type ProductViewTrackerProps = {
  productId: string
  variantId?: string
  categoryId?: string
  price?: number
  currencyCode?: string
  countryCode?: string
}

export default function ProductViewTracker({
  productId,
  variantId,
  categoryId,
  price,
  currencyCode,
  countryCode,
}: ProductViewTrackerProps) {
  const analyticsConsent = useAnalyticsConsent()

  useEffect(() => {
    if (!analyticsConsent) return

    void captureStorefrontEventOnce(`product-viewed:${productId}`, "product_viewed", {
      product_id: productId,
      variant_id: variantId,
      category_id: categoryId,
      price,
      currency_code: currencyCode,
      country_code: countryCode,
    })
  }, [
    analyticsConsent,
    categoryId,
    countryCode,
    currencyCode,
    price,
    productId,
    variantId,
  ])

  return null
}
