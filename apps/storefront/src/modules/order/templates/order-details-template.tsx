"use client"

import { HttpTypes } from "@medusajs/types"
import { convertToLocale } from "@lib/util/money"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"
import { NavArrowLeft, Package, Xmark } from "iconoir-react"

type OrderDetailsTemplateProps = { order: HttpTypes.StoreOrder }

const money = (order: HttpTypes.StoreOrder, amount: number | null | undefined) =>
  convertToLocale({ amount: amount || 0, currency_code: order.currency_code })

export default function OrderDetailsTemplate({ order }: OrderDetailsTemplateProps) {
  const address = order.shipping_address
  const placed = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(order.created_at))

  return (
    <div className="sg-order-detail" data-testid="order-details-container">
      <section className="sg-order-detail__summary">
        <header>
          <LocalizedClientLink href="/account/orders"><NavArrowLeft /><span>Back</span></LocalizedClientLink>
          <div>
            <h1>Order: #SG-{order.display_id}</h1>
            <p>Order placed: {placed} · {order.items?.length || 0} items</p>
          </div>
        </header>
        <div className="sg-order-detail__items">
          {order.items?.map((item) => (
            <article key={item.id}>
              <div className="sg-order-detail__image">
                {item.thumbnail ? <Image src={item.thumbnail} alt="" width={72} height={72} /> : null}
              </div>
              <div>
                <strong>{item.quantity} × {item.product_title || item.title}</strong>
                <span>Size: {item.variant_title || "Standard"}</span>
              </div>
              <strong>{money(order, item.total)}</strong>
            </article>
          ))}
        </div>
        <dl className="sg-order-detail__totals">
          <div><dt>Subtotal</dt><dd>{money(order, order.subtotal)}</dd></div>
          <div><dt>Discounts</dt><dd>{money(order, order.discount_total)}</dd></div>
          <div><dt>Postage & Packaging</dt><dd>{money(order, order.shipping_total)}</dd></div>
          <div><dt>Total</dt><dd>{money(order, order.total)}</dd></div>
          <p>Includes VAT where applicable</p>
        </dl>
      </section>

      <section className="sg-order-detail__card">
        <h2>Recipient</h2>
        <dl>
          <div><dt>Recipient:</dt><dd>{address?.first_name} {address?.last_name}</dd></div>
          <div><dt>Address:</dt><dd>{[address?.address_1, address?.address_2, address?.city, address?.province, address?.postal_code].filter(Boolean).join(", ")}</dd></div>
          <div><dt>Gift Message:</dt><dd>{String(order.metadata?.gift_message || "—")}</dd></div>
        </dl>
      </section>

      <section className="sg-order-detail__card sg-order-detail__action-card">
        <div><h2>Delivery details</h2><p>Delivery window and tracking information for this order.</p></div>
        <button type="button" className="sg-secondary-button"><Package />Track order</button>
      </section>

      <section className="sg-order-detail__card sg-order-detail__action-card">
        <div><h2>Payment receipt</h2><p>Paid {money(order, order.total)}. A receipt has been emailed to you.</p></div>
        <button type="button" className="sg-secondary-button"><Xmark />Cancel order</button>
      </section>
    </div>
  )
}
