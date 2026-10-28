"use client"

import { RadioGroup } from "@headlessui/react"
import { isManual, isPaypal, isStripeLike, paymentInfoMap } from "@lib/constants"
import { initiatePaymentSession, updateCart } from "@lib/data/cart"
import ErrorMessage from "@modules/checkout/components/error-message"
import PaymentContainer, {
  StripePaymentDetails,
} from "@modules/checkout/components/payment-container"
import CartTotals from "@modules/common/components/cart-totals"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Button, Heading } from "@modules/common/components/ui"
import { HttpTypes } from "@medusajs/types"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { ChangeEvent, FormEvent, useMemo, useState } from "react"

type BillingFields = {
  address_1: string
  address_2: string
  city: string
  province: string
  postal_code: string
  country_code: string
}

const addressFields = (address?: HttpTypes.StoreCartAddress | null): BillingFields => ({
  address_1: address?.address_1 || "",
  address_2: address?.address_2 || "",
  city: address?.city || "",
  province: address?.province || "",
  postal_code: address?.postal_code || "",
  country_code: address?.country_code || "",
})

const paymentDescription = (providerId: string) => {
  if (isPaypal(providerId)) return "Continue securely with PayPal"
  if (providerId.toLowerCase().includes("apple")) {
    return "Fast checkout using your saved wallet"
  }
  if (providerId.toLowerCase().includes("google")) {
    return "Fast checkout using your saved wallet"
  }
  if (isManual(providerId)) return "For testing purposes only"
  return "Visa, Mastercard and American Express"
}

