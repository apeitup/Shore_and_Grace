import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import type { INotificationModuleService } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { CONTACT_ENQUIRY_MODULE } from "../modules/contact-enquiry";
import ContactEnquiryModuleService from "../modules/contact-enquiry/service";
import { contactCategoryLabel, escapeHtml } from "../utils/contact-enquiry";

type ContactEnquiryRecord = {
  id: string;
  reference: string;
  name: string;
  email: string;
  phone?: string | null;
  order_reference?: string | null;
  category: string;
  message: string;
};

const internalContent = (enquiry: ContactEnquiryRecord) => {
  const details = [
    `Reference: ${enquiry.reference}`,
    `Category: ${contactCategoryLabel(enquiry.category)}`,
    `Name: ${enquiry.name}`,
    `Email: ${enquiry.email}`,
    enquiry.phone ? `Phone: ${enquiry.phone}` : "",
    enquiry.order_reference
      ? `Order/reference: ${enquiry.order_reference}`
      : "",
    "",
    enquiry.message,
  ].filter(Boolean);

  return {
    subject: `[${enquiry.reference}] ${contactCategoryLabel(enquiry.category)} enquiry from ${enquiry.name}`,
    text: details.join("\n"),
    html: `<h1>New contact enquiry</h1><p><strong>Reference:</strong> ${escapeHtml(
      enquiry.reference,
    )}</p><p><strong>Category:</strong> ${escapeHtml(
      contactCategoryLabel(enquiry.category),
    )}</p><p><strong>Name:</strong> ${escapeHtml(
      enquiry.name,
    )}</p><p><strong>Email:</strong> ${escapeHtml(enquiry.email)}</p>${
      enquiry.phone
        ? `<p><strong>Phone:</strong> ${escapeHtml(enquiry.phone)}</p>`
        : ""
    }${
      enquiry.order_reference
        ? `<p><strong>Order/reference:</strong> ${escapeHtml(
            enquiry.order_reference,
          )}</p>`
        : ""
    }<hr><p>${escapeHtml(enquiry.message).replace(/\n/g, "<br>")}</p>`,
  };
};

const acknowledgementContent = (enquiry: ContactEnquiryRecord) => ({
  subject: `We received your message (${enquiry.reference})`,
  text: `Hello ${enquiry.name},\n\nThank you for contacting Shore & Grace. We have received your message and aim to reply within two working days.\n\nYour reference is ${enquiry.reference}.\n\nShore & Grace`,
  html: `<p>Hello ${escapeHtml(
    enquiry.name,
  )},</p><p>Thank you for contacting Shore &amp; Grace. We have received your message and aim to reply within two working days.</p><p>Your reference is <strong>${escapeHtml(
    enquiry.reference,
  )}</strong>.</p><p>Shore &amp; Grace</p>`,
});

export default async function contactEnquiryCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const contactService: ContactEnquiryModuleService = container.resolve(
    CONTACT_ENQUIRY_MODULE,
  );
  const notificationService: INotificationModuleService = container.resolve(
    Modules.NOTIFICATION,
  );
  const enquiry = (await contactService.retrieveContactEnquiry(
    data.id,
  )) as ContactEnquiryRecord;
  const from = process.env.NOTIFICATION_FROM_EMAIL;
  const internalRecipient = process.env.CONTACT_RECIPIENT_EMAIL;
  const contactReplyTo = process.env.CONTACT_REPLY_TO_EMAIL;

  if (!from || !internalRecipient || !contactReplyTo) {
    logger.error(
      `Contact enquiry ${enquiry.reference} was saved, but contact notification email settings are incomplete.`,
    );
    return;
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
      idempotency_key: `${enquiry.id}:internal:v1`,
    });
  } catch (error) {
    logger.error(
      `Contact enquiry ${enquiry.reference} was saved, but the internal notification failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }

  if (process.env.CONTACT_ACKNOWLEDGEMENT_ENABLED === "false") {
    return;
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
      idempotency_key: `${enquiry.id}:ack:v1`,
    });
  } catch (error) {
    logger.error(
      `Contact enquiry ${enquiry.reference} was saved, but the acknowledgement failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }
}

export const config: SubscriberConfig = {
  event: "contact_enquiry.created",
};
