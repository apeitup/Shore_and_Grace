import { model } from "@medusajs/framework/utils"

const ContactEnquiryMessage = model
  .define("contact_enquiry_message", {
    id: model.id().primaryKey(),
    enquiry_id: model.text().index("IDX_CONTACT_ENQUIRY_MESSAGE_ENQUIRY_ID"),
    request_id: model.text(),
    direction: model.enum(["inbound", "outbound"]).default("outbound"),
    subject: model.text(),
    body: model.text(),
    recipient_email: model.text(),
    sender_email: model.text(),
    sent_by_user_id: model.text().nullable(),
    sent_at: model.dateTime(),
  })
  .indexes([
    {
      name: "IDX_CONTACT_ENQUIRY_MESSAGE_REQUEST_ID_UNIQUE",
      on: ["request_id"],
      unique: true,
      where: { deleted_at: null },
    },
  ])

export default ContactEnquiryMessage
