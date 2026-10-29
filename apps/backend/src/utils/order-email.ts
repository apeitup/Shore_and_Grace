import type { INotificationModuleService } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import type { MedusaContainer } from "@medusajs/framework/types"
import {
  renderOrderCancelledEmail,
  renderOrderConfirmationEmail,
  renderOrderDeliveredEmail,
  renderOrderDispatchedEmail,
  renderOrderPreparedEmail,
} from "../emails"
import type {
  EmailAddress,
  EmailContent,
  OrderConfirmationEmailData,
} from "../emails"
import { CUSTOMER_PREFERENCES_MODULE } from "../modules/customer-preferences"
import CustomerPreferencesModuleService from "../modules/customer-preferences/service"
import { FLORIST_DELIVERY_MODULE } from "../modules/florist-delivery"
import FloristDeliveryModuleService from "../modules/florist-delivery/service"
import { GIFT_ORDER_MODULE } from "../modules/gift-order"
import GiftOrderModuleService from "../modules/gift-order/service"

type OrderAddress = {
  first_name?: string | null
  last_name?: string | null
  address_1?: string | null
  address_2?: string | null
  city?: string | null
  province?: string | null
  postal_code?: string | null
  country_code?: string | null
  phone?: string | null
}

type OrderItem = {
  title?: string | null
  variant_title?: string | null
  quantity?: number | null
  unit_price?: number | null
  total?: number | null
  thumbnail?: string | null
}

type OrderRecord = {
  id: string
  customer_id?: string | null
  display_id?: number | string | null
  email?: string | null
  created_at?: string | Date | null
  currency_code?: string | null
  subtotal?: number | null
  shipping_total?: number | null
  total?: number | null
  items?: OrderItem[] | null
  shipping_address?: OrderAddress | null
  billing_address?: OrderAddress | null
  shipping_methods?: Array<{
    name?: string | null
  }> | null
}

type GiftOrderRecord = {
  recipient_first_name?: string | null
  recipient_last_name?: string | null
  recipient_phone?: string | null
  purchaser_first_name?: string | null
  purchaser_last_name?: string | null
  purchaser_email?: string | null
  gift_message?: string | null
  hide_prices?: boolean | null
}

type DeliveryRecord = {
  delivery_date?: string | null
  delivery_window?: string | null
  fulfillment_type?: "delivery" | "collection" | null
  zone_name?: string | null
}

const personName = (
  firstName?: string | null,
  lastName?: string | null,
  fallback = "there",
) => [firstName, lastName].filter(Boolean).join(" ") || fallback

const emailAddress = (address?: OrderAddress | null): EmailAddress => ({
  firstName: address?.first_name,
  lastName: address?.last_name,
  address1: address?.address_1,
  address2: address?.address_2,
  city: address?.city,
  province: address?.province,
  postalCode: address?.postal_code,
  country: address?.country_code?.toUpperCase(),
  phone: address?.phone,
})

const money = (amount: number | null | undefined, currency?: string | null) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: (currency || "GBP").toUpperCase(),
  }).format((amount || 0) / 100)

const formatDate = (date?: string | Date | null) => {
  if (!date) {
    return ""
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date))
}

const storefrontUrl = () =>
  (process.env.STOREFRONT_URL || "http://localhost:8000").replace(/\/$/, "")

const orderUrl = (orderId: string) =>
  `${storefrontUrl()}/gb/account/orders/details/${orderId}`

export const retrieveOrderForEmail = async (
  container: MedusaContainer,
  orderId: string,
) => {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "customer_id",
      "display_id",
      "email",
      "created_at",
      "currency_code",
      "subtotal",
      "shipping_total",
      "total",
      "items.title",
      "items.variant_title",
      "items.quantity",
      "items.unit_price",
      "items.total",
      "items.thumbnail",
      "shipping_address.*",
      "billing_address.*",
      "shipping_methods.name",
    ],
    filters: { id: orderId },
  })

  return data[0] as OrderRecord | undefined
}

const deliveryUpdatesEnabled = async (
  container: MedusaContainer,
  customerId?: string | null
) => {
  if (!customerId) {
    return true
  }

  const preferencesService: CustomerPreferencesModuleService =
    container.resolve(CUSTOMER_PREFERENCES_MODULE)
  const [preferences] = await preferencesService.listCustomerPreferences({
    customer_id: customerId,
  })
  return preferences?.delivery_updates ?? true
}

export const retrieveOrderIdFromFulfillment = async (
  container: MedusaContainer,
  fulfillmentId: string,
) => {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "fulfillment",
    fields: ["id", "order.id"],
    filters: { id: fulfillmentId },
  })
  const fulfillment = data[0] as
    | { order?: { id?: string | null } | null }
    | undefined

  return fulfillment?.order?.id || null
}

const retrieveFloristDetails = async (
  container: MedusaContainer,
  orderId: string,
) => {
  const giftOrderService: GiftOrderModuleService = container.resolve(
    GIFT_ORDER_MODULE,
  )
  const deliveryService: FloristDeliveryModuleService = container.resolve(
    FLORIST_DELIVERY_MODULE,
  )
  const [giftOrders, deliveries] = await Promise.all([
    giftOrderService.listGiftOrderDetails({ order_id: orderId }),
    deliveryService.listDeliveryReservations({ order_id: orderId }),
  ])

  return {
    giftOrder: giftOrders[0] as GiftOrderRecord | undefined,
    delivery: deliveries[0] as DeliveryRecord | undefined,
  }
}

