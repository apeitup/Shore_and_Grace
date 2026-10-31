"use client"

import { XMarkMini } from "@medusajs/icons"
import Image from "next/image"
import { useCallback, useEffect, useRef, useState } from "react"
import { useSearchBox } from "react-instantsearch"

const DEBOUNCE_MS = 250

type SearchInputProps = {
  initialValue: string
  refine: (value: string) => void
  clearTimer: () => void
}

const SearchInput = ({
  initialValue,
  refine,
  clearTimer,
}: SearchInputProps) => {
  const [inputValue, setInputValue] = useState(initialValue)

  const clear = () => {
    clearTimer()
    setInputValue("")
    refine("")
  }

  return (
    <div className="sg-store-search">
      <Image src="/assets/shop/search.svg" alt="" width={20} height={20} />
      <input
        type="search"
        value={inputValue}
        onChange={(event) => {
          setInputValue(event.target.value)
          refine(event.target.value)
        }}
        placeholder="Search by name or style"
        aria-label="Search products"
        className="sg-store-search__input [&::-webkit-search-cancel-button]:hidden"
        data-testid="store-search-input"
      />
      {inputValue && (
        <button
          type="button"
          onClick={clear}
          aria-label="Clear search"
          className="shrink-0 text-ui-fg-muted hover:text-ui-fg-base"
          data-testid="store-search-clear"
        >
          <XMarkMini />
        </button>
      )}
    </div>
  )
}

/**
 * Free-text search over the listing, refining the same InstantSearch state the
 * sidebar filters do. The input is held locally so typing stays responsive
 * while the query itself is debounced.
 */
const StoreSearchBox = () => {
  const timer = useRef<number | undefined>(undefined)

  const queryHook = useCallback(
    (nextQuery: string, search: (value: string) => void) => {
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => search(nextQuery), DEBOUNCE_MS)
    },
    []
  )

  const { query, refine } = useSearchBox({ queryHook })

  useEffect(() => () => window.clearTimeout(timer.current), [])

  return (
    <SearchInput
      key={query}
      initialValue={query}
      refine={refine}
      clearTimer={() => window.clearTimeout(timer.current)}
    />
  )
}

export default StoreSearchBox
