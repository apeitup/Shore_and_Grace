import type {
  INotificationModuleService,
  MedusaContainer,
} from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import { renderReviewRequestEmail } from "../emails"
import { retrieveOrderForEmail } from "../utils/order-email"

type DeliveredFulfillment = {
  id: string
  delivered_at?: string | Date | null
  order?: { id?: string | null } | null
}

const storefrontUrl = () =>
  (process.env.STOREFRONT_URL || "http://localhost:8000").replace(/\/$/, "")

const startOfUtcDay = (date: Date) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))

export default async function reviewRequestsJob(container: MedusaContainer) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const from = process.env.NOTIFICATION_FROM_EMAIL

  if (!from) {
    logger.info(
      "[review-requests] Skipped because NOTIFICATION_FROM_EMAIL is not configured."
    )
    return
  }

  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const notificationService: INotificationModuleService = container.resolve(
    Modules.NOTIFICATION
  )
  const replyTo = process.env.CONTACT_REPLY_TO_EMAIL
  const today = startOfUtcDay(new Date())
  const latestEligibleExclusive = new Date(today)
  latestEligibleExclusive.setUTCDate(latestEligibleExclusive.getUTCDate() - 1)
  const earliestEligible = new Date(today)
  earliestEligible.setUTCDate(earliestEligible.getUTCDate() - 7)

  const { data } = await query.graph({
    entity: "fulfillment",
    fields: ["id", "delivered_at", "order.id"],
    filters: {
      delivered_at: {
        $gte: earliestEligible.toISOString(),
        $lt: latestEligibleExclusive.toISOString(),
      },
    },
  })
  const orderIds = new Set(
    (data as DeliveredFulfillment[])
      .map((fulfillment) => fulfillment.order?.id)
      .filter((orderId): orderId is string => Boolean(orderId))
  )

  for (const orderId of orderIds) {
    try {
      const order = await retrieveOrderForEmail(container, orderId)

      if (!order?.email) {
        continue
      }

      const recipientName =
        order.billing_address?.first_name ||
        order.shipping_address?.first_name ||
        "there"
      const orderReference = `Order #${order.display_id || order.id}`
      const products = new Map<string, string>()

      for (const item of order.items || []) {
        if (item.product_id && item.product_handle) {
          products.set(item.product_id, item.product_handle)
        }
      }

      for (const [productId, handle] of products) {
        await notificationService.createNotifications({
          to: order.email,
          from,
          channel: "email",
          template: "review-request",
          content: renderReviewRequestEmail({
            recipientName,
            orderReference,
            actionUrl: `${storefrontUrl()}/gb/products/${handle}#reviews`,
          }),
          provider_data: replyTo ? { reply_to: replyTo } : undefined,
          trigger_type: "order.review_requested",
          resource_id: productId,
          resource_type: "product",
          idempotency_key: `${order.id}:${productId}:review-request:v1`,
        })
      }
    } catch (error) {
      logger.error(
        `[review-requests] Failed for ${orderId}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      )
    }
  }
}

export const config = {
  name: "review-requests",
  schedule: "0 9 * * *",
}
