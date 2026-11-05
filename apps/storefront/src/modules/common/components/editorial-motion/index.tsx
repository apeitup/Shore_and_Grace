"use client"

import { useLayoutEffect } from "react"

const REVEAL_SELECTOR = "[data-sg-reveal]"
const ROOT_SELECTOR = "[data-sg-motion-root]"

export default function EditorialMotion() {
  useLayoutEffect(() => {
    const root = document.querySelector<HTMLElement>(ROOT_SELECTOR)

    if (!root) {
      return
    }

    const revealItems = Array.from(
      root.querySelectorAll<HTMLElement>(REVEAL_SELECTOR)
    )
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    )

    root.dataset.motionReady = "true"

    if (reducedMotion.matches || !("IntersectionObserver" in window)) {
      revealItems.forEach((item) => {
        item.dataset.sgVisible = "true"
      })

      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return
          }

          const item = entry.target as HTMLElement
          item.dataset.sgVisible = "true"
          observer.unobserve(item)
        })
      },
      {
        rootMargin: "0px 0px -12% 0px",
        threshold: 0.12,
      }
    )

    revealItems.forEach((item) => observer.observe(item))

    return () => {
      observer.disconnect()
      delete root.dataset.motionReady
    }
  }, [])

  return null
}
