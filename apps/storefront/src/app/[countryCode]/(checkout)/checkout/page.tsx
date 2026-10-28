import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import PaymentWrapper from "@modules/checkout/components/payment-wrapper"
import CheckoutForm from "@modules/checkout/templates/checkout-form"
import CheckoutSummary from "@modules/checkout/templates/checkout-summary"
import CheckoutProgress from "@modules/checkout/components/checkout-progress"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { retrieveCustomerPreferences } from "@lib/data/customer-preferences"

export const metadata: Metadata = {
  title: "Checkout",
}

export default async function Checkout() {
  const cart = await retrieveCart()

  if (!cart) {
    return notFound()
  }

  const customer = await retrieveCustomer()
  const customerPreferences = customer
    ? await retrieveCustomerPreferences()
    : undefined

  return (
    <div className="content-container sg-checkout-shell">
      <CheckoutProgress />
      <div className="sg-checkout-layout">
        <PaymentWrapper cart={cart}>
          <CheckoutForm
            cart={cart}
            customer={customer}
            customerPreferences={customerPreferences}
          />
        </PaymentWrapper>
        <CheckoutSummary cart={cart} />
      </div>
    </div>
  )
}