const sendEmail = async (
  container: MedusaContainer,
  order: OrderRecord,
  template: string,
  triggerType: string,
  content: EmailContent,
  idempotencyKey: string,
) => {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const notificationService: INotificationModuleService = container.resolve(
    Modules.NOTIFICATION,
  )
  const from = process.env.NOTIFICATION_FROM_EMAIL
  const replyTo = process.env.CONTACT_REPLY_TO_EMAIL

  if (!from || !order.email) {
    logger.error(
      `Order ${order.id} email was not sent because the sender or customer email is missing.`,
    )
    return
  }

  await notificationService.createNotifications({
    to: order.email,
    from,
    channel: "email",
    template,
    content,
    provider_data: replyTo ? { reply_to: replyTo } : undefined,
    trigger_type: triggerType,
    resource_id: order.id,
    resource_type: "order",
    idempotency_key: idempotencyKey,
  })
}

export const sendOrderConfirmationEmail = async (
  container: MedusaContainer,
  orderId: string,
) => {
  const order = await retrieveOrderForEmail(container, orderId)

  if (!order) {
    return
  }

  const { giftOrder, delivery } = await retrieveFloristDetails(container, orderId)
  const shippingAddress = order.shipping_address
  const billingAddress = order.billing_address
  const purchaserName = personName(
    giftOrder?.purchaser_first_name,
    giftOrder?.purchaser_last_name,
    personName(billingAddress?.first_name, billingAddress?.last_name),
  )
  const recipientName = personName(
    giftOrder?.recipient_first_name,
    giftOrder?.recipient_last_name,
    personName(shippingAddress?.first_name, shippingAddress?.last_name),
  )
  const reference = `#SG-${order.display_id || order.id}`
  const deliveryDate = [delivery?.delivery_date, delivery?.delivery_window]
    .filter(Boolean)
    .join(" · ")
  const deliveryMethod = delivery?.fulfillment_type === "collection"
    ? "Collection"
    : order.shipping_methods?.[0]?.name || delivery?.zone_name || "Delivery"
  const data: OrderConfirmationEmailData = {
    purchaserName,
    purchaserEmail: giftOrder?.purchaser_email || order.email || "",
    orderReference: reference,
    orderDate: formatDate(order.created_at),
    subtotal: money(order.subtotal, order.currency_code),
    deliveryTotal: money(order.shipping_total, order.currency_code),
    total: money(order.total, order.currency_code),
    items: (order.items || []).map((item) => ({
      title: item.title || "Shore & Grace order item",
      variant: item.variant_title,
      quantity: item.quantity || 1,
      unitPrice: money(item.unit_price, order.currency_code),
      total: money(item.total, order.currency_code),
      imageUrl: item.thumbnail,
    })),
    recipientName,
    recipientPhone: giftOrder?.recipient_phone || shippingAddress?.phone,
    recipientAddress: emailAddress(shippingAddress),
    deliveryMethod,
    deliveryDate: deliveryDate || null,
    giftMessage: giftOrder?.gift_message,
    hidePrices: giftOrder?.hide_prices ?? undefined,
    billingAddress: emailAddress(billingAddress),
    orderUrl: orderUrl(order.id),
  }

  await sendEmail(
    container,
    order,
    "order-confirmation",
    "order.placed",
    renderOrderConfirmationEmail(data),
    `${order.id}:confirmation:v1`,
  )
}

type LifecycleEmail = "prepared" | "dispatched" | "delivered" | "cancelled"

export const sendOrderLifecycleEmail = async (
  container: MedusaContainer,
  orderId: string,
  lifecycle: LifecycleEmail,
  eventId = orderId,
) => {
  const order = await retrieveOrderForEmail(container, orderId)

  if (!order) {
    return
  }

  if (
    lifecycle !== "cancelled" &&
    !(await deliveryUpdatesEnabled(container, order.customer_id))
  ) {
    return
  }

  const { giftOrder, delivery } = await retrieveFloristDetails(container, orderId)
  const recipientName = personName(
    giftOrder?.purchaser_first_name,
    giftOrder?.purchaser_last_name,
    personName(
      order.billing_address?.first_name,
      order.billing_address?.last_name,
    ),
  )
  const reference = `#SG-${order.display_id || order.id}`
  const baseData = {
    recipientName,
    actionUrl: orderUrl(order.id),
    orderReference: reference,
    deliveryDate: delivery?.delivery_date || undefined,
  }
  const renderers = {
    prepared: renderOrderPreparedEmail,
    dispatched: renderOrderDispatchedEmail,
    delivered: renderOrderDeliveredEmail,
    cancelled: renderOrderCancelledEmail,
  }
  const triggers = {
    prepared: "order.fulfillment_created",
    dispatched: "shipment.created",
    delivered: "delivery.created",
    cancelled: "order.canceled",
  }

  await sendEmail(
    container,
    order,
    `order-${lifecycle}`,
    triggers[lifecycle],
    renderers[lifecycle](baseData),
    `${order.id}:${lifecycle}:${eventId}:v1`,
  )
}
