import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import type { INotificationModuleService } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import {
  renderPrivacyRequestCompletedEmail,
  renderPrivacyRequestReceivedEmail,
} from "../emails"
import { PRIVACY_REQUEST_MODULE } from "../modules/privacy-request"
import PrivacyRequestModuleService from "../modules/privacy-request/service"

type PrivacyRequestRecord = {
  id: string
  reference: string
  name: string
  email: string
  status: "received" | "identity_check" | "in_progress" | "completed" | "rejected"
}

export default async function privacyRequestEmailHandler({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const service: PrivacyRequestModuleService = container.resolve(
    PRIVACY_REQUEST_MODULE,
  )
  const notificationService: INotificationModuleService = container.resolve(
    Modules.NOTIFICATION,
  )
  const request = (await service.retrievePrivacyRequest(
    event.data.id,
  )) as PrivacyRequestRecord
  const from = process.env.NOTIFICATION_FROM_EMAIL
  const replyTo = process.env.CONTACT_REPLY_TO_EMAIL

  if (!from) {
    logger.error(
      `Privacy request ${request.reference} email was not sent because the sender email is missing.`,
    )
    return
  }

  const isCreated = event.name === "privacy_request.created"
  const isCompleted =
    event.name === "privacy_request.updated" && request.status === "completed"

  if (!isCreated && !isCompleted) {
    return
  }

  const firstName = request.name.trim().split(/\s+/)[0] || "there"
  const content = isCreated
    ? renderPrivacyRequestReceivedEmail({
        recipientName: firstName,
        reference: request.reference,
      })
    : renderPrivacyRequestCompletedEmail({
        recipientName: firstName,
        reference: request.reference,
      })
  const state = isCreated ? "received" : "completed"

  try {
    await notificationService.createNotifications({
      to: request.email,
      from,
      channel: "email",
      template: `privacy-request-${state}`,
      content,
      provider_data: replyTo ? { reply_to: replyTo } : undefined,
      trigger_type: event.name,
      resource_id: request.id,
      resource_type: "privacy_request",
      idempotency_key: `${request.id}:${state}:v1`,
    })
  } catch (error) {
    logger.error(
      `Privacy request ${request.reference} ${state} email failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    )
  }
}

export const config: SubscriberConfig = {
  event: ["privacy_request.created", "privacy_request.updated"],
}
