"use client"

import { Filter, Search, SortDown, Xmark } from "iconoir-react"
import Image from "next/image"
import { ReactNode, useEffect, useState } from "react"
import { useSortBy, useStats } from "react-instantsearch"

import { getSortOptions } from "@modules/store/components/store-refinements/attributes"

type StoreToolbarProps = {
  children: ReactNode
  currencyCode: string
  filtersOpen: boolean
  sortOpen: boolean
  onToggleFilters: () => void
  onToggleSort: () => void
  onClosePanel: () => void
}

const StoreToolbar = ({
  children,
  currencyCode,
  filtersOpen,
  sortOpen,
  onToggleFilters,
  onToggleSort,
  onClosePanel,
}: StoreToolbarProps) => {
  const items = getSortOptions(currencyCode)
  const { currentRefinement, refine } = useSortBy({ items })
  const { nbHits } = useStats()
  const currentSortLabel =
    items.find((item) => item.value === currentRefinement)?.label ?? "Relevance"
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  useEffect(() => {
    if (!sortOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClosePanel()
    }
    window.addEventListener("keydown", closeOnEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", closeOnEscape)
    }
  }, [sortOpen, onClosePanel])

  return (
    <div className="sg-store-toolbar">
      <div className="sg-store-toolbar__views" aria-label="Product view">
        <span className="sg-store-toolbar__view is-active">
          <Image
            src="/assets/shop/view-grid.svg"
            alt=""
            width={28}
            height={28}
          />
          <span>Grid</span>
        </span>
        <span className="sg-store-toolbar__view">
          <Image
            src="/assets/shop/view-list.svg"
            alt=""
            width={28}
            height={28}
          />
          <span>List</span>
        </span>
      </div>

      <button
        type="button"
        className="sg-store-toolbar__filter"
        onClick={onToggleFilters}
        aria-expanded={filtersOpen}
        aria-controls="shop-filters"
      >
        <Filter aria-hidden="true" />
        <span>Filter</span>
      </button>

      <button
        type="button"
        className="sg-store-toolbar__search-toggle"
        aria-expanded={mobileSearchOpen}
        aria-controls="mobile-store-search"
        onClick={() => setMobileSearchOpen((open) => !open)}
      >
        <Search aria-hidden="true" />
        <span>Search</span>
      </button>

      <div
        id="mobile-store-search"
        className={
          mobileSearchOpen
            ? "sg-store-toolbar__search is-mobile-open"
            : "sg-store-toolbar__search"
        }
      >
        {children}
      </div>
      <p className="sg-store-toolbar__count">{nbHits} products</p>

      <label className="sg-store-toolbar__sort sg-store-toolbar__sort--desktop">
        <span className="sg-store-toolbar__sort-label">Sort by *</span>
        <span className="sg-store-toolbar__sort-value">{currentSortLabel}</span>
        <Image
          className="sg-store-toolbar__sort-arrow"
          src="/assets/shop/nav-arrow-down.svg"
          alt=""
          width={20}
          height={20}
        />
        <select
          value={currentRefinement}
          onChange={(event) => refine(event.target.value)}
          aria-label="Sort products"
        >
          {items.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </label>

      <button
        type="button"
        className="sg-store-toolbar__sort-toggle"
        aria-expanded={sortOpen}
        aria-controls="mobile-store-sort"
        onClick={onToggleSort}
      >
        <SortDown aria-hidden="true" />
        <span>Sort</span>
      </button>

      <div
        className={sortOpen ? "sg-store-sheet is-open" : "sg-store-sheet"}
        aria-hidden={!sortOpen}
      >
        <button
          type="button"
          className="sg-store-sheet__backdrop"
          aria-label="Close sort options"
          onClick={onClosePanel}
          tabIndex={sortOpen ? 0 : -1}
        />
        <section
          id="mobile-store-sort"
          className="sg-store-sheet__panel sg-store-sort-sheet"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-store-sort-title"
        >
          <span className="sg-store-sheet__handle" aria-hidden="true" />
          <header className="sg-store-sheet__header">
            <h2 id="mobile-store-sort-title">Sort</h2>
            <button type="button" onClick={onClosePanel} aria-label="Close sort">
              <Xmark aria-hidden="true" />
            </button>
          </header>
          <div className="sg-store-sort-sheet__options">
            {items.map((item) => (
              <button
                key={item.value}
                type="button"
                className={
                  item.value === currentRefinement ? "is-selected" : undefined
                }
                aria-pressed={item.value === currentRefinement}
                onClick={() => {
                  refine(item.value)
                  onClosePanel()
                }}
              >
                {item.label.replace(" -> ", " > ")}
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default StoreToolbar
