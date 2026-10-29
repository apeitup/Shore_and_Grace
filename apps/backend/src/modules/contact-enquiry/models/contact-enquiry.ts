import { model } from "@medusajs/framework/utils";

const ContactEnquiry = model
  .define("contact_enquiry", {
    id: model.id().primaryKey(),
    reference: model.text().index("IDX_CONTACT_ENQUIRY_REFERENCE"),
    name: model.text(),
    email: model.text().index("IDX_CONTACT_ENQUIRY_EMAIL"),
    phone: model.text().nullable(),
    order_reference: model.text().nullable(),
    category: model.enum([
      "order",
      "delivery",
      "returns",
      "products",
      "services",
      "privacy",
      "other",
    ]),
    message: model.text(),
    status: model
      .enum(["new", "in_progress", "resolved", "spam"])
      .default("new"),
    internal_notes: model.text().nullable(),
    resolved_at: model.text().nullable(),
    retained_until: model.text().index("IDX_CONTACT_ENQUIRY_RETAINED_UNTIL"),
    privacy_notice_version: model.text(),
  })
  .indexes([
    {
      name: "IDX_CONTACT_ENQUIRY_REFERENCE_UNIQUE",
      on: ["reference"],
      unique: true,
      where: { deleted_at: null },
    },
  ]);

export default ContactEnquiry;
