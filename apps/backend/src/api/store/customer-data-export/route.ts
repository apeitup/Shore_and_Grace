import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { CUSTOMER_PREFERENCES_MODULE } from "../../../modules/customer-preferences"
import CustomerPreferencesModuleService from "../../../modules/customer-preferences/service"
import { PRODUCT_REVIEW_MODULE } from "../../../modules/product-review"
import ProductReviewModuleService from "../../../modules/product-review/service"
import { SPECIAL_OCCASION_MODULE } from "../../../modules/special-occasion"
import SpecialOccasionModuleService from "../../../modules/special-occasion/service"
import { WISHLIST_MODULE } from "../../../modules/wishlist"
import WishlistModuleService from "../../../modules/wishlist/service"
import { GIFT_ORDER_MODULE } from "../../../modules/gift-order"
import GiftOrderModuleService from "../../../modules/gift-order/service"
import { FLORIST_DELIVERY_MODULE } from "../../../modules/florist-delivery"
import FloristDeliveryModuleService from "../../../modules/florist-delivery/service"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const customerId = req.auth_context.actor_id
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const preferencesService: CustomerPreferencesModuleService =
    req.scope.resolve(CUSTOMER_PREFERENCES_MODULE)
  const wishlistService: WishlistModuleService = req.scope.resolve(
    WISHLIST_MODULE
  )
  const occasionService: SpecialOccasionModuleService = req.scope.resolve(
    SPECIAL_OCCASION_MODULE
  )
  const reviewService: ProductReviewModuleService = req.scope.resolve(
    PRODUCT_REVIEW_MODULE
  )
  const giftOrderService: GiftOrderModuleService = req.scope.resolve(
    GIFT_ORDER_MODULE
  )
  const deliveryService: FloristDeliveryModuleService = req.scope.resolve(
    FLORIST_DELIVERY_MODULE
  )

  const customerResult = await query.graph({
    entity: "customer",
    fields: [
      "id",
      "email",
      "first_name",
      "last_name",
      "phone",
      "created_at",
      "updated_at",
      "metadata",
      "addresses.*",
      "orders.*",
      "orders.items.*",
      "orders.shipping_address.*",
      "orders.billing_address.*",
    ],
    filters: { id: customerId },
  })
  const customer = customerResult.data[0] ?? null
  const orderIds = (customer?.orders ?? []).flatMap((order) =>
    order?.id ? [order.id] : []
  )

  const [
    preferences,
    wishlist,
    occasions,
    reviews,
    giftOrders,
    deliveryReservations,
  ] = await Promise.all([
      preferencesService.listCustomerPreferences({ customer_id: customerId }),
      wishlistService.listWishlistItems({ customer_id: customerId }),
      occasionService.listCustomerOccasions({ customer_id: customerId }),
      reviewService.listReviews({ customer_id: customerId }),
      orderIds.length
        ? giftOrderService.listGiftOrderDetails({ order_id: orderIds })
        : [],
      orderIds.length
        ? deliveryService.listDeliveryReservations({ order_id: orderIds })
        : [],
    ])

  res.json({
    export_version: "2",
    exported_at: new Date().toISOString(),
    customer,
    preferences: preferences[0] ?? null,
    wishlist,
    occasions,
    reviews,
    gift_orders: giftOrders,
    delivery_reservations: deliveryReservations,
    retention_note:
      "Order, payment, delivery and gift-recipient records may be retained where required for accounting, legal claims and delivery evidence.",
  })
}
