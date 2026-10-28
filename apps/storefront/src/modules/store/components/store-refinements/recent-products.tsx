"use client"

import type { Hit } from "instantsearch.js"
import { useHits } from "react-instantsearch"
import { useEffect, useState } from "react"
import { hasPersonalisationConsent } from "@modules/layout/components/cookie-consent"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import HitPrice, { HitPricing } from "@modules/store/components/store-hits/price"

type ProductHit = Hit<
  {
    title: string | null
    handle: string | null
    thumbnail: string | null
  } & HitPricing
>

const RecentProducts = ({ currencyCode }: { currencyCode: string }) => {
  const { items } = useHits<ProductHit>()
  const [recentIds, setRecentIds] = useState<string[]>([])

  useEffect(() => {
    let nextIds: string[] = []
    if (
      window.localStorage.getItem("sg-recently-viewed-enabled") !== "true" ||
      !hasPersonalisationConsent()
    ) {
      nextIds = []
    } else {
      try {
        nextIds = JSON.parse(
          window.localStorage.getItem("sg-recently-viewed-products") || "[]"
        )
      } catch {
        nextIds = []
      }
    }
    const timer = window.setTimeout(() => setRecentIds(nextIds), 0)
    return () => window.clearTimeout(timer)
  }, [])

  const hitsById = new Map(items.map((item) => [item.objectID, item]))
  const products = recentIds
    .map((id) => hitsById.get(id))
    .filter((item): item is ProductHit => Boolean(item?.handle))
    .slice(0, 3)

  if (!products.length) {
    return null
  }

  return (
    <section className="sg-filter-section sg-filter-recent">
      <div className="sg-filter-heading">
        <h2>Recent products</h2>
      </div>
      <ul>
        {products.map((product) => (
          <li key={`recent-${product.objectID}`}>
            <LocalizedClientLink href={`/products/${product.handle}`}>
              <div className="sg-filter-recent__image">
                <Thumbnail
                  thumbnail={product.thumbnail}
                  alt={product.title ?? "Product"}
                  size="square"
                />
              </div>
              <div className="sg-filter-recent__details">
                <strong>{product.title ?? "Product"}</strong>
                <HitPrice hit={product} currencyCode={currencyCode} />
              </div>
            </LocalizedClientLink>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default RecentProducts
