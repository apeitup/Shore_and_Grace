"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { NavArrowLeft } from "iconoir-react"
import { usePathname } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

export const COOKIE_CONSENT_EVENT = "sg:open-cookie-preferences"
export const COOKIE_CONSENT_CHANGED_EVENT = "sg:cookie-consent-changed"
const COOKIE_NAME = "sg_cookie_consent"
const CONSENT_VERSION = 2

export type CookieConsent = {
  version: number
  essential: true
  personalisation: boolean
  analytics: boolean
  marketing: boolean
  updatedAt: string
}

type OptionalConsent = Pick<
  CookieConsent,
  "personalisation" | "analytics" | "marketing"
>

const optionalDefaults: OptionalConsent = {
  personalisation: false,
  analytics: false,
  marketing: false,
}

const isPolicyPath = (pathname: string) =>
  /\/(?:cookies|privacy)\/?$/.test(pathname)

function PolicyLinks({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="sg-cookie-modal__policy-links">
      <LocalizedClientLink
        href="/cookies?from=cookie-settings"
        onClick={onNavigate}
      >
        Cookie Policy
      </LocalizedClientLink>
      <span aria-hidden="true">·</span>
      <LocalizedClientLink
        href="/privacy?from=cookie-settings"
        onClick={onNavigate}
      >
        Privacy Policy
      </LocalizedClientLink>
    </div>
  )
}

const readConsent = (): CookieConsent | null => {
  const value = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${COOKIE_NAME}=`))
    ?.slice(COOKIE_NAME.length + 1)
  if (!value) return null
  try {
    const parsed = JSON.parse(decodeURIComponent(value)) as CookieConsent
    return parsed.version === CONSENT_VERSION ? parsed : null
  } catch {
    return null
  }
}

export const hasPersonalisationConsent = () =>
  readConsent()?.personalisation === true

export const hasAnalyticsConsent = () => readConsent()?.analytics === true

const writeConsent = (optional: OptionalConsent) => {
  const consent: CookieConsent = {
    version: CONSENT_VERSION,
    essential: true,
    ...optional,
    updatedAt: new Date().toISOString(),
  }
  const secure = window.location.protocol === "https:" ? "; Secure" : ""
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(
    JSON.stringify(consent),
  )}; Path=/; Max-Age=15552000; SameSite=Lax${secure}`
  document.documentElement.dataset.cookiePersonalisation = String(
    consent.personalisation,
  )
  document.documentElement.dataset.cookieAnalytics = String(consent.analytics)
  document.documentElement.dataset.cookieMarketing = String(consent.marketing)
  if (!consent.personalisation) {
    window.localStorage.removeItem("sg-recently-viewed-products")
  }
  window.dispatchEvent(
    new CustomEvent(COOKIE_CONSENT_CHANGED_EVENT, { detail: consent }),
  )
}

