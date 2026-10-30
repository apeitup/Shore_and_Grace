"use client"

import { useEffect, useRef, useState } from "react"

import { confirmNewsletterSubscription } from "@lib/data/newsletter"
import BrandButton from "@modules/brand/components/button"

type ConfirmationState = "loading" | "success" | "error"

export default function NewsletterConfirmation({ token }: { token: string }) {
  const [state, setState] = useState<ConfirmationState>("loading")
  const requested = useRef(false)

  useEffect(() => {
    if (requested.current) {
      return
    }
    requested.current = true

    confirmNewsletterSubscription(token)
      .then(() => setState("success"))
      .catch(() => setState("error"))
  }, [token])

  return (
    <section className="sg-newsletter-confirmation" aria-live="polite">
      {state === "loading" && (
        <>
          <p className="sg-newsletter-confirmation__eyebrow">
            Newsletter subscription
          </p>
          <h1>Confirming your subscription…</h1>
          <p>Please wait while we confirm your email address.</p>
        </>
      )}
      {state === "success" && (
        <>
          <p className="sg-newsletter-confirmation__eyebrow">You’re subscribed</p>
          <h1>Welcome to Shore &amp; Grace</h1>
          <p>
            Your email address is confirmed. We’ll share studio news,
            thoughtful inspiration and occasional offers.
          </p>
          <BrandButton href="/store" tone="ink">
            Explore our collection
          </BrandButton>
        </>
      )}
      {state === "error" && (
        <>
          <p className="sg-newsletter-confirmation__eyebrow">
            We could not confirm your email
          </p>
          <h1>This link is invalid or has expired</h1>
          <p>
            Enter your email in the newsletter form again and we’ll send a new
            confirmation link.
          </p>
          <BrandButton href="/" variant="secondary">
            Return home
          </BrandButton>
        </>
      )}
    </section>
  )
}
