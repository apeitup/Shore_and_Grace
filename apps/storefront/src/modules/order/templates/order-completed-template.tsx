import { Heading } from "@modules/common/components/ui"
import { cookies as nextCookies } from "next/headers"

import CartTotals from "@modules/common/components/cart-totals"
import Items from "@modules/order/components/items"
import OnboardingCta from "@modules/order/components/onboarding-cta"
import ShippingDetails from "@modules/order/components/shipping-details"
import PaymentDetails from "@modules/order/components/payment-details"
import { HttpTypes } from "@medusajs/types"
import ShopPageHero from "@modules/brand/components/shop-page-hero"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"
import { convertToLocale } from "@lib/util/money"
import CartRelatedProducts from "@modules/cart/components/cart-related-products"
import { getOrderPurchaserFirstName } from "@lib/util/checkout-parties"

type OrderCompletedTemplateProps = {
  order: HttpTypes.StoreOrder
}

export default async function OrderCompletedTemplate({
  order,
}: OrderCompletedTemplateProps) {
  const cookies = await nextCookies()

  const isOnboarding = cookies.get("_medusa_onboarding")?.value === "true"
  const firstName = getOrderPurchaserFirstName(order)
  const formattedTotal = convertToLocale({
    amount: order.total,
    currency_code: order.currency_code,
  })
  const metadata = order.metadata ?? {}
  const shippingMethod = order.shipping_methods?.[0]
  const shippingPrice = convertToLocale({
    amount: shippingMethod?.total ?? 0,
    currency_code: order.currency_code,
  })

  return (
    <div className="sg-order-confirmation">
      <ShopPageHero
        title="Order confirmed"
        trail={[
          { label: "Shop", href: "/store" },
          { label: "Cart", href: "/cart" },
          { label: "Checkout", href: "/checkout" },
          { label: "Order confirmed" },
        ]}
      />
      <div className="content-container sg-order-confirmation__content">
        {isOnboarding && <OnboardingCta orderId={order.id} />}
        <div className="sg-order-confirmation__progress" aria-label="Order complete">
          <p>Order complete</p>
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </div>
        <header className="sg-order-confirmation__intro">
          <Heading level="h1">Thank you{firstName ? `, ${firstName}` : ""}</Heading>
          <div className="sg-order-confirmation__ornament" aria-hidden="true">
            <span />
            <Image
              src="/assets/shop/confirmation-heart.svg"
              alt=""
              width={40}
              height={40}
            />
            <span />
          </div>
          <p>
            Your order is confirmed.<br />We&apos;ve sent the details to <span data-testid="order-email">{order.email}</span>.
          </p>
          <strong data-testid="order-id">Order #{order.display_id}</strong>
        </header>

        <div className="sg-order-confirmation__mobile-summary">
          <p><span>Order number:</span><strong>#{order.display_id}</strong></p>
          <p><span>Total paid:</span><strong>{formattedTotal}</strong></p>
        </div>

        <section className="sg-order-confirmation__card sg-order-confirmation__mobile-delivery">
          <Heading level="h2">Delivery</Heading>
          <p>
            {shippingMethod?.name || "Delivery"}
            <br />
            {shippingPrice}
          </p>
          <p>
            <span>For:</span>
            {order.shipping_address?.first_name} {order.shipping_address?.last_name}
            <br />
            {[
              order.shipping_address?.address_1,
              order.shipping_address?.address_2,
              order.shipping_address?.city,
              order.shipping_address?.postal_code,
              order.shipping_address?.country_code?.toUpperCase(),
            ]
              .filter(Boolean)
              .join(", ")}
          </p>
          {Boolean(metadata.gift_message) && (
            <p>
              <span>Gift message:</span>
              “{String(metadata.gift_message)}”
            </p>
          )}
        </section>

        <div className="sg-order-confirmation__layout" data-testid="order-complete-container">
          <div className="sg-order-confirmation__details">
            <section className="sg-order-confirmation__card sg-order-confirmation__order">
              <Heading level="h2">Your order</Heading>
              <Items order={order} />
              <CartTotals totals={order} />
            </section>
            <section className="sg-order-confirmation__card">
              <ShippingDetails order={order} />
            </section>
            <section className="sg-order-confirmation__card">
              <PaymentDetails order={order} />
            </section>
          </div>

          <aside className="sg-order-confirmation__account">
            <Heading level="h2">Keep everything in one place</Heading>
            <p>Create an account using this email address. Your completed order will be linked automatically.</p>
            <ul>
              <li>Track this delivery</li>
              <li>View previous orders</li>
              <li>Save flowers to your wishlist</li>
              <li>Check out faster next time</li>
            </ul>
            <small>Your order is already confirmed. Creating an account is optional.</small>
            <LocalizedClientLink className="sg-order-confirmation__primary" href="/account">
              Create my account
            </LocalizedClientLink>
            <LocalizedClientLink className="sg-order-confirmation__secondary" href="/store">
              Continue shopping
            </LocalizedClientLink>
            <small>Prefer not to create an account? Use the secure tracking link in your confirmation email.</small>
          </aside>
        </div>
      </div>
      <CartRelatedProducts
        countryCode={order.shipping_address?.country_code || "gb"}
      />
    </div>
  )
}
