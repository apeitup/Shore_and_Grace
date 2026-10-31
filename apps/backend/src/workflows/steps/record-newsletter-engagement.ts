import { MedusaError } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { NEWSLETTER_MODULE } from "../../modules/newsletter"
import type NewsletterModuleService from "../../modules/newsletter/service"
import {
  NewsletterTrackingAction,
  verifyNewsletterTrackingToken,
} from "../../utils/newsletter-tracking-token"

export type RecordNewsletterEngagementStepInput = {
  token: string
  action: NewsletterTrackingAction
}

type RecordNewsletterEngagementStepOutput = {
  destination?: string
  recorded: boolean
}

export const recordNewsletterEngagementStep = createStep(
  "record-newsletter-engagement",
  async (
    input: RecordNewsletterEngagementStepInput,
    { container },
  ): Promise<StepResponse<RecordNewsletterEngagementStepOutput, string>> => {
    if (process.env.NEWSLETTER_ENGAGEMENT_TRACKING_ENABLED !== "true") {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Newsletter engagement tracking is disabled.",
      )
    }

    const payload = verifyNewsletterTrackingToken(input.token)

    if (!payload || payload.action !== input.action) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "This newsletter tracking link is invalid.",
      )
    }

    const newsletterService = container.resolve<NewsletterModuleService>(
      NEWSLETTER_MODULE,
    )
    await Promise.all([
      newsletterService.retrieveNewsletterCampaign(payload.campaignId),
      newsletterService.retrieveNewsletterSubscription(payload.subscriptionId),
    ])

    const filters: Record<string, string> = {
      campaign_id: payload.campaignId,
      subscription_id: payload.subscriptionId,
      event_type: payload.action === "open" ? "opened" : "clicked",
    }

    if (payload.action === "click" && payload.destination) {
      filters.link_url = payload.destination
    }

    const [existing] = await newsletterService.listNewsletterEvents(filters, {
      take: 1,
    })

    if (existing) {
      return new StepResponse<RecordNewsletterEngagementStepOutput, string>(
        {
          destination: payload.destination,
          recorded: false,
        },
        undefined,
      )
    }

    const event = await newsletterService.createNewsletterEvents({
      campaign_id: payload.campaignId,
      subscription_id: payload.subscriptionId,
      event_type: payload.action === "open" ? "opened" : "clicked",
      link_url: payload.destination || null,
      occurred_at: new Date(),
    })

    return new StepResponse(
      { destination: payload.destination, recorded: true },
      event.id,
    )
  },
  async (eventId: string | undefined, { container }) => {
    if (!eventId) {
      return
    }

    const newsletterService = container.resolve<NewsletterModuleService>(
      NEWSLETTER_MODULE,
    )
    await newsletterService.deleteNewsletterEvents(eventId)
  },
)
