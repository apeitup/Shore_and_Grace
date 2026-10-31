import { model } from "@medusajs/framework/utils"

const NewsletterCampaign = model.define("newsletter_campaign", {
  id: model.id().primaryKey(),
  name: model.text(),
  subject: model.text().nullable(),
  preheader: model.text().nullable(),
  status: model
    .enum(["draft", "scheduled", "sending", "sent", "archived"])
    .default("draft"),
  kind: model.enum(["newsletter", "template"]).default("newsletter"),
  season: model.text().nullable(),
  content: model.json().default({ blocks: [] }),
  html: model.text().nullable(),
  scheduled_at: model.dateTime().nullable(),
  sent_at: model.dateTime().nullable(),
})

export default NewsletterCampaign
