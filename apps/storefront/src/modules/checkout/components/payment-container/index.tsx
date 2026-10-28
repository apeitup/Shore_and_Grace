import { Radio as RadioGroupOption } from "@headlessui/react"
import { isManual } from "@lib/constants"
import SkeletonCardDetails from "@modules/skeletons/components/skeleton-card-details"
import { PaymentElement } from "@stripe/react-stripe-js"
import React, { useContext, type JSX } from "react"

import PaymentTest from "../payment-test"
import { StripeContext } from "../payment-wrapper/stripe-wrapper"

type PaymentContainerProps = {
  paymentProviderId: string
  selectedPaymentOptionId: string | null
  disabled?: boolean
  description?: string
  paymentInfoMap: Record<string, { title: string; icon: JSX.Element }>
}

const PaymentContainer: React.FC<PaymentContainerProps> = ({
  paymentProviderId,
  selectedPaymentOptionId,
  paymentInfoMap,
  disabled = false,
  description,
}) => {
  const checked = selectedPaymentOptionId === paymentProviderId
  const isDevelopment = process.env.NODE_ENV === "development"

  return (
    <RadioGroupOption
      value={paymentProviderId}
      disabled={disabled}
      className={`sg-checkout-payment-option${checked ? " is-selected" : ""}`}
    >
      <span className="sg-checkout-payment-radio" aria-hidden="true">
        {checked && <span />}
      </span>
      <span className="sg-checkout-payment-option__copy">
        <strong>
          {paymentInfoMap[paymentProviderId]?.title || paymentProviderId}
        </strong>
        <span>{description}</span>
        {isManual(paymentProviderId) && isDevelopment && (
          <PaymentTest className="sg-checkout-payment-test" />
        )}
      </span>
    </RadioGroupOption>
  )
}

export default PaymentContainer

export const StripePaymentDetails = ({
  setError,
  setPaymentComplete,
}: {
  setError: (error: string | null) => void
  setPaymentComplete: (complete: boolean) => void
}) => {
  const stripeReady = useContext(StripeContext)

  return (
    <section className="sg-checkout-payment-card sg-checkout-payment-details">
      <h3>Card details</h3>
      {stripeReady ? (
        <PaymentElement
          options={{ layout: "tabs" }}
          onChange={(event) => {
            setError(null)
            setPaymentComplete(event.complete)
          }}
          onLoadError={(event) => {
            setPaymentComplete(false)
            setError(event.error?.message ?? "Could not load the payment methods.")
          }}
        />
      ) : (
        <SkeletonCardDetails />
      )}
    </section>
  )
}
