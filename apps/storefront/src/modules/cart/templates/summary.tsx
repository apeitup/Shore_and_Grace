"use client"

import { Heading } from "@modules/common/components/ui"

import BrandButton from "@modules/brand/components/button"
import CartTotals from "@modules/common/components/cart-totals"
import { HttpTypes } from "@medusajs/types"

type SummaryProps = {
  cart: HttpTypes.StoreCart
}

function getCheckoutStep(cart: HttpTypes.StoreCart) {
  if (!cart?.shipping_address?.address_1 || !cart.email) {
    return "address"
  } else if (cart?.shipping_methods?.length === 0) {
    return "delivery"
  } else {
    return "payment"
  }
}

const Summary = ({ cart }: SummaryProps) => {
  const step = getCheckoutStep(cart)

  return (
    <div className="sg-cart-summary">
      <Heading level="h2" className="sg-cart-summary__title">
        Cart Totals
      </Heading>
      <CartTotals totals={cart} />
      <div className="sg-cart-summary__actions">
        <BrandButton
          href="/store"
          variant="secondary"
          className="sg-cart-summary__continue"
        >
          Continue shopping
        </BrandButton>
        <BrandButton
          href={"/checkout?step=" + step}
          variant="primary"
          className="sg-cart-summary__checkout"
          data-testid="checkout-button"
        >
          Proceed to checkout
        </BrandButton>
      </div>
    </div>
  )
}

export default Summary
