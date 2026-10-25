"use client"

import { ReactNode, useEffect, useRef, useState } from "react"

type ScrollHeaderProps = {
  children: ReactNode
}

export default function ScrollHeader({ children }: ScrollHeaderProps) {
  const [state, setState] = useState<"top" | "scrolled" | "returning">("top")
  const stateRef = useRef(state)
  const shellRef = useRef<HTMLDivElement>(null)
  const returnTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const frame = useRef<number | null>(null)

  useEffect(() => {
    const updateState = (nextState: "top" | "scrolled" | "returning") => {
      stateRef.current = nextState
      setState(nextState)
    }

    const clearReturnTimer = () => {
      if (returnTimer.current) {
        clearTimeout(returnTimer.current)
        returnTimer.current = null
      }
    }

    const updateHeader = () => {
      const scrollPosition = Math.max(
        window.scrollY || 0,
        document.documentElement.scrollTop || 0,
        document.body.scrollTop || 0
      )
      const headerHeight = shellRef.current?.offsetHeight ?? 70
      const hasPassedHeader = scrollPosition >= headerHeight - 1
      const isAtTop = scrollPosition <= 1

      if (!isAtTop && stateRef.current === "returning") {
        clearReturnTimer()
        updateState("scrolled")
        return
      }

      if (hasPassedHeader && stateRef.current !== "scrolled") {
        clearReturnTimer()
        updateState("scrolled")
        return
      }

      if (isAtTop && stateRef.current === "scrolled") {
        updateState("returning")
        returnTimer.current = setTimeout(() => {
          updateState("top")
          returnTimer.current = null
        }, 260)
      }
    }

    const scheduleUpdate = () => {
      if (frame.current !== null) {
        return
      }

      frame.current = window.requestAnimationFrame(() => {
        frame.current = null
        updateHeader()
      })
    }

    updateHeader()
    window.addEventListener("scroll", scheduleUpdate, { passive: true })
    window.addEventListener("touchmove", scheduleUpdate, { passive: true })
    window.addEventListener("touchend", scheduleUpdate, { passive: true })
    window.addEventListener("resize", scheduleUpdate)
    window.addEventListener("orientationchange", scheduleUpdate)
    window.addEventListener("pageshow", scheduleUpdate)
    document.addEventListener("scroll", scheduleUpdate, {
      passive: true,
      capture: true,
    })
    window.visualViewport?.addEventListener("scroll", scheduleUpdate, {
      passive: true,
    })
    window.visualViewport?.addEventListener("resize", scheduleUpdate)


    return () => {
      clearReturnTimer()
      if (frame.current !== null) {
        window.cancelAnimationFrame(frame.current)
      }
      window.removeEventListener("scroll", scheduleUpdate)
      window.removeEventListener("touchmove", scheduleUpdate)
      window.removeEventListener("touchend", scheduleUpdate)
      window.removeEventListener("resize", scheduleUpdate)
      window.removeEventListener("orientationchange", scheduleUpdate)
      window.removeEventListener("pageshow", scheduleUpdate)
      document.removeEventListener("scroll", scheduleUpdate, true)
      window.visualViewport?.removeEventListener("scroll", scheduleUpdate)
      window.visualViewport?.removeEventListener("resize", scheduleUpdate)
    }
  }, [])

  return (
    <div
      ref={shellRef}
      className={`sg-header-shell sg-header-shell--${state}`}
      data-state={state}
    >
      <div
        className="sg-header-layer sg-header-layer--green"
        aria-hidden={state === "scrolled" || undefined}
      >
        {children}
      </div>
      <div
        className="sg-header-layer sg-header-layer--white"
        aria-hidden={state !== "scrolled" || undefined}
      >
        {children}
      </div>
    </div>
  )
}
