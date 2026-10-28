import { listCartShippingMethods } from "@lib/data/fulfillment"
import { listCartPaymentMethods } from "@lib/data/payment"
import { HttpTypes } from "@medusajs/types"
import Addresses from "@modules/checkout/components/addresses"
import Payment from "@modules/checkout/components/payment"
import Review from "@modules/checkout/components/review"
import Shipping from "@modules/checkout/components/shipping"
import { CustomerPreferences } from "@lib/data/customer-preferences"
import CheckoutTracker from "@modules/analytics/components/checkout-tracker"
import { Suspense } from "react"

export default async function CheckoutForm({
  cart,
  customer,
  customerPreferences,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
  customerPreferences?: CustomerPreferences
}) {
  if (!cart) {
    return null
  }

  const shippingMethods = await listCartShippingMethods(cart.id)
  const paymentMethods = await listCartPaymentMethods(cart.region?.id ?? "")

  if (!shippingMethods || !paymentMethods) {
    return null
  }

  return (
    <div className="sg-checkout-form">
      <Suspense fallback={null}>
        <CheckoutTracker
          cartId={cart.id}
          cartValue={cart.total ?? 0}
          currencyCode={cart.currency_code}
          itemCount={(cart.items ?? []).reduce(
            (total, item) => total + item.quantity,
            0
          )}
          countryCode={cart.shipping_address?.country_code}
        />
      </Suspense>
      <Addresses cart={cart} customer={customer} />

      <Shipping
        cart={cart}
        availableShippingMethods={shippingMethods}
        customerPreferences={customerPreferences}
      />

      <Payment cart={cart} availablePaymentMethods={paymentMethods} />

      <Review cart={cart} />
    </div>
  )
}
