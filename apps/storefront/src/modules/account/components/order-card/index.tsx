import { useMemo } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { NavArrowRight } from "iconoir-react"

type OrderCardProps = {
  order: HttpTypes.StoreOrder
}

const OrderCard = ({ order }: OrderCardProps) => {
  const numberOfLines = useMemo(() => {
    return (
      order.items?.reduce((acc, item) => {
        return acc + item.quantity
      }, 0) ?? 0
    )
  }, [order])

  const status = order.status || "pending"
  const statusLabel = status === "completed" ? "Delivered" : status === "canceled" ? "Cancelled" : "Processing"

  return (
    <LocalizedClientLink
      href={`/account/orders/details/${order.id}`}
      className="sg-account-order-card"
      data-testid="order-card"
    >
      <div className="sg-account-order-card__summary">
        <strong>#SG-<span data-testid="order-display-id">{order.display_id}</span></strong>
        <span data-testid="order-created-at">
          Order placed: {new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(order.created_at))} · {numberOfLines} {numberOfLines === 1 ? "item" : "items"}
        </span>
      </div>
      <span className={`sg-account-status sg-account-status--${statusLabel.toLowerCase()}`}>{statusLabel}</span>
      <strong className="sg-account-order-card__total" data-testid="order-amount">
        {convertToLocale({ amount: order.total, currency_code: order.currency_code })}
      </strong>
      <span className="sg-account-order-card__view">View <NavArrowRight /></span>
    </LocalizedClientLink>
  )
}

export default OrderCard
