import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { NEWSLETTER_MODULE } from "../../../../../modules/newsletter"
import type NewsletterModuleService from "../../../../../modules/newsletter/service"

const eventTypes = [
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
] as const

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  const service = req.scope.resolve<NewsletterModuleService>(
    NEWSLETTER_MODULE,
  )
  const counts = await Promise.all(
    eventTypes.map(async (eventType) => {
      const [, count] = await service.listAndCountNewsletterEvents(
        { campaign_id: req.params.id, event_type: eventType },
        { take: 1 },
      )
      return [eventType, count] as const
    }),
  )

  res.json({
    report: Object.fromEntries(counts),
    tracking_enabled:
      process.env.NEWSLETTER_ENGAGEMENT_TRACKING_ENABLED === "true",
  })
}
