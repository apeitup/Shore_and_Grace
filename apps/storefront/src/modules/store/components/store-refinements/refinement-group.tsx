"use client"

import clsx from "clsx"
import { useState } from "react"
import { useRefinementList } from "react-instantsearch"

type RefinementGroupProps = {
  attribute: string
  title: string
  display?: "list" | "tags"
  fixedItems?: Array<{ label: string; value: string }>
}

const EMPTY_TAGS = ["Rose", "Sunflower", "Tulip", "Lily"]

const RefinementGroup = ({
  attribute,
  title,
  display = "list",
  fixedItems,
}: RefinementGroupProps) => {
  const { items, refine } = useRefinementList({
    attribute,
    limit: 20,
    sortBy: ["count:desc", "name:asc"],
  })
  const [knownItems, setKnownItems] = useState(items)
  const unseenItems = items.filter(
    (item) => !knownItems.some((knownItem) => knownItem.value === item.value),
  )

  if (unseenItems.length) {
    setKnownItems((known) => [...known, ...unseenItems])
  }

  const currentItems = new Map(items.map((item) => [item.value, item]))
  const visibleItems = (fixedItems ?? knownItems).map((knownItem) =>
    Object.assign(
      {
        ...knownItem,
        count: 0,
        isRefined: false,
      },
      currentItems.get(knownItem.value),
    ),
  )

  if (!visibleItems.length && display !== "tags") {
    return null
  }

  return (
    <section className="sg-filter-section">
      <div className="sg-filter-heading">
        <h2>{title}</h2>
      </div>
      <ul
        className={
          display === "tags"
            ? "sg-filter-options sg-filter-options--tags"
            : "sg-filter-options sg-filter-options--list"
        }
      >
        {!visibleItems.length &&
          EMPTY_TAGS.map((label) => (
            <li key={label}>
              <button type="button" className="sg-filter-tag" disabled>
                {label}
              </button>
            </li>
          ))}
        {visibleItems.map((item) => {
          const isDisabled = item.count === 0 && !item.isRefined

          return (
            <li key={item.value}>
              {display === "tags" ? (
                <button
                  type="button"
                  onClick={() => refine(item.value)}
                  aria-pressed={item.isRefined}
                  disabled={isDisabled}
                  className={clsx("sg-filter-tag", {
                    "is-selected": item.isRefined,
                  })}
                  data-testid={`refinement-${attribute}`}
                >
                  {item.label}
                </button>
              ) : (
                <label className="sg-filter-option">
                  <input
                    type="checkbox"
                    checked={item.isRefined}
                    onChange={() => refine(item.value)}
                    disabled={isDisabled}
                    data-testid={`refinement-${attribute}`}
                  />
                  <span>{item.label}</span>
                  <span>({item.count})</span>
                </label>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default RefinementGroup
