import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import type { INotificationModuleService } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import {
  renderContactAcknowledgementEmail,
  renderInternalContactEnquiryEmail,
} from "../emails"
import { CONTACT_ENQUIRY_MODULE } from "../modules/contact-enquiry"
import ContactEnquiryModuleService from "../modules/contact-enquiry/service"
import { contactCategoryLabel } from "../utils/contact-enquiry"

type ContactEnquiryRecord = {
  id: string
  reference: string
  name: string
  email: string
  phone?: string | null
  order_reference?: string | null
  category: string
  message: string
}

const internalContent = (enquiry: ContactEnquiryRecord) =>
  renderInternalContactEnquiryEmail({
    name: enquiry.name,
    reference: enquiry.reference,
    email: enquiry.email,
    phone: enquiry.phone,
    orderReference: enquiry.order_reference,
    category: contactCategoryLabel(enquiry.category),
    message: enquiry.message,
  })

const acknowledgementContent = (enquiry: ContactEnquiryRecord) =>
  renderContactAcknowledgementEmail({
    name: enquiry.name,
    reference: enquiry.reference,
  })

export default async function contactEnquiryCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const contactService: ContactEnquiryModuleService = container.resolve(
    CONTACT_ENQUIRY_MODULE,
  )
  const notificationService: INotificationModuleService = container.resolve(
    Modules.NOTIFICATION,
  )
  const enquiry = (await contactService.retrieveContactEnquiry(
    data.id,
  )) as ContactEnquiryRecord
  const from = process.env.NOTIFICATION_FROM_EMAIL
  const internalRecipient = process.env.CONTACT_RECIPIENT_EMAIL
  const contactReplyTo = process.env.CONTACT_REPLY_TO_EMAIL

  if (!from || !internalRecipient || !contactReplyTo) {
    logger.error(
      `Contact enquiry ${enquiry.reference} was saved, but contact notification email settings are incomplete.`,
    )
    return
  }

  try {
    await notificationService.createNotifications({
      to: internalRecipient,
      from,
      channel: "email",
      template: "contact-enquiry-internal",
      content: internalContent(enquiry),
      provider_data: { reply_to: enquiry.email },
      trigger_type: "contact_enquiry.created",
      resource_id: enquiry.id,
      resource_type: "contact_enquiry",
      idempotency_key: `${enquiry.id}:internal:v2`,
    })
  } catch (error) {
    logger.error(
      `Contact enquiry ${enquiry.reference} was saved, but the internal notification failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    )
  }

  if (process.env.CONTACT_ACKNOWLEDGEMENT_ENABLED === "false") {
    return
  }

  try {
    await notificationService.createNotifications({
      to: enquiry.email,
      from,
      channel: "email",
      template: "contact-enquiry-acknowledgement",
      content: acknowledgementContent(enquiry),
      provider_data: { reply_to: contactReplyTo },
      trigger_type: "contact_enquiry.created",
      resource_id: enquiry.id,
      resource_type: "contact_enquiry",
      idempotency_key: `${enquiry.id}:ack:v2`,
    })
  } catch (error) {
    logger.error(
      `Contact enquiry ${enquiry.reference} was saved, but the acknowledgement failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    )
  }
}

export const config: SubscriberConfig = {
  event: "contact_enquiry.created",
}
