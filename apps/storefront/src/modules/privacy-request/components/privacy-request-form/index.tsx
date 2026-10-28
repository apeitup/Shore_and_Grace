"use client"

import {
  PrivacyRequestInput,
  PrivacyRequestReceipt,
  submitPrivacyRequest,
} from "@lib/data/privacy-requests"
import BrandButton from "@modules/brand/components/button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import NativeSelect from "@modules/common/components/native-select"
import { FormEvent, useState } from "react"

const requestTypes = [
  ["access", "Access my information"],
  ["correction", "Correct inaccurate information"],
  ["deletion", "Delete information where applicable"],
  ["restriction", "Restrict how information is used"],
  ["objection", "Object to processing"],
  ["portability", "Receive portable account information"],
] as const

const requesterTypes = [
  ["customer", "Customer or account holder"],
  ["gift_recipient", "Gift recipient"],
  ["visitor", "Website visitor or other person"],
] as const

type PrivacyRequestInitialValues = {
  name: string
  email: string
  phone: string
}

export default function PrivacyRequestForm({
  initialValues,
}: {
  initialValues?: PrivacyRequestInitialValues
}) {
  const [receipt, setReceipt] = useState<PrivacyRequestReceipt | null>(null)
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    setSubmitting(true)
    setError("")

    try {
      const result = await submitPrivacyRequest({
        request_type: data.get(
          "request_type"
        ) as PrivacyRequestInput["request_type"],
        requester_type: data.get(
          "requester_type"
        ) as PrivacyRequestInput["requester_type"],
        name: String(data.get("name") || ""),
        email: String(data.get("email") || ""),
        phone: String(data.get("phone") || "") || null,
        order_reference: String(data.get("order_reference") || "") || null,
        details: String(data.get("details") || "") || null,
        privacy_notice_accepted: true,
        website: String(data.get("website") || ""),
      })
      setReceipt(result)
      form.reset()
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "We could not submit your request. Please try again."
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (receipt) {
    return (
      <div className="sg-privacy-request__receipt" role="status">
        <h2>We have received your request</h2>
        <p>
          Your reference is <strong>{receipt.reference}</strong>. Keep this
          reference if you contact us about the request.
        </p>
        <p>
          We aim to respond by{" "}
          <strong>
            {new Intl.DateTimeFormat("en-GB", { dateStyle: "long" }).format(
              new Date(receipt.due_at)
            )}
          </strong>
          . We may first ask for information needed to verify your identity.
        </p>
      </div>
    )
  }

  return (
    <form className="sg-privacy-request__form" onSubmit={handleSubmit}>
      <div className="sg-privacy-request__grid">
        <NativeSelect
          label="What would you like us to do?"
          name="request_type"
          required
          defaultValue="access"
        >
          {requestTypes.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </NativeSelect>
        <NativeSelect
          label="Who are you?"
          name="requester_type"
          required
          defaultValue="customer"
        >
          {requesterTypes.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </NativeSelect>
        <label>
          <span>Full name *</span>
          <input
            name="name"
            autoComplete="name"
            required
            maxLength={160}
            defaultValue={initialValues?.name}
          />
        </label>
        <label>
          <span>Email address *</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={320}
            defaultValue={initialValues?.email}
          />
        </label>
        <label>
          <span>Phone number</span>
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            maxLength={50}
            defaultValue={initialValues?.phone}
          />
        </label>
        <label>
          <span>Order number or reference</span>
          <input name="order_reference" maxLength={120} />
        </label>
        <label className="sg-privacy-request__wide">
          <span>Tell us what information or action your request relates to</span>
          <textarea name="details" rows={6} maxLength={5000} />
        </label>
      </div>
      <label className="sg-privacy-request__consent">
        <input type="checkbox" required />
        <span>
          I understand that Shore &amp; Grace will use these details to handle
          my request and may contact me to verify my identity. Read the{" "}
          <LocalizedClientLink href="/privacy">
            privacy policy
          </LocalizedClientLink>
          .
        </span>
      </label>
      <label className="sg-privacy-request__honeypot" aria-hidden="true">
        Website
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      {error && (
        <p className="sg-form-message sg-form-message--error" role="alert">
          {error}
        </p>
      )}
      <BrandButton type="submit" disabled={submitting}>
        {submitting ? "Submitting…" : "Submit privacy request"}
      </BrandButton>
    </form>
  )
}
