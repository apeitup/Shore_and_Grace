"use client"

import { hasPersonalisationConsent } from "@modules/layout/components/cookie-consent"
import { useEffect } from "react"

const ENABLED_KEY = "sg-recently-viewed-enabled"
const PRODUCTS_KEY = "sg-recently-viewed-products"

export default function RecentProductTracker({ productId }: { productId: string }) {
  useEffect(() => {
    if (
      window.localStorage.getItem(ENABLED_KEY) !== "true" ||
      !hasPersonalisationConsent()
    ) {
      return
    }
    try {
      const current = JSON.parse(
        window.localStorage.getItem(PRODUCTS_KEY) || "[]"
      ) as string[]
      const next = [productId, ...current.filter((id) => id !== productId)].slice(
        0,
        20
      )
      window.localStorage.setItem(PRODUCTS_KEY, JSON.stringify(next))
    } catch {
      window.localStorage.setItem(PRODUCTS_KEY, JSON.stringify([productId]))
    }
  }, [productId])

  return null
}
