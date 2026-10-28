"use client"

import { Xmark } from "iconoir-react"
import { useEffect } from "react"
import { useClearRefinements } from "react-instantsearch"

import { CATEGORY_ATTRIBUTE, LABELS_ATTRIBUTE } from "./attributes"
import CurrentRefinements from "./current-refinements"
import OptionRefinements from "./option-refinements"
import PriceRange from "./price-range"
import RecentProducts from "./recent-products"
import RefinementGroup from "./refinement-group"

const StoreRefinements = ({
  currencyCode,
  isOpen,
  onClose,
  categoryFilter,
}: {
  currencyCode: string
  isOpen: boolean
  onClose: () => void
  categoryFilter?: {
    title: string
    items: Array<{ label: string; value: string }>
  }
}) => {
  const { canRefine, refine: clearAll } = useClearRefinements()

  useEffect(() => {
    if (!isOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", closeOnEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", closeOnEscape)
    }
  }, [isOpen, onClose])

  return (
    <aside className="sg-store-filters" aria-label="Product filters">
      <button
        type="button"
        className="sg-store-filters__backdrop"
        aria-label="Close filters"
        onClick={onClose}
        tabIndex={isOpen ? 0 : -1}
        aria-hidden={!isOpen}
      />
      <div
        id="shop-filters"
        className={
          isOpen ? "sg-store-filters__body is-open" : "sg-store-filters__body"
        }
      >
        <span className="sg-store-sheet__handle" aria-hidden="true" />
        <header className="sg-store-filters__mobile-header">
          <h2>Filter</h2>
          <button type="button" onClick={onClose} aria-label="Close filters">
            <Xmark aria-hidden="true" />
          </button>
        </header>
        <div className="sg-store-filters__content">
          {categoryFilter ? (
            categoryFilter.items.length > 0 && (
              <RefinementGroup
                key={categoryFilter.title}
                attribute={CATEGORY_ATTRIBUTE}
                title={categoryFilter.title}
                fixedItems={categoryFilter.items}
              />
            )
          ) : (
            <RefinementGroup
              attribute={CATEGORY_ATTRIBUTE}
              title="Menu Categories"
            />
          )}
          <PriceRange currencyCode={currencyCode} />
          <OptionRefinements />
          <RefinementGroup
            attribute={LABELS_ATTRIBUTE}
            title="Tags"
            display="tags"
          />
          <CurrentRefinements currencyCode={currencyCode} />
          <RecentProducts currencyCode={currencyCode} />
        </div>
        <footer className="sg-store-filters__mobile-actions">
          <button
            type="button"
            className="sg-store-filters__clear"
            onClick={() => canRefine && clearAll()}
          >
            Clear
          </button>
          <button
            type="button"
            className="sg-store-filters__apply"
            onClick={onClose}
          >
            Apply Filters
          </button>
        </footer>
      </div>
    </aside>
  )
}

export default StoreRefinements
