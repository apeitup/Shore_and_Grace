import { Metadata } from "next"

import Overview from "@modules/account/components/overview"
import { notFound } from "next/navigation"
import { retrieveCustomer } from "@lib/data/customer"
import { listOrders } from "@lib/data/orders"
import { listOccasions } from "@lib/data/occasions"
import { listProducts } from "@lib/data/products"
import { listWishlist } from "@lib/data/wishlist"

export const metadata: Metadata = {
  title: "Account",
  description: "Overview of your account activity.",
}

export default async function OverviewTemplate({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params
  const [customer, orders, wishlist, occasions] = await Promise.all([
    retrieveCustomer().catch(() => null),
    listOrders().catch(() => null),
    listWishlist().catch(() => []),
    listOccasions().catch(() => ({
      system_occasions: [],
      customer_occasions: [],
    })),
  ])

  if (!customer) {
    notFound()
  }

  const wishlistProductIds = wishlist.slice(0, 2).map((item) => item.product_id)
  const wishlistProducts = wishlistProductIds.length
    ? await listProducts({
        countryCode,
        queryParams: {
          id: wishlistProductIds,
          limit: wishlistProductIds.length,
        },
      })
        .then(({ response }) => response.products)
        .catch(() => [])
    : []

  const popularProducts = !orders?.length
    ? await listProducts({
        countryCode,
        queryParams: { limit: 3 },
      })
        .then(({ response }) => response.products.slice(0, 2))
        .catch(() => [])
    : []

  return (
    <Overview
      customer={customer}
      orders={orders || []}
      occasions={occasions.customer_occasions}
      systemOccasions={occasions.system_occasions}
      wishlistProducts={wishlistProducts}
      popularProducts={popularProducts}
    />
  )
}
