"use client"

import {
  ContactEnquiryInput,
  ContactEnquiryReceipt,
  submitContactEnquiry,
} from "@lib/data/contact-enquiries"
import BrandButton from "@modules/brand/components/button"
import Input from "@modules/common/components/input"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { FormEvent, useState } from "react"

export default function ContactForm() {
  const [receipt, setReceipt] = useState<ContactEnquiryReceipt | null>(null)
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    setSubmitting(true)
    setError("")

    try {
      const result = await submitContactEnquiry({
        name: `${String(data.get("first_name") || "")} ${String(
          data.get("last_name") || ""
        )}`.trim(),
        email: String(data.get("email") || ""),
        phone: String(data.get("phone") || "") || null,
        order_reference: null,
        category: "other" as ContactEnquiryInput["category"],
        message: `Subject: ${String(data.get("subject") || "")}\n\n${String(
          data.get("message") || ""
        )}`,
        privacy_notice_accepted: true,
        website: String(data.get("website") || ""),
      })
      setReceipt(result)
      form.reset()
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "We could not send your message. Please try again."
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (receipt) {
    return (
      <div className="sg-contact-form__receipt" role="status">
        <h2>Thank you for getting in touch</h2>
        <p>
          Your message reference is <strong>{receipt.reference}</strong>. We
          have also sent an acknowledgement to your email address.
        </p>
        <p>We aim to reply within two working days.</p>
      </div>
    )
  }

  return (
    <form className="sg-contact-form" onSubmit={handleSubmit}>
      <div className="sg-contact-form__grid">
        <Input
          label="First name"
          name="first_name"
          autoComplete="given-name"
          required
          maxLength={80}
        />
        <Input
          label="Last name"
          name="last_name"
          autoComplete="family-name"
          required
          maxLength={80}
        />
        <Input
          label="Email address"
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={320}
        />
        <Input
          label="Phone number"
          name="phone"
          type="tel"
          autoComplete="tel"
          maxLength={50}
        />
        <Input
          label="Subject"
          name="subject"
          required
          wrapperClassName="sg-contact-form__wide"
          maxLength={160}
        />
        <label className="sg-contact-form__message sg-contact-form__wide">
          <span>
            Message<span aria-hidden="true">*</span>
          </span>
          <textarea
            name="message"
            rows={7}
            minLength={10}
            maxLength={5000}
            required
          />
        </label>
      </div>
      <p className="sg-contact-form__privacy">
        We’ll only use your details to respond to your enquiry. Read our{" "}
        <LocalizedClientLink href="/privacy">
          Privacy Policy
        </LocalizedClientLink>
        .
      </p>
      <label className="sg-contact-form__honeypot" aria-hidden="true">
        Website
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      {error && (
        <p className="sg-form-message sg-form-message--error" role="alert">
          {error}
        </p>
      )}
      <BrandButton type="submit" disabled={submitting}>
        {submitting ? "Sending…" : "Send message"}
      </BrandButton>
    </form>
  )
}
