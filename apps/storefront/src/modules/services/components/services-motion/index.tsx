"use client"

import { useEffect } from "react"

const REVEAL_SELECTOR = "[data-services-reveal]"

export default function ServicesMotion() {
  useEffect(() => {
    const page = document.querySelector<HTMLElement>(".sg-services-page")

    if (!page) {
      return
    }

    const revealItems = Array.from(
      page.querySelectorAll<HTMLElement>(REVEAL_SELECTOR)
    )
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    )

    page.dataset.motionReady = "true"

    if (reducedMotion.matches || !("IntersectionObserver" in window)) {
      revealItems.forEach((item) => {
        item.dataset.servicesVisible = "true"
      })

      return
    }

    const observedItems = new Map<Element, HTMLElement>()
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return
          }

          const item =
            observedItems.get(entry.target) ?? (entry.target as HTMLElement)
          item.dataset.servicesVisible = "true"
          observer.unobserve(entry.target)
        })
      },
      {
        rootMargin: "0px 0px -28% 0px",
        threshold: 0.18,
      }
    )

    revealItems.forEach((item) => {
      const target =
        window.getComputedStyle(item).display === "contents"
          ? item.firstElementChild
          : item

      if (!target) {
        item.dataset.servicesVisible = "true"
        return
      }

      observedItems.set(target, item)
      observer.observe(target)
    })

    return () => {
      observer.disconnect()
      delete page.dataset.motionReady
    }
  }, [])

  return null
}
