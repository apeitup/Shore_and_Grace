import { Heading } from "@modules/common/components/ui"

import ItemsPreviewTemplate from "@modules/cart/templates/preview"
import DiscountCode from "@modules/checkout/components/discount-code"
import CartTotals from "@modules/common/components/cart-totals"
import { HttpTypes } from "@medusajs/types"
import CheckoutSummaryActions from "@modules/checkout/components/checkout-summary-actions"

const CheckoutSummary = ({ cart }: { cart: HttpTypes.StoreCart }) => {
  return (
    <aside className="sg-checkout-summary">
      <div className="sg-checkout-summary__card">
        <Heading
          level="h2"
          className="flex flex-row text-3xl-regular items-baseline"
        >
          Your order
        </Heading>
        <ItemsPreviewTemplate cart={cart} editable />
      </div>
      <div className="sg-checkout-summary__coupon">
        <DiscountCode cart={cart} />
      </div>
      <div className="sg-checkout-summary__card sg-checkout-summary__totals">
        <Heading level="h2">Order Summary</Heading>
        <CartTotals totals={cart} />
        <CheckoutSummaryActions cart={cart} />
      </div>
    </aside>
  )
}

export default CheckoutSummary
