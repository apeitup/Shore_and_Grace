import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import type { INotificationModuleService } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import {
  renderAccountWelcomeEmail,
  renderEmailVerificationEmail,
} from "../emails"

type CustomerRecord = {
  id: string
  email?: string | null
  first_name?: string | null
  last_name?: string | null
}

type VerificationEvent = {
  entity_id: string
  entity_type?: string
  code: string
}

const storefrontUrl = () =>
  (process.env.STOREFRONT_URL || "http://localhost:8000").replace(/\/$/, "")

const send = async (
  container: SubscriberArgs<unknown>["container"],
  input: {
    to: string
    template: string
    triggerType: string
    resourceId: string
    content: ReturnType<typeof renderAccountWelcomeEmail>
  },
) => {
  const notificationService: INotificationModuleService = container.resolve(
    Modules.NOTIFICATION,
  )
  const from = process.env.NOTIFICATION_FROM_EMAIL
  const replyTo = process.env.CONTACT_REPLY_TO_EMAIL

  if (!from) {
    return false
  }

  await notificationService.createNotifications({
    to: input.to,
    from,
    channel: "email",
    template: input.template,
    content: input.content,
    provider_data: replyTo ? { reply_to: replyTo } : undefined,
    trigger_type: input.triggerType,
    resource_id: input.resourceId,
    resource_type: "customer",
    idempotency_key: `${input.resourceId}:${input.template}:v1`,
  })

  return true
}

export default async function customerEmailHandler({
  event,
  container,
}: SubscriberArgs<{ id: string } | VerificationEvent>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  try {
    if (event.name === "auth.verification_requested") {
      const data = event.data as VerificationEvent

      if (data.entity_type && data.entity_type !== "customer") {
        return
      }

      const sent = await send(container, {
        to: data.entity_id,
        template: "email-verification",
        triggerType: event.name,
        resourceId: data.entity_id,
        content: renderEmailVerificationEmail({
          recipientName: "there",
          actionUrl: `${storefrontUrl()}/gb/verify-account?token=${encodeURIComponent(data.code)}`,
        }),
      })

      if (!sent) {
        logger.error("Email verification was requested, but the sender email is missing.")
      }
      return
    }

    const data = event.data as { id: string }
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const result = await query.graph({
      entity: "customer",
      fields: ["id", "email", "first_name", "last_name"],
      filters: { id: data.id },
    })
    const customer = result.data[0] as CustomerRecord | undefined

    if (!customer?.email) {
      return
    }

    const sent = await send(container, {
      to: customer.email,
      template: "account-welcome",
      triggerType: event.name,
      resourceId: customer.id,
      content: renderAccountWelcomeEmail({
        recipientName: customer.first_name || "there",
        actionUrl: `${storefrontUrl()}/gb/account`,
      }),
    })

    if (!sent) {
      logger.error(
        `Customer ${customer.id} was created, but the welcome email sender is missing.`,
      )
    }
  } catch (error) {
    logger.error(
      `Customer email for ${event.name} failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    )
  }
}

export const config: SubscriberConfig = {
  event: ["customer.created", "auth.verification_requested"],
}
