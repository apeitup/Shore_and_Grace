"use client"

import { HttpTypes } from "@medusajs/types"
import PaymentButton from "@modules/checkout/components/payment-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useSearchParams } from "next/navigation"
import { useState } from "react"

const CheckoutSummaryActions = ({ cart }: { cart: HttpTypes.StoreCart }) => {
  const searchParams = useSearchParams()
  const [termsAccepted, setTermsAccepted] = useState(false)
  const step = searchParams.get("step") || "address"

  if (!["address", "delivery", "payment", "review"].includes(step)) {
    return null
  }

  const isDelivery = step === "delivery"
  const isPayment = step === "payment"
  const isReview = step === "review"

  if (isReview) {
    return (
      <div className="sg-checkout-summary__actions">
        <label className="sg-checkout-summary__terms">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(event) => setTermsAccepted(event.target.checked)}
          />
          <span>I agree to the Terms &amp; Conditions</span>
        </label>
        <PaymentButton
          cart={cart}
          disabled={!termsAccepted}
          data-testid="submit-order-button"
        />
        <LocalizedClientLink href="/checkout?step=payment">
          Go back to payment
        </LocalizedClientLink>
      </div>
    )
  }

  return (
    <div className="sg-checkout-summary__actions">
      <button
        type="submit"
        form={
          isPayment
            ? "checkout-payment-form"
            : isDelivery
              ? "checkout-delivery-form"
              : "checkout-address-form"
        }
        disabled={isDelivery && !cart.shipping_methods?.length}
      >
        {isPayment
          ? "Continue to review"
          : isDelivery
            ? "Continue to payment"
            : "Continue to delivery"}
      </button>
      <LocalizedClientLink
        href={
          isPayment
            ? "/checkout?step=delivery"
            : isDelivery
              ? "/checkout?step=address"
              : "/cart"
        }
      >
        {isPayment
          ? "Go back to delivery"
          : isDelivery
            ? "Go back to details"
            : "Go back to cart"}
      </LocalizedClientLink>
    </div>
  )
}

export default CheckoutSummaryActions
