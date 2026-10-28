"use client"

import {
  Children,
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react"

type RelatedProductsCarouselProps = {
  children: ReactNode
}

const getCarouselMetrics = (list: HTMLUListElement) => {
  const items = Array.from(list.children) as HTMLElement[]

  if (!items.length) {
    return { items, visibleItems: 1, lastPosition: 0 }
  }

  const firstItemWidth = items[0].getBoundingClientRect().width
  const styles = window.getComputedStyle(list)
  const gap = Number.parseFloat(styles.columnGap || styles.gap) || 0
  const visibleItems = Math.max(
    1,
    Math.round((list.clientWidth + gap) / (firstItemWidth + gap))
  )

  return {
    items,
    visibleItems,
    lastPosition: Math.max(0, items.length - visibleItems),
  }
}

export default function RelatedProductsCarousel({
  children,
}: RelatedProductsCarouselProps) {
  const listRef = useRef<HTMLUListElement>(null)
  const itemCount = Children.count(children)
  const [activePosition, setActivePosition] = useState(0)
  const [positionCount, setPositionCount] = useState(Math.max(1, itemCount - 1))

  useLayoutEffect(() => {
    const list = listRef.current

    if (!list) {
      return
    }

    // Browsers can restore an overflow container's previous scroll position on
    // reload. A product rail should always enter on its first card group.
    list.scrollTo({ left: 0, behavior: "auto" })
  }, [itemCount])

  const updatePagination = useCallback(() => {
    const list = listRef.current

    if (!list) {
      return
    }

    const { items, lastPosition } = getCarouselMetrics(list)
    const firstItemOffset = items[0]?.offsetLeft ?? 0
    const nearestPosition = items.reduce((nearest, item, index) => {
      if (index > lastPosition) {
        return nearest
      }

      return Math.abs(item.offsetLeft - firstItemOffset - list.scrollLeft) <
        Math.abs(items[nearest].offsetLeft - firstItemOffset - list.scrollLeft)
        ? index
        : nearest
    }, 0)

    setPositionCount(lastPosition + 1)
    setActivePosition(nearestPosition)
  }, [])

  useEffect(() => {
    const list = listRef.current

    if (!list) {
      return
    }

    const resizeObserver = new ResizeObserver(updatePagination)
    resizeObserver.observe(list)
    updatePagination()

    return () => resizeObserver.disconnect()
  }, [updatePagination])

  const scrollToPosition = (position: number) => {
    const list = listRef.current
    const item = list?.children[position] as HTMLElement | undefined

    if (!list || !item) {
      return
    }

    const firstItem = list.children[0] as HTMLElement | undefined
    const firstItemOffset = firstItem?.offsetLeft ?? 0

    list.scrollTo({
      left: item.offsetLeft - firstItemOffset,
      behavior: "smooth",
    })
  }

  return (
    <>
      <ul
        ref={listRef}
        className="sg-related-products__grid"
        onScroll={updatePagination}
      >
        {children}
      </ul>
      {positionCount > 1 && (
        <div
          className="sg-related-products__pagination"
          aria-label="Related product carousel pages"
        >
          {Array.from({ length: positionCount }, (_, position) => (
            <button
              key={position}
              type="button"
              className={position === activePosition ? "is-active" : undefined}
              aria-label={`Show related products from item ${position + 1}`}
              aria-current={position === activePosition ? "true" : undefined}
              onClick={() => scrollToPosition(position)}
            />
          ))}
        </div>
      )}
    </>
  )
}
