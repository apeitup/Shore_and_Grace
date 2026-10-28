"use client"

import { FormEvent, useState } from "react"
import {
  FloristDeliveryOption,
  getFloristDeliveryOptions,
} from "@lib/data/florist-delivery"

const DeliveryChecker = () => {
  const [postcode, setPostcode] = useState("")
  const [checkedPostcode, setCheckedPostcode] = useState("")
  const [options, setOptions] = useState<FloristDeliveryOption[]>([])
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const value = postcode.trim()
    if (value) {
      setIsLoading(true)
      setError("")
      try {
        const result = await getFloristDeliveryOptions(value, "delivery")
        setCheckedPostcode(value)
        setOptions(result.options)
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : String(reason))
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <section className="sg-cart-delivery-checker">
      <h2>Check delivery</h2>
      <p>Enter the recipient postcode to check delivery options and costs.</p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={postcode}
          onChange={(event) => setPostcode(event.target.value)}
          placeholder="Delivery postcode"
          aria-label="Delivery postcode"
          required
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Checking…" : "Check"}
        </button>
      </form>
      {error && <small role="alert">{error}</small>}
      {checkedPostcode && !error && options.length === 0 && (
        <small>We do not currently deliver to {checkedPostcode}.</small>
      )}
      {checkedPostcode && options[0]?.dates[0] && (
        <small>
          Delivery is available to {checkedPostcode}. The next date is{" "}
          {new Intl.DateTimeFormat("en-GB", {
            weekday: "short",
            day: "numeric",
            month: "short",
          }).format(new Date(`${options[0].dates[0]?.date}T12:00:00`))}.
        </small>
      )}
    </section>
  )
}

export default DeliveryChecker
