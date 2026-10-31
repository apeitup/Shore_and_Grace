import { model } from "@medusajs/framework/utils"

const NewsletterEvent = model.define("newsletter_event", {
  id: model.id().primaryKey(),
  campaign_id: model
    .text()
    .index("IDX_NEWSLETTER_EVENT_CAMPAIGN_ID"),
  subscription_id: model.text().nullable(),
  event_type: model.enum([
    "queued",
    "sent",
    "delivered",
    "opened",
    "clicked",
    "bounced",
    "complained",
    "unsubscribed",
    "converted",
    "failed",
  ]),
  link_url: model.text().nullable(),
  order_id: model.text().nullable(),
  metadata: model.json().nullable(),
  occurred_at: model.dateTime(),
})

export default NewsletterEvent
