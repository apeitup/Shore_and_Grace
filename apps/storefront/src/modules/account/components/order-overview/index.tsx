"use client"

import { Button } from "@modules/common/components/ui"
import { Search, SortDown } from "iconoir-react"

import OrderCard from "../order-card"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

const OrderOverview = ({ orders }: { orders: HttpTypes.StoreOrder[] }) => {
  if (orders?.length) {
    return (
      <div className="sg-account-orders">
        <header className="sg-account-panel__header">
          <div>
            <h1>Your orders</h1>
            <p>{orders.length} {orders.length === 1 ? "order" : "orders"}</p>
          </div>
          <div className="sg-account-panel__tools" aria-label="Order tools">
            <button type="button"><Search /><span>Search</span></button>
            <button type="button"><SortDown /><span>Sort</span></button>
          </div>
        </header>
        <div className="sg-account-orders__list">
          {orders.map((order) => <OrderCard key={order.id} order={order} />)}
        </div>
      </div>
    )
  }

  return (
    <div
      className="sg-account-empty"
      data-testid="no-orders-container"
    >
      <h2>No orders yet</h2>
      <p>Your orders will appear here after checkout.</p>
      <div>
        <LocalizedClientLink href="/" passHref>
          <Button data-testid="continue-shopping-button">
            Continue shopping
          </Button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default OrderOverview
