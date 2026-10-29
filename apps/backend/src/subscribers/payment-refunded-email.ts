import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { sendRefundConfirmationEmail } from "../utils/order-email"

type PaymentRefundedEvent = {
  id: string
}

export default async function paymentRefundedEmailHandler({
  event,
  container,
}: SubscriberArgs<PaymentRefundedEvent>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  try {
    const sent = await sendRefundConfirmationEmail(container, event.data.id)

    if (!sent) {
      logger.error(
        `Could not resolve the order or refund for payment ${event.data.id}.`,
      )
    }
  } catch (error) {
    logger.error(
      `Refund email for payment ${event.data.id} failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    )
  }
}

export const config: SubscriberConfig = {
  event: "payment.refunded",
}
