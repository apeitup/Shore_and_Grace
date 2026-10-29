import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  retrieveOrderIdFromFulfillment,
  sendOrderLifecycleEmail,
} from "../utils/order-email"

type OrderLifecycleEvent = {
  id?: string
  order_id?: string
  fulfillment_id?: string
  no_notification?: boolean
}

const lifecycleByEvent = {
  "order.fulfillment_created": "prepared",
  "shipment.created": "dispatched",
  "delivery.created": "delivered",
  "order.canceled": "cancelled",
} as const

export default async function orderLifecycleEmailHandler({
  event,
  container,
}: SubscriberArgs<OrderLifecycleEvent>) {
  const lifecycle = lifecycleByEvent[event.name as keyof typeof lifecycleByEvent]

  if (!lifecycle || event.data.no_notification) {
    return
  }

  const eventId = event.data.fulfillment_id || event.data.id
  let orderId = event.data.order_id

  if (!orderId && lifecycle === "cancelled") {
    orderId = event.data.id
  }

  if (!orderId && eventId) {
    orderId =
      (await retrieveOrderIdFromFulfillment(container, eventId)) || undefined
  }

  if (!orderId) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    logger.error(
      `Could not resolve an order for ${event.name} event ${eventId || "unknown"}.`,
    )
    return
  }

  try {
    await sendOrderLifecycleEmail(container, orderId, lifecycle, eventId)
  } catch (error) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    logger.error(
      `Order ${orderId} ${lifecycle} email failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    )
  }
}

export const config: SubscriberConfig = {
  event: [
    "order.fulfillment_created",
    "shipment.created",
    "delivery.created",
    "order.canceled",
  ],
}
