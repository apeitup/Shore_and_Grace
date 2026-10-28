"use client"

import * as Slider from "@radix-ui/react-slider"
import { useState } from "react"
import { useRange } from "react-instantsearch"

import { indexedCurrency, priceAttribute } from "@lib/search-client"

function formatAmount(amount: number, currency: string) {
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: currency.toUpperCase(),
        maximumFractionDigits: 0,
      }).format(amount)
    } catch {
      // An unrecognised currency code shouldn't take the sidebar down.
      return `${Math.round(amount)} ${currency.toUpperCase()}`
    }
}

/**
 * Price filter over the region currency's `min_price_*` field, which is
 * declared `facetable({ types: ["stats"] })` — the stats facet is what
 * supplies the slider's bounds. Refines on release rather than per pixel.
 */
const PriceRange = ({ currencyCode }: { currencyCode: string }) => {
  const { start, range, canRefine, refine } = useRange({
    attribute: priceAttribute("min_price", currencyCode),
  })
  const currency = indexedCurrency(currencyCode)
  const format = (amount: number) => formatAmount(amount, currency)

  const min = Math.floor(range.min ?? 0)
  const max = Math.ceil(range.max ?? 0)

  // `start` holds ±Infinity for an unset bound, so fall back to the extremes.
  const from = Number.isFinite(start[0]) ? (start[0] as number) : min
  const to = Number.isFinite(start[1]) ? (start[1] as number) : max

  const refinementKey = `${from}:${to}`
  const [draft, setDraft] = useState({
    refinementKey,
    value: [from, to],
  })
  const value =
    draft.refinementKey === refinementKey ? draft.value : [from, to]
  const setValue = (nextValue: number[]) =>
    setDraft({ refinementKey, value: nextValue })

  const rangeUnavailable = !canRefine || min >= max
  const sliderMax = min >= max ? min + 1 : max

  return (
    <section className="sg-filter-section">
      <div className="sg-filter-heading">
        <h2>Price filter</h2>
      </div>

      <div className="sg-filter-price">
        <Slider.Root
          className="sg-filter-price__slider"
          value={value}
          min={min}
          max={sliderMax}
          step={1}
          minStepsBetweenThumbs={0}
          onValueChange={setValue}
          disabled={rangeUnavailable}
          aria-label="Price range"
          data-testid="price-range"
        >
          <Slider.Track className="sg-filter-price__track">
            <Slider.Range className="sg-filter-price__range" />
          </Slider.Track>
          {value.map((_, index) => (
            <Slider.Thumb
              key={index}
              className="sg-filter-price__thumb"
              aria-label={index === 0 ? "Minimum price" : "Maximum price"}
            />
          ))}
        </Slider.Root>

        <div className="sg-filter-price__actions">
          <button
            type="button"
            disabled={rangeUnavailable}
            onClick={() => refine([value[0], value[1]])}
          >
            Apply
          </button>
          <span>{format(value[0])} - {format(value[1])}</span>
        </div>

        <div className="sg-filter-price__mobile-actions">
          <label>
            <span>From</span>
            <input
              type="number"
              min={min}
              max={value[1]}
              value={value[0]}
              onChange={(event) =>
                setValue([Number(event.target.value), value[1]])
              }
              aria-label="Minimum price"
            />
          </label>
          <label>
            <span>Too</span>
            <input
              type="number"
              min={value[0]}
              max={max}
              value={value[1]}
              onChange={(event) =>
                setValue([value[0], Number(event.target.value)])
              }
              aria-label="Maximum price"
            />
          </label>
          <button
            type="button"
            disabled={rangeUnavailable}
            onClick={() => refine([value[0], value[1]])}
          >
            Filter
          </button>
        </div>
      </div>
    </section>
  )
}

export default PriceRange
