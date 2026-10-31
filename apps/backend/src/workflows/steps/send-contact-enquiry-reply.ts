import type { INotificationModuleService } from "@medusajs/framework/types"
import {
  MedusaError,
  Modules,
} from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { renderContactReplyEmail } from "../../emails"
import { CONTACT_ENQUIRY_MODULE } from "../../modules/contact-enquiry"
import type ContactEnquiryModuleService from "../../modules/contact-enquiry/service"

export type SendContactEnquiryReplyStepInput = {
  enquiry_id: string
  request_id: string
  subject: string
  message: string
  sent_by_user_id?: string | null
}

export const sendContactEnquiryReplyStep = createStep(
  "send-contact-enquiry-reply",
  async (input: SendContactEnquiryReplyStepInput, { container }) => {
    const contactService = container.resolve<ContactEnquiryModuleService>(
      CONTACT_ENQUIRY_MODULE,
    )
    const existing = await contactService.listContactEnquiryMessages({
      request_id: input.request_id,
    })

    if (existing[0]) {
      return new StepResponse(existing[0], null)
    }

    const enquiry = await contactService.retrieveContactEnquiry(
      input.enquiry_id,
    )
    if (enquiry.status === "spam") {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Replies cannot be sent to an enquiry marked as spam.",
      )
    }

    const from = process.env.NOTIFICATION_FROM_EMAIL
    const replyTo = process.env.CONTACT_REPLY_TO_EMAIL
    if (!from || !replyTo) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        "Contact reply email settings are incomplete.",
      )
    }

    const notificationService = container.resolve<INotificationModuleService>(
      Modules.NOTIFICATION,
    )
    const content = renderContactReplyEmail({
      name: enquiry.name,
      reference: enquiry.reference,
      subject: input.subject,
      message: input.message,
      originalMessage: enquiry.message,
    })

    await notificationService.createNotifications({
      to: enquiry.email,
      from,
      channel: "email",
      template: "contact-enquiry-reply",
      content,
      provider_data: { reply_to: replyTo },
      trigger_type: "contact_enquiry.replied",
      resource_id: enquiry.id,
      resource_type: "contact_enquiry",
      idempotency_key: `${enquiry.id}:reply:${input.request_id}`,
    })

    const sentAt = new Date()
    const reply = await contactService.createContactEnquiryMessages({
      enquiry_id: enquiry.id,
      request_id: input.request_id,
      direction: "outbound",
      subject: input.subject,
      body: input.message,
      recipient_email: enquiry.email,
      sender_email: from,
      sent_by_user_id: input.sent_by_user_id ?? null,
      sent_at: sentAt,
    })

    if (enquiry.status === "new") {
      await contactService.updateContactEnquiries({
        id: enquiry.id,
        status: "in_progress",
      })
    }

    return new StepResponse(reply, reply.id)
  },
  async (replyId, { container }) => {
    if (!replyId) return
    const contactService = container.resolve<ContactEnquiryModuleService>(
      CONTACT_ENQUIRY_MODULE,
    )
    await contactService.deleteContactEnquiryMessages(replyId)
  },
)
