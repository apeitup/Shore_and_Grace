"use client"

import { useEffect, useRef, useState } from "react"

import { unsubscribeNewsletterSubscription } from "@lib/data/newsletter"
import BrandButton from "@modules/brand/components/button"

type UnsubscribeState = "loading" | "success" | "error"

type NewsletterUnsubscribeProps = {
  countryCode: string
  token: string
}

export default function NewsletterUnsubscribe({
  countryCode,
  token,
}: NewsletterUnsubscribeProps) {
  const [state, setState] = useState<UnsubscribeState>("loading")
  const requested = useRef(false)

  useEffect(() => {
    if (requested.current) {
      return
    }
    requested.current = true

    unsubscribeNewsletterSubscription(token)
      .then(() => setState("success"))
      .catch(() => setState("error"))
  }, [token])

  return (
    <section className="sg-newsletter-confirmation" aria-live="polite">
      {state === "loading" && (
        <>
          <p className="sg-newsletter-confirmation__eyebrow">
            Newsletter preferences
          </p>
          <h1>Updating your subscription…</h1>
          <p>Please wait while we update your email preferences.</p>
        </>
      )}
      {state === "success" && (
        <>
          <p className="sg-newsletter-confirmation__eyebrow">
            Preferences updated
          </p>
          <h1>You’ve been unsubscribed</h1>
          <p>
            We won’t send you newsletter emails. Essential emails about your
            orders and account are not affected.
          </p>
          <BrandButton href={`/${countryCode}/store`} tone="ink">
            Continue shopping
          </BrandButton>
        </>
      )}
      {state === "error" && (
        <>
          <p className="sg-newsletter-confirmation__eyebrow">
            We could not update your preferences
          </p>
          <h1>This unsubscribe link is invalid</h1>
          <p>
            Please use the complete link from your newsletter, or contact us
            and we’ll help update your preferences.
          </p>
          <BrandButton href={`/${countryCode}/contact`} variant="secondary">
            Contact us
          </BrandButton>
        </>
      )}
    </section>
  )
}
