import ItemsTemplate from "./items"
import Summary from "./summary"
import EmptyCartMessage from "../components/empty-cart-message"
import DiscountCode from "@modules/checkout/components/discount-code"
import CartRelatedProducts from "@modules/cart/components/cart-related-products"
import DeliveryChecker from "@modules/cart/components/delivery-checker"
import { HttpTypes } from "@medusajs/types"
import ShopPageHero from "@modules/brand/components/shop-page-hero"

const CartTemplate = ({
  cart,
  countryCode,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
  countryCode: string
}) => {
  return (
    <div className="sg-cart-page">
      <ShopPageHero
        title="Shopping Cart"
        trail={[
          { label: "Shop", href: "/store" },
          { label: "Cart" },
        ]}
      />
      <div className="content-container sg-cart-content" data-testid="cart-container">
        {cart?.items?.length ? (
          <div className="sg-cart-layout">
            <div className="sg-cart-items">
              <ItemsTemplate cart={cart} />
            </div>
            <div className="sg-cart-checkout-row">
              <div className="sg-cart-coupon-card">
                <h2>Coupon code</h2>
                <DiscountCode
                  cart={cart}
                  openByDefault
                  submitLabel="Apply coupon"
                  desktopSubmitLabel="Apply"
                  inputLabel="Coupon code"
                />
              </div>
              <DeliveryChecker />
              <div className="sg-cart-summary-wrap">
                <div className="sg-cart-summary-sticky">
                  {cart && cart.region && (
                    <div className="sg-cart-summary-card">
                      <Summary cart={cart} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <EmptyCartMessage />
          </div>
        )}
      </div>
      <CartRelatedProducts countryCode={countryCode} />
    </div>
  )
}

export default CartTemplate