const Payment = ({
  cart,
  availablePaymentMethods,
}: {
  cart: HttpTypes.StoreCart
  availablePaymentMethods: { id: string }[]
}) => {
  const activeSession = cart.payment_collection?.payment_sessions?.find(
    (session) => session.status === "pending"
  )
  const shippingBilling = useMemo(
    () => addressFields(cart.shipping_address),
    [cart.shipping_address]
  )
  const initialBilling = useMemo(
    () => addressFields(cart.billing_address),
    [cart.billing_address]
  )
  const initiallySame =
    !cart.billing_address?.address_1 ||
    JSON.stringify(shippingBilling) === JSON.stringify(initialBilling)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentComplete, setPaymentComplete] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    activeSession?.provider_id ?? availablePaymentMethods[0]?.id ?? ""
  )
  const [sameAsDelivery, setSameAsDelivery] = useState(initiallySame)
  const [billing, setBilling] = useState(
    initiallySame ? shippingBilling : initialBilling
  )
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const isOpen = searchParams.get("step") === "payment"
  const paidByGiftcard = !!(
    (cart as unknown as Record<string, unknown>)?.gift_cards &&
    ((cart as unknown as Record<string, unknown>)?.gift_cards as unknown[])?.length > 0 &&
    cart?.total === 0
  )

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    params.set(name, value)
    return params.toString()
  }

  const setPaymentMethod = async (method: string) => {
    setError(null)
    setSelectedPaymentMethod(method)
    if (isStripeLike(method)) {
      await initiatePaymentSession(cart, { provider_id: method })
      router.refresh()
    }
  }

  const updateBillingField = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setSameAsDelivery(false)
    setBilling((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }))
  }

  const toggleSameAsDelivery = (checked: boolean) => {
    setSameAsDelivery(checked)
    if (checked) setBilling(shippingBilling)
  }

  const handleSubmit = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault()
    setError(null)

    if (!selectedPaymentMethod && !paidByGiftcard) {
      setError("Select a payment method to continue.")
      return
    }

    setIsLoading(true)
    try {
      const address = sameAsDelivery ? shippingBilling : billing
      await updateCart({
        billing_address: {
          ...address,
          first_name:
            cart.billing_address?.first_name || cart.shipping_address?.first_name || "",
          last_name:
            cart.billing_address?.last_name || cart.shipping_address?.last_name || "",
          phone: cart.billing_address?.phone || cart.shipping_address?.phone || "",
        },
      })

      const hasSelectedSession = activeSession?.provider_id === selectedPaymentMethod
      if (!paidByGiftcard && !hasSelectedSession) {
        await initiatePaymentSession(cart, { provider_id: selectedPaymentMethod })
      }

      if (!isStripeLike(selectedPaymentMethod) || paymentComplete) {
        router.push(pathname + "?" + createQueryString("step", "review"), {
          scroll: false,
        })
        router.refresh()
      }
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : String(caughtError))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className={`sg-checkout-section sg-checkout-section--payment${isOpen ? " is-open" : ""}`}>
      <div className="sg-checkout-step-heading">
        <Heading level="h2">Payment</Heading>
      </div>

      {isOpen && (
        <form id="checkout-payment-form" className="sg-checkout-payment" onSubmit={handleSubmit}>
          <section className="sg-checkout-payment-card">
            <Heading level="h3">Payment method</Heading>
            <p>Select how you would like to pay.</p>
            {!paidByGiftcard ? (
              <RadioGroup
                className="sg-checkout-payment-options"
                value={selectedPaymentMethod}
                onChange={setPaymentMethod}
              >
                {availablePaymentMethods.map((method) => (
                  <PaymentContainer
                    key={method.id}
                    paymentInfoMap={paymentInfoMap}
                    paymentProviderId={method.id}
                    selectedPaymentOptionId={selectedPaymentMethod}
                    description={paymentDescription(method.id)}
                  />
                ))}
              </RadioGroup>
            ) : (
              <p>Gift card</p>
            )}
          </section>

          {isStripeLike(selectedPaymentMethod) && (
            <StripePaymentDetails
              setError={setError}
              setPaymentComplete={setPaymentComplete}
            />
          )}

          <section className="sg-checkout-payment-card sg-checkout-billing">
            <Heading level="h3">Billing address</Heading>
            <label className="sg-checkout-payment-check">
              <span className="sg-checkout-payment-checkbox">
                <input
                  type="checkbox"
                  checked={sameAsDelivery}
                  onChange={(event) => toggleSameAsDelivery(event.target.checked)}
                />
                {sameAsDelivery && <span>✓</span>}
              </span>
              Billing address is the same as the recipient&apos;s delivery address
            </label>
            <div className="sg-checkout-billing-grid">
              <label className="sg-checkout-payment-field">
                <span>Address line 1</span>
                <input name="address_1" autoComplete="billing address-line1" value={billing.address_1} onChange={updateBillingField} required />
              </label>
              <label className="sg-checkout-payment-field">
                <span>Address line 2</span>
                <input name="address_2" autoComplete="billing address-line2" value={billing.address_2} onChange={updateBillingField} />
              </label>
              <label className="sg-checkout-payment-field">
                <span>Town or city</span>
                <input name="city" autoComplete="billing address-level2" value={billing.city} onChange={updateBillingField} required />
              </label>
              <label className="sg-checkout-payment-field">
                <span>County</span>
                <input name="province" autoComplete="billing address-level1" value={billing.province} onChange={updateBillingField} />
              </label>
              <label className="sg-checkout-payment-field">
                <span>Postcode</span>
                <input name="postal_code" autoComplete="billing postal-code" value={billing.postal_code} onChange={updateBillingField} required />
              </label>
              <label className="sg-checkout-payment-field">
                <span>Country</span>
                <select name="country_code" autoComplete="billing country" value={billing.country_code} onChange={updateBillingField} required>
                  {cart.region?.countries?.map((country) => (
                    <option key={country.iso_2} value={country.iso_2}>{country.display_name}</option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          <ErrorMessage error={error} data-testid="payment-method-error-message" />

          <div className="sg-checkout-mobile-totals sg-checkout-payment-mobile-totals">
            <Heading level="h3">Order Summary</Heading>
            <CartTotals totals={cart} />
            <Button
              type="submit"
              size="large"
              isLoading={isLoading}
              disabled={(isStripeLike(selectedPaymentMethod) && !paymentComplete) || (!selectedPaymentMethod && !paidByGiftcard)}
              data-testid="submit-payment-button-mobile"
            >
              Continue to review
            </Button>
            <LocalizedClientLink href="/checkout?step=delivery">Go back to delivery</LocalizedClientLink>
          </div>
        </form>
      )}
    </section>
  )
}

export default Payment
