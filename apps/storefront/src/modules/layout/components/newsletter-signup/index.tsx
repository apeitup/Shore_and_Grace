"use client"

import { FormEvent, useState } from "react"

import { requestNewsletterSubscription } from "@lib/data/newsletter"
import BrandButton from "@modules/brand/components/button"
import BrandTextInput from "@modules/brand/components/text-input"

type FormState = "idle" | "submitting" | "success" | "error"

export default function NewsletterSignup() {
  const [state, setState] = useState<FormState>("idle")
  const [message, setMessage] = useState("")

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const email = String(formData.get("email") || "").trim()

    if (!email) {
      setState("error")
      setMessage("Enter your email address.")
      return
    }

    setState("submitting")
    setMessage("")

    try {
      const newsletter = await requestNewsletterSubscription(email)
      setState("success")
      setMessage(newsletter.message)
      form.reset()
    } catch {
      setState("error")
      setMessage("We could not start your subscription. Please try again.")
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <BrandTextInput
        label="Email address"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="Enter your email address"
        required
        disabled={state === "submitting"}
      />
      <BrandButton
        type="submit"
        tone="ink"
        disabled={state === "submitting"}
      >
        {state === "submitting" ? "Subscribing…" : "Subscribe"}
      </BrandButton>
      {message && (
        <p
          className={`sg-newsletter-status is-${state}`}
          role={state === "error" ? "alert" : "status"}
          aria-live="polite"
        >
          {message}
        </p>
      )}
    </form>
  )
}
