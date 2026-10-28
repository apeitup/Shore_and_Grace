"use client"

import { NavArrowRight } from "iconoir-react"
import { usePagination, useStats } from "react-instantsearch"

import { clx } from "@modules/common/components/ui"

const SearchPagination = () => {
  const { pages, currentRefinement, nbPages, refine } = usePagination({
    padding: 2,
  })
  const { nbHits, page, hitsPerPage } = useStats()
  const pageSize = hitsPerPage ?? 0

  if (nbPages <= 1) {
    return null
  }

  const renderPage = (page: number) => (
    <button
      key={page}
      className={clx("txt-xlarge-plus text-ui-fg-muted", {
        "text-ui-fg-base hover:text-ui-fg-subtle": page === currentRefinement,
      })}
      disabled={page === currentRefinement}
      onClick={() => refine(page)}
    >
      {page + 1}
    </button>
  )

  const renderEllipsis = (key: string) => (
    <span
      key={key}
      className="txt-xlarge-plus text-ui-fg-muted items-center cursor-default"
    >
      ...
    </span>
  )

  const lastPage = nbPages - 1

  const firstResult = nbHits ? page * pageSize + 1 : 0
  const lastResult = Math.min((page + 1) * pageSize, nbHits)

  return (
    <nav className="sg-store-pagination" aria-label="Product pages">
      <p>
        Showing {firstResult}-{lastResult} of {nbHits} results
      </p>
      <div className="sg-store-pagination__buttons" data-testid="product-pagination">
        {!pages.includes(0) && renderPage(0)}
        {!pages.includes(0) && !pages.includes(1) && renderEllipsis("start")}
        {pages.map(renderPage)}
        {!pages.includes(lastPage) &&
          !pages.includes(lastPage - 1) &&
          renderEllipsis("end")}
        {!pages.includes(lastPage) && renderPage(lastPage)}
        {currentRefinement < lastPage && (
          <button
            type="button"
            className="sg-store-pagination__next"
            onClick={() => refine(currentRefinement + 1)}
          >
            Next <NavArrowRight aria-hidden="true" />
          </button>
        )}
      </div>
    </nav>
  )
}

export default SearchPagination