function ConsentSwitch({
  checked,
  disabled,
  onChange,
  label,
}: {
  checked: boolean
  disabled?: boolean
  onChange?: (checked: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-label={label}
      aria-checked={checked}
      disabled={disabled}
      className="sg-cookie-switch"
      onClick={() => onChange?.(!checked)}
    >
      <span />
    </button>
  )
}

export default function CookieConsentModal() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<"first" | "preferences">("first")
  const [hasSavedConsent, setHasSavedConsent] = useState(false)
  const [optional, setOptional] = useState<OptionalConsent>(optionalDefaults)

  const openPreferences = useCallback(() => {
    const saved = readConsent()
    setHasSavedConsent(Boolean(saved))
    setOptional(
      saved
        ? {
            personalisation: saved.personalisation,
            analytics: saved.analytics,
            marketing: saved.marketing,
          }
        : optionalDefaults,
    )
    setView("preferences")
    setOpen(true)
  }, [])

  useEffect(() => {
    const saved = readConsent()
    let timer: number | undefined
    if (saved) {
      timer = window.setTimeout(() => {
        setHasSavedConsent(true)
        setOptional({
          personalisation: saved.personalisation,
          analytics: saved.analytics,
          marketing: saved.marketing,
        })
      }, 0)
      document.documentElement.dataset.cookiePersonalisation = String(
        saved.personalisation,
      )
      document.documentElement.dataset.cookieAnalytics = String(saved.analytics)
      document.documentElement.dataset.cookieMarketing = String(saved.marketing)
    } else if (!isPolicyPath(pathname)) {
      timer = window.setTimeout(() => setOpen(true), 0)
    } else {
      timer = window.setTimeout(() => setOpen(false), 0)
    }
    window.addEventListener(COOKIE_CONSENT_EVENT, openPreferences)
    return () => {
      if (timer) window.clearTimeout(timer)
      window.removeEventListener(COOKIE_CONSENT_EVENT, openPreferences)
    }
  }, [openPreferences, pathname])

  useEffect(() => {
    if (!open) return
    const priorOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && hasSavedConsent) setOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => {
      document.body.style.overflow = priorOverflow
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [hasSavedConsent, open])

  const save = (next: OptionalConsent) => {
    writeConsent(next)
    setOptional(next)
    setHasSavedConsent(true)
    setOpen(false)
  }

  if (!open) return null

  return (
    <div className="sg-cookie-mask" role="presentation">
      <section
        className="sg-cookie-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sg-cookie-title"
      >
        {view === "first" ? (
          <>
            <p className="sg-cookie-modal__eyebrow">YOUR PRIVACY</p>
            <h2 id="sg-cookie-title">A thoughtful note about cookies</h2>
            <p className="sg-cookie-modal__intro">
              We use essential cookies to keep Shore &amp; Grace working. With
              your permission, optional cookies help us remember preferences,
              understand visits and make recommendations more relevant.
            </p>
            <div className="sg-cookie-modal__divider" />
            <div className="sg-cookie-modal__first-actions">
              <button
                type="button"
                className="sg-cookie-button sg-cookie-button--outline"
                onClick={() => save(optionalDefaults)}
              >
                Decline
              </button>
              <button
                type="button"
                className="sg-cookie-button sg-cookie-button--primary"
                onClick={() =>
                  save({
                    personalisation: true,
                    analytics: true,
                    marketing: true,
                  })
                }
              >
                Accept all
              </button>
            </div>
            <button
              type="button"
              className="sg-cookie-button sg-cookie-button--text"
              onClick={openPreferences}
            >
              Manage preferences
            </button>
            <PolicyLinks onNavigate={() => setOpen(false)} />
          </>
        ) : (
          <>
            <button
              type="button"
              className="sg-cookie-modal__back"
              onClick={() =>
                hasSavedConsent ? setOpen(false) : setView("first")
              }
            >
              <NavArrowLeft aria-hidden="true" />
              COOKIE PREFERENCES
            </button>
            <h2 id="sg-cookie-title">Choose what feels right</h2>
            <p className="sg-cookie-modal__intro">
              Essential cookies are always active. You can choose whether Shore
              &amp; Grace uses optional cookies below.
            </p>
            <div className="sg-cookie-modal__preference-list">
              <div className="sg-cookie-modal__preference">
                <div>
                  <strong>Essential cookies</strong>
                  <span>Required for baskets, checkout and security.</span>
                </div>
                <ConsentSwitch
                  checked
                  disabled
                  label="Essential cookies always on"
                />
              </div>
              {(
                [
                  [
                    "personalisation",
                    "Personalisation",
                    "Remember preferences and recently viewed flowers.",
                  ],
                  [
                    "analytics",
                    "Analytics",
                    "Help us understand how the website is used.",
                  ],
                  [
                    "marketing",
                    "Marketing",
                    "Measure campaigns and show relevant offers.",
                  ],
                ] as const
              ).map(([key, title, description]) => (
                <div className="sg-cookie-modal__preference" key={key}>
                  <div>
                    <strong>{title}</strong>
                    <span>{description}</span>
                  </div>
                  <ConsentSwitch
                    checked={optional[key]}
                    label={`${title} cookies`}
                    onChange={(checked) =>
                      setOptional((current) => ({ ...current, [key]: checked }))
                    }
                  />
                </div>
              ))}
            </div>
            <div className="sg-cookie-modal__preference-actions">
              <button
                type="button"
                className="sg-cookie-button sg-cookie-button--primary"
                onClick={() => save(optional)}
              >
                Save preferences
              </button>
              <button
                type="button"
                className="sg-cookie-button sg-cookie-button--outline"
                onClick={() =>
                  save({
                    personalisation: true,
                    analytics: true,
                    marketing: true,
                  })
                }
              >
                Accept all
              </button>
            </div>
            <PolicyLinks onNavigate={() => setOpen(false)} />
          </>
        )}
      </section>
    </div>
  )
}
