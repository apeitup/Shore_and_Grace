"use client"

import { captureStorefrontEventOnce } from "@modules/analytics/lib/posthog-client"
import { hasAnalyticsConsent } from "@modules/layout/components/cookie-consent"
import { useAnalyticsConsent } from "@modules/analytics/hooks/use-analytics-consent"
import { useSearchParams } from "next/navigation"
import { useEffect } from "react"

const steps = ["address", "delivery", "payment", "review"] as const
type CheckoutStep = (typeof steps)[number]

const stepEventName: Record<CheckoutStep, "details" | "delivery" | "payment" | "review"> = {
  address: "details",
  delivery: "delivery",
  payment: "payment",
  review: "review",
}

type CheckoutTrackerProps = {
  cartId: string
  cartValue: number
  currencyCode: string
  itemCount: number
  countryCode?: string
}

export default function CheckoutTracker({
  cartId,
  cartValue,
  currencyCode,
  itemCount,
  countryCode,
}: CheckoutTrackerProps) {
  const analyticsConsent = useAnalyticsConsent()
  const searchParams = useSearchParams()
  const requestedStep = searchParams.get("step")
  const currentStep: CheckoutStep = steps.includes(requestedStep as CheckoutStep)
    ? (requestedStep as CheckoutStep)
    : "address"

  useEffect(() => {
    if (!analyticsConsent) return

    void captureStorefrontEventOnce(`checkout-started:${cartId}`, "checkout_started", {
      cart_value: cartValue,
      currency_code: currencyCode,
      item_count: itemCount,
      country_code: countryCode,
    })

    if (!hasAnalyticsConsent()) return

    const currentKey = `sg_analytics_checkout_step:${cartId}`
    const completedKey = `sg_analytics_checkout_completed:${cartId}`
    const previousStep = window.sessionStorage.getItem(currentKey) as CheckoutStep | null
    let completed = new Set<string>()
    try {
      completed = new Set(
        JSON.parse(
          window.sessionStorage.getItem(completedKey) || "[]"
        ) as string[]
      )
    } catch {
      window.sessionStorage.removeItem(completedKey)
    }

    if (
      previousStep &&
      steps.includes(previousStep) &&
      steps.indexOf(currentStep) > steps.indexOf(previousStep) &&
      !completed.has(previousStep)
    ) {
      void captureStorefrontEventOnce(
        `checkout-step:${cartId}:${previousStep}`,
        "checkout_step_completed",
        {
          step_name: stepEventName[previousStep],
          cart_value: cartValue,
          currency_code: currencyCode,
          item_count: itemCount,
          country_code: countryCode,
        }
      ).then((captured) => {
        if (!captured) return
        completed.add(previousStep)
        window.sessionStorage.setItem(
          completedKey,
          JSON.stringify(Array.from(completed))
        )
      })
    }

    window.sessionStorage.setItem(currentKey, currentStep)
  }, [
    analyticsConsent,
    cartId,
    cartValue,
    countryCode,
    currencyCode,
    currentStep,
    itemCount,
  ])

  return null
}
