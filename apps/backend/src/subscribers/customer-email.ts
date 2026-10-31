import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import type { INotificationModuleService } from "@medusajs/framework/types"
import { createHash } from "node:crypto"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import {
  renderAccountDeletedEmail,
  renderAccountWelcomeEmail,
  renderEmailVerificationEmail,
  renderPasswordResetEmail,
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

type PasswordResetEvent = {
  entity_id: string
  actor_type?: string
  token: string
}

type AccountDeletedEvent = {
  id: string
  email: string
  first_name?: string | null
}

const storefrontUrl = () =>
  (process.env.STOREFRONT_URL || "http://localhost:8000").replace(/\/$/, "")

const eventAttemptKey = (value: string) =>
  createHash("sha256").update(value).digest("hex").slice(0, 16)

const send = async (
  container: SubscriberArgs<unknown>["container"],
  input: {
    to: string
    template: string
    triggerType: string
    resourceId: string
    content: ReturnType<typeof renderAccountWelcomeEmail>
    idempotencyKey?: string
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
    idempotency_key:
      input.idempotencyKey || `${input.resourceId}:${input.template}:v1`,
  })

  return true
}

export default async function customerEmailHandler({
  event,
  container,
}: SubscriberArgs<
  { id: string } | VerificationEvent | PasswordResetEvent | AccountDeletedEvent
>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  try {
    if (event.name === "customer.account_deleted") {
      const data = event.data as AccountDeletedEvent
      const sent = await send(container, {
        to: data.email,
        template: "account-deleted",
        triggerType: event.name,
        resourceId: data.id,
        content: renderAccountDeletedEmail({
          recipientName: data.first_name || "there",
        }),
      })

      if (!sent) {
        logger.error(
          `Customer ${data.id} was deleted, but the confirmation email sender is missing.`,
        )
      }
      return
    }

    if (event.name === "auth.password_reset") {
      const data = event.data as PasswordResetEvent

      if (data.actor_type && data.actor_type !== "customer") {
        return
      }

      const sent = await send(container, {
        to: data.entity_id,
        template: "password-reset",
        triggerType: event.name,
        resourceId: data.entity_id,
        idempotencyKey: `${data.entity_id}:password-reset:${eventAttemptKey(data.token)}:v1`,
        content: renderPasswordResetEmail({
          recipientName: "there",
          actionUrl: `${storefrontUrl()}/reset-password?token=${encodeURIComponent(data.token)}`,
        }),
      })

      if (!sent) {
        logger.error(
          "A password reset was requested, but the sender email is missing.",
        )
      }
      return
    }

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
        idempotencyKey: `${data.entity_id}:email-verification:${eventAttemptKey(data.code)}:v1`,
        content: renderEmailVerificationEmail({
          recipientName: "there",
          actionUrl: `${storefrontUrl()}/verify-account?token=${encodeURIComponent(data.code)}`,
        }),
      })

      if (!sent) {
        logger.error(
          "Email verification was requested, but the sender email is missing.",
        )
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
        actionUrl: `${storefrontUrl()}/account`,
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
  event: [
    "customer.created",
    "auth.verification_requested",
    "auth.password_reset",
    "customer.account_deleted",
  ],
}
