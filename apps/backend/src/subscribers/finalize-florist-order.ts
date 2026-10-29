import type {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { sendOrderConfirmationEmail } from "../utils/order-email"
import { finalizeFloristOrderWorkflow } from "../workflows/finalize-florist-order"

export default async function finalizeFloristOrderHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: orders } = await query.graph({
    entity: "order",
    fields: ["id", "cart_id"],
    filters: { id: data.id },
  })
  const order = orders[0] as { id: string; cart_id?: string | null } | undefined

  if (!order?.cart_id) {
    return
  }

  await finalizeFloristOrderWorkflow(container).run({
    input: { cart_id: order.cart_id, order_id: order.id },
  })

  try {
    await sendOrderConfirmationEmail(container, order.id)
  } catch (error) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    logger.error(
      `Order ${order.id} was finalised, but its confirmation email failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    )
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
