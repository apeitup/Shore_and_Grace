"use client"

import { setWishlistProduct } from "@lib/data/wishlist"
import { useParams, useRouter } from "next/navigation"
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react"
import { captureStorefrontEvent } from "@modules/analytics/lib/posthog-client"

type WishlistContextValue = {
  isSaved: (productId: string) => boolean
  toggle: (productId: string) => Promise<boolean>
  pendingProductIds: ReadonlySet<string>
}

const WishlistContext = createContext<WishlistContextValue | null>(null)

export const WishlistProvider = ({
  initialProductIds,
  children,
}: {
  initialProductIds: string[]
  children: ReactNode
}) => {
  const [productIds, setProductIds] = useState(() => new Set(initialProductIds))
  const [pendingProductIds, setPendingProductIds] = useState(
    () => new Set<string>()
  )
  const { countryCode = "gb" } = useParams<{ countryCode?: string }>()
  const router = useRouter()

  const toggle = useCallback(
    async (productId: string) => {
      if (pendingProductIds.has(productId)) {
        return productIds.has(productId)
      }

      const wasSaved = productIds.has(productId)
      const nextSaved = !wasSaved

      setProductIds((current) => {
        const next = new Set(current)
        if (nextSaved) next.add(productId)
        else next.delete(productId)
        return next
      })
      setPendingProductIds((current) => new Set(current).add(productId))

      try {
        const result = await setWishlistProduct({
          productId,
          saved: nextSaved,
        })

        if (!result.authenticated) {
          setProductIds((current) => {
            const next = new Set(current)
            if (wasSaved) next.add(productId)
            else next.delete(productId)
            return next
          })
          router.push(`/${countryCode}/account`)
          return wasSaved
        }

        if (result.saved) {
          void captureStorefrontEvent("wishlist_item_added", {
            product_id: productId,
          })
        }

        router.refresh()
        return result.saved
      } catch {
        setProductIds((current) => {
          const next = new Set(current)
          if (wasSaved) next.add(productId)
          else next.delete(productId)
          return next
        })
        return wasSaved
      } finally {
        setPendingProductIds((current) => {
          const next = new Set(current)
          next.delete(productId)
          return next
        })
      }
    },
    [countryCode, pendingProductIds, productIds, router]
  )

  const value = useMemo(
    () => ({
      isSaved: (productId: string) => productIds.has(productId),
      toggle,
      pendingProductIds,
    }),
    [pendingProductIds, productIds, toggle]
  )

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => {
  const context = useContext(WishlistContext)

  if (!context) {
    throw new Error("useWishlist must be used within WishlistProvider")
  }

  return context
}
