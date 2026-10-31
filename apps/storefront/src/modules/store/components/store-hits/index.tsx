"use client"

import type { Hit } from "instantsearch.js"
import { useHits, useInstantSearch } from "react-instantsearch"

import useSearchSettled from "@lib/hooks/use-search-settled"
import { Text } from "@modules/common/components/ui"
import ProductGridCard from "@modules/products/components/product-grid-card"
import RelatedProductsCarousel from "@modules/products/components/related-products/carousel"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import Image from "next/image"
import HitPrice, { HitPricing } from "./price"
import { priceAttribute } from "@lib/search-client"
import SearchPagination from "./pagination"

type ProductHit = Hit<
  {
    title: string | null
    handle: string | null
    thumbnail: string | null
  } & HitPricing
>

type StoreHitsProps = {
  hitsPerPage: number
  currencyCode: string
  regionId: string
}

const StoreHits = ({ hitsPerPage, currencyCode, regionId }: StoreHitsProps) => {
  const { items } = useHits<ProductHit>()
  const { status, error } = useInstantSearch()
  const { isSearching, hasNoResultsYet } = useSearchSettled()

  const showSkeleton = hasNoResultsYet || isSearching

  if (status === "error") {
    return (
      <Text
        className="py-16 text-center text-ui-fg-error"
        data-testid="products-error"
      >
        Couldn&apos;t load products
        {error?.message ? `: ${error.message}` : "."}
      </Text>
    )
  }

  return (
    <>
      {showSkeleton ? (
        <SkeletonProductGrid numberOfProducts={hitsPerPage} />
      ) : !items.length ? (
        <Text
          className="py-16 text-center text-ui-fg-subtle"
          data-testid="no-products"
        >
          No products matched these filters.
        </Text>
      ) : (
        <ul className="sg-product-grid" data-testid="products-list">
          {items.map((hit) =>
            hit.handle ? (
              <li key={hit.objectID}>
                <ProductGridCard
                  productId={hit.objectID}
                  title={hit.title ?? "Product"}
                  handle={hit.handle}
                  thumbnail={hit.thumbnail}
                  price={<HitPrice hit={hit} currencyCode={currencyCode} />}
                  onSale={hit[priceAttribute("on_sale", currencyCode)] === true}
                  regionId={regionId}
                />
              </li>
            ) : null
          )}
        </ul>
      )}
      <SearchPagination />
      {items.length > 0 && (
        <section
          className="sg-related-products sg-store-popular"
          aria-labelledby="store-popular-title"
        >
          <div className="sg-related-products__heading">
            <Image
              src="/assets/home/sections/section-foliage.svg"
              alt=""
              width={159}
              height={63}
            />
            <h2 id="store-popular-title">Popular products</h2>
          </div>
          <RelatedProductsCarousel>
            {items.slice(0, 4).map((hit) =>
              hit.handle ? (
                <li key={`popular-${hit.objectID}`}>
                  <ProductGridCard
                    productId={hit.objectID}
                    title={hit.title ?? "Product"}
                    handle={hit.handle}
                    thumbnail={hit.thumbnail}
                    price={<HitPrice hit={hit} currencyCode={currencyCode} />}
                    onSale={
                      hit[priceAttribute("on_sale", currencyCode)] === true
                    }
                    regionId={regionId}
                  />
                </li>
              ) : null
            )}
          </RelatedProductsCarousel>
        </section>
      )}
    </>
  )
}

export default StoreHits
