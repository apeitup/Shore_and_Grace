import { model } from "@medusajs/framework/utils"

const PrivacyRequest = model
  .define("privacy_request", {
    id: model.id().primaryKey(),
    reference: model.text().index("IDX_PRIVACY_REQUEST_REFERENCE"),
    request_type: model.enum([
      "access",
      "correction",
      "deletion",
      "restriction",
      "objection",
      "portability",
    ]),
    requester_type: model.enum(["customer", "gift_recipient", "visitor"]),
    name: model.text(),
    email: model.text().index("IDX_PRIVACY_REQUEST_EMAIL"),
    phone: model.text().nullable(),
    order_reference: model.text().nullable(),
    details: model.text().nullable(),
    customer_id: model.text().nullable(),
    status: model
      .enum(["received", "identity_check", "in_progress", "completed", "rejected"])
      .default("received"),
    identity_status: model
      .enum(["pending", "verified", "failed"])
      .default("pending"),
    due_at: model.text().index("IDX_PRIVACY_REQUEST_DUE_AT"),
    completed_at: model.text().nullable(),
    internal_notes: model.text().nullable(),
    privacy_notice_version: model.text(),
  })
  .indexes([
    {
      name: "IDX_PRIVACY_REQUEST_REFERENCE_UNIQUE",
      on: ["reference"],
      unique: true,
      where: { deleted_at: null },
    },
  ])

export default PrivacyRequest
