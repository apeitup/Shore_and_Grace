import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import type { INotificationModuleService } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import { renderNewsletterConfirmationEmail } from "../emails"

type NewsletterConfirmationEvent = {
  id: string
  email: string
  should_send: boolean
  confirmation_token?: string | null
  confirmation_token_hash?: string | null
}

const storefrontUrl = () =>
  (process.env.STOREFRONT_URL || "http://localhost:8000").replace(/\/$/, "")

export default async function newsletterConfirmationRequestedHandler({
  event: { data },
  container,
}: SubscriberArgs<NewsletterConfirmationEvent>) {
  if (!data.should_send || !data.confirmation_token) {
    return
  }

  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const notificationService: INotificationModuleService = container.resolve(
    Modules.NOTIFICATION
  )
  const from = process.env.NOTIFICATION_FROM_EMAIL
  const replyTo = process.env.CONTACT_REPLY_TO_EMAIL

  if (!from) {
    logger.error(
      `Newsletter confirmation ${data.id} was not sent because NOTIFICATION_FROM_EMAIL is missing.`
    )
    return
  }

  try {
    const actionUrl = `${storefrontUrl()}/gb/newsletter/confirm?token=${encodeURIComponent(
      data.confirmation_token
    )}`
    await notificationService.createNotifications({
      to: data.email,
      from,
      channel: "email",
      template: "newsletter-confirmation",
      content: renderNewsletterConfirmationEmail({
        recipientName: "there",
        actionUrl,
      }),
      provider_data: replyTo ? { reply_to: replyTo } : undefined,
      trigger_type: "newsletter.confirmation_requested",
      resource_id: data.id,
      resource_type: "newsletter_subscription",
      idempotency_key: `${data.id}:${data.confirmation_token_hash}:confirmation:v1`,
    })
  } catch (error) {
    logger.error(
      `Newsletter confirmation ${data.id} failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    )
  }
}

export const config: SubscriberConfig = {
  event: "newsletter.confirmation_requested",
}
