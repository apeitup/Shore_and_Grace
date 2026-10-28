"use client"

import type { SearchClient } from "instantsearch.js"
import { useEffect, useState } from "react"
import { Configure, InstantSearch } from "react-instantsearch"

import { PRODUCT_INDEX_NAME, searchClient } from "@lib/search-client"
import StoreHits from "@modules/store/components/store-hits"
import StoreRefinements from "@modules/store/components/store-refinements"
import StoreSearchBox from "@modules/store/components/store-search-box"
import StoreToolbar from "@modules/store/components/store-toolbar"
import ShopPageHero from "@modules/brand/components/shop-page-hero"

const PRODUCT_LIMIT = 12
const MOBILE_PRODUCT_LIMIT = 6

export type StoreCategoryContext = {
  name: string
  trail: Array<{
    label: string
    href?: string
  }>
  subcategories: Array<{
    id: string
    name: string
    handle: string
  }>
}

const StoreTemplate = ({
  currencyCode,
  regionId,
  category,
}: {
  currencyCode: string
  regionId: string
  category?: StoreCategoryContext
}) => {
  const [mobilePanel, setMobilePanel] = useState<"filters" | "sort" | null>(
    null,
  )
  const [hitsPerPage, setHitsPerPage] = useState(PRODUCT_LIMIT)
  const filtersOpen = mobilePanel === "filters"
  const sortOpen = mobilePanel === "sort"
  const categoryFacetFilters = category
    ? [
        [
          `category:${category.name}`,
          ...category.subcategories.map(
            (subcategory) => `category:${subcategory.name}`,
          ),
        ],
      ]
    : undefined

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)")
    const updateLimit = () =>
      setHitsPerPage(media.matches ? MOBILE_PRODUCT_LIMIT : PRODUCT_LIMIT)

    updateLimit()
    media.addEventListener("change", updateLimit)
    return () => media.removeEventListener("change", updateLimit)
  }, [])

  return (
    <div
      className="sg-store-page"
      data-testid="category-container"
      data-category={category?.name}
    >
      <ShopPageHero
        title={category?.name ?? "Shop"}
        trail={category?.trail ?? [{ label: "Shop" }]}
      />
      <div className="content-container sg-store-layout">
        <InstantSearch
          indexName={PRODUCT_INDEX_NAME}
          searchClient={searchClient as unknown as SearchClient}
          routing
          future={{ preserveSharedStateOnUnmount: true }}
        >
          <Configure
            hitsPerPage={hitsPerPage}
            facetFilters={categoryFacetFilters}
          />
          <StoreRefinements
            currencyCode={currencyCode}
            isOpen={filtersOpen}
            onClose={() => setMobilePanel(null)}
            categoryFilter={
              category
                ? {
                    title: "Sub Categories",
                    items: category.subcategories.map((subcategory) => ({
                      label: subcategory.name,
                      value: subcategory.name,
                    })),
                  }
                : undefined
            }
          />
          <div className="w-full min-w-0 sg-store-results">
            <StoreToolbar
              currencyCode={currencyCode}
              filtersOpen={filtersOpen}
              sortOpen={sortOpen}
              onToggleFilters={() =>
                setMobilePanel((panel) =>
                  panel === "filters" ? null : "filters",
                )
              }
              onToggleSort={() =>
                setMobilePanel((panel) => (panel === "sort" ? null : "sort"))
              }
              onClosePanel={() => setMobilePanel(null)}
            >
              <StoreSearchBox />
            </StoreToolbar>
            <StoreHits
              hitsPerPage={hitsPerPage}
              currencyCode={currencyCode}
              regionId={regionId}
            />
          </div>
        </InstantSearch>
      </div>
    </div>
  )
}

export default StoreTemplate
