"use client"

import { paymentInfoMap } from "@lib/constants"
import { convertToLocale } from "@lib/util/money"
import PaymentButton from "@modules/checkout/components/payment-button"
import DiscountCode from "@modules/checkout/components/discount-code"
import ItemsPreviewTemplate from "@modules/cart/templates/preview"
import CartTotals from "@modules/common/components/cart-totals"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Heading } from "@modules/common/components/ui"
import { HttpTypes } from "@medusajs/types"
import { CheckCircle } from "iconoir-react"
import { useSearchParams } from "next/navigation"
import { useState } from "react"

const addressLine = (address?: HttpTypes.StoreCartAddress | null) =>
  address
    ? [
        address.address_1,
        address.address_2,
        address.city,
        address.province,
        address.postal_code,
        address.country_code?.toUpperCase(),
      ]
        .filter(Boolean)
        .join(", ")
    : "Not provided"

const personName = (address?: HttpTypes.StoreCartAddress | null) =>
  [address?.first_name, address?.last_name].filter(Boolean).join(" ")

const Review = ({ cart }: { cart: HttpTypes.StoreCart }) => {
  const searchParams = useSearchParams()
  const [termsAccepted, setTermsAccepted] = useState(false)
  const isOpen = searchParams.get("step") === "review"
  const paidByGiftcard = !!(
    (cart as unknown as Record<string, unknown>)?.gift_cards &&
    ((cart as unknown as Record<string, unknown>)?.gift_cards as unknown[])?.length > 0 &&
    cart?.total === 0
  )
  const metadata = cart.metadata ?? {}
  const shippingMethod = cart.shipping_methods?.at(-1)
  const paymentProvider = cart.payment_collection?.payment_sessions?.at(-1)?.provider_id || ""
  const shippingPrice = shippingMethod?.amount
    ? convertToLocale({ amount: shippingMethod.amount, currency_code: cart.currency_code })
    : "FREE"

  return (
    <section className={`sg-checkout-section sg-checkout-section--review${isOpen ? " is-open" : ""}`}>
      <div className="sg-checkout-step-heading">
        <Heading level="h2">Review</Heading>
      </div>

      {isOpen && (
        <div className="sg-checkout-review">
          <section className="sg-checkout-review-card">
            <div className="sg-checkout-review-card__heading">
              <Heading level="h3">Customer &amp; recipient</Heading>
              <LocalizedClientLink href="/checkout?step=address">Edit</LocalizedClientLink>
            </div>
            <p className="sg-checkout-review-person">
              {personName(cart.billing_address)}
              <br />
              {cart.email}
              <br />
              {cart.billing_address?.phone}
            </p>
            <p className="sg-checkout-review-person">
              <span>For:</span>
              {personName(cart.shipping_address)}
              <br />
              {addressLine(cart.shipping_address)}
            </p>
          </section>

          <section className="sg-checkout-review-card">
            <div className="sg-checkout-review-card__heading">
              <Heading level="h3">Delivery</Heading>
              <LocalizedClientLink href="/checkout?step=delivery">Edit</LocalizedClientLink>
            </div>
            <p>{shippingMethod?.name || "Delivery"} · {shippingPrice}</p>
            {Boolean(metadata.delivery_instructions || metadata.leave_safe) && (
              <p>
                {metadata.delivery_instructions
                  ? String(metadata.delivery_instructions)
                  : "No delivery instructions"}
                {metadata.leave_safe ? " · Leave in a safe place if unavailable" : ""}
              </p>
            )}
            {Boolean(metadata.gift_message) && (
              <p>Gift message: “{String(metadata.gift_message)}”</p>
            )}
          </section>

          <section className="sg-checkout-review-card">
            <div className="sg-checkout-review-card__heading">
              <Heading level="h3">Payment &amp; billing</Heading>
              <LocalizedClientLink href="/checkout?step=payment">Edit</LocalizedClientLink>
            </div>
            <p>{paidByGiftcard ? "Gift card" : paymentInfoMap[paymentProvider]?.title || "Payment method selected"}</p>
            <p>Billing: {addressLine(cart.billing_address)}</p>
          </section>

          <section className="sg-checkout-review-card sg-checkout-review-order">
            <Heading level="h3">
              Your order ({cart.items?.length ?? 0} Items)
            </Heading>
            <ItemsPreviewTemplate cart={cart} editable />
          </section>

          <section className="sg-checkout-review-discount">
            <DiscountCode cart={cart} />
          </section>

          <section className="sg-checkout-review-card sg-checkout-review-before-pay">
            <Heading level="h3">Before you pay</Heading>
            <p>Check the recipient, delivery date and message carefully. Flowers are prepared specifically for this order.</p>
          </section>

          <section className="sg-checkout-mobile-totals sg-checkout-review-mobile-totals">
            <Heading level="h3">Order Summary</Heading>
            <CartTotals totals={cart} />
            <label className="sg-checkout-review-terms">
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
              data-testid="submit-order-button-mobile"
            >
              <CheckCircle aria-hidden="true" />
              Pay {convertToLocale({ amount: cart.total ?? 0, currency_code: cart.currency_code })}
            </PaymentButton>
            <LocalizedClientLink href="/checkout?step=payment">Go back to payment</LocalizedClientLink>
          </section>
        </div>
      )}
    </section>
  )
}

export default Review
