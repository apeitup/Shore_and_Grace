"use client"

import { useState } from "react"
import { useRefinementList } from "react-instantsearch"

import { OPTION_VALUES_ATTRIBUTE } from "./attributes"

const FACET_LIMIT = 200

type OptionGroup = {
  title: string
  values: {
    label: string
    value: string
    count: number
    isRefined: boolean
  }[]
}

function groupItems(
  items: ReturnType<typeof useRefinementList>["items"]
): OptionGroup[] {
  const groups = new Map<string, OptionGroup>()

  for (const item of items) {
    const separator = item.label.indexOf(":")

    if (separator < 1) {
      continue
    }

    const title = item.label.slice(0, separator)
    const label = item.label.slice(separator + 1)

    if (!groups.has(title)) {
      groups.set(title, { title, values: [] })
    }

    groups.get(title)!.values.push({
      label,
      value: item.value,
      count: item.count,
      isRefined: item.isRefined,
    })
  }

  return Array.from(groups.values())
}

const OptionRefinements = () => {
  const { items, refine } = useRefinementList({
    attribute: OPTION_VALUES_ATTRIBUTE,
    limit: FACET_LIMIT,
    // Alphabetical keeps a size or colour list stable as counts move around.
    sortBy: ["name:asc"],
    operator: "and",
  })
  const [knownItems, setKnownItems] = useState(items)
  const unseenItems = items.filter(
    (item) => !knownItems.some((knownItem) => knownItem.value === item.value)
  )

  if (unseenItems.length) {
    setKnownItems((known) => [...known, ...unseenItems])
  }

  const currentItems = new Map(items.map((item) => [item.value, item]))
  const visibleItems = knownItems.map(
    (knownItem) =>
      currentItems.get(knownItem.value) ?? {
        ...knownItem,
        count: 0,
        isRefined: false,
      }
  )
  const groups = groupItems(visibleItems)

  if (!groups.length) {
    return null
  }

  return (
    <>
      {groups.map((group) => {
        return (
          <section className="sg-filter-section" key={group.title}>
            <div className="sg-filter-heading">
              <h2>{group.title === "Color" ? "Colour" : group.title}</h2>
            </div>
            <ul className="sg-filter-options sg-filter-options--list">
              {group.values.map((value) => {
                const isDisabled = value.count === 0 && !value.isRefined

                return (
                  <li key={value.value}>
                    <label className="sg-filter-option">
                      <input
                        type="checkbox"
                        checked={value.isRefined}
                        onChange={() => refine(value.value)}
                        disabled={isDisabled}
                        data-testid="option-refinement"
                      />
                      <span>{value.label}</span>
                      <span>({value.count})</span>
                    </label>
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}
    </>
  )
}

export default OptionRefinements
