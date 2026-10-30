import { model } from "@medusajs/framework/utils"

const NewsletterSubscription = model
  .define("newsletter_subscription", {
    id: model.id().primaryKey(),
    email: model
      .text()
      .unique()
      .index("IDX_NEWSLETTER_SUBSCRIPTION_EMAIL"),
    status: model
      .enum(["pending", "subscribed", "unsubscribed"])
      .default("pending"),
    confirmation_token_hash: model
      .text()
      .index("IDX_NEWSLETTER_CONFIRMATION_TOKEN_HASH")
      .nullable(),
    confirmation_expires_at: model.dateTime().nullable(),
    confirmed_at: model.dateTime().nullable(),
    unsubscribed_at: model.dateTime().nullable(),
    consent_source: model.text().default("storefront_footer"),
    consented_at: model.dateTime().nullable(),
  })

export default NewsletterSubscription
