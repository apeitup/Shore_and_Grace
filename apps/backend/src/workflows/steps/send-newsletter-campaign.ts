import type { INotificationModuleService } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
} from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { renderNewsletterEmail } from "../../emails"
import { NEWSLETTER_MODULE } from "../../modules/newsletter"
import type NewsletterModuleService from "../../modules/newsletter/service"
import { createNewsletterTrackingToken } from "../../utils/newsletter-tracking-token"
import { createCampaignNewsletterUnsubscribeToken } from "../../utils/newsletter-unsubscribe-token"

export type SendNewsletterCampaignStepInput = {
  campaign_id: string
  test_email?: string
}

type CampaignContent = {
  blocks?: Array<Record<string, unknown>>
}

const storefrontUrl = () =>
  (process.env.STOREFRONT_URL || "http://localhost:8000").replace(/\/$/, "")

const backendUrl = () =>
  (process.env.MEDUSA_BACKEND_URL || "http://localhost:9000").replace(/\/$/, "")

const newsletterTrackingEnabled = () =>
  process.env.NEWSLETTER_ENGAGEMENT_TRACKING_ENABLED === "true"

export const sendNewsletterCampaignStep = createStep(
  "send-newsletter-campaign",
  async (input: SendNewsletterCampaignStepInput, { container }) => {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    const newsletterService = container.resolve<NewsletterModuleService>(
      NEWSLETTER_MODULE,
    )
    const notificationService: INotificationModuleService = container.resolve(
      Modules.NOTIFICATION,
    )
    const campaign = await newsletterService.retrieveNewsletterCampaign(
      input.campaign_id,
    )
    const content = campaign.content as CampaignContent
    const blocks = Array.isArray(content?.blocks) ? content.blocks : []
    const from = process.env.NOTIFICATION_FROM_EMAIL
    const replyTo = process.env.CONTACT_REPLY_TO_EMAIL

    if (!from) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        "NOTIFICATION_FROM_EMAIL is not configured.",
      )
    }

    if (!campaign.subject?.trim()) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Add a subject before sending this newsletter.",
      )
    }

    if (!blocks.length) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Add newsletter content before sending.",
      )
    }

    if (input.test_email) {
      const rendered = renderNewsletterEmail({
        subject: `[TEST] ${campaign.subject}`,
        preheader: campaign.preheader,
        blocks,
        recipientName: "there",
        unsubscribeUrl: `${storefrontUrl()}/newsletter/unsubscribe?preview=1`,
      })

      await notificationService.createNotifications({
        to: input.test_email,
        from,
        channel: "email",
        template: "newsletter-test",
        content: rendered,
        provider_data: replyTo ? { reply_to: replyTo } : undefined,
        trigger_type: "newsletter.test",
        resource_id: campaign.id,
        resource_type: "newsletter_campaign",
        idempotency_key: `${campaign.id}:test:${input.test_email}:${Date.now()}`,
      })

      return new StepResponse({ test: true, sent: 1, failed: 0 })
    }

    if (["sending", "sent", "archived"].includes(campaign.status)) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `A ${campaign.status} newsletter cannot be sent again. Duplicate it instead.`,
      )
    }

    const [subscriptions] = await newsletterService.listAndCountNewsletterSubscriptions(
      { status: "subscribed" },
      { take: 10000, order: { created_at: "ASC" } },
    )

    if (!subscriptions.length) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "There are no confirmed subscribers to send to.",
      )
    }

    await newsletterService.updateNewsletterCampaigns({
      id: campaign.id,
      status: "sending",
    })

    let sent = 0
    let failed = 0

    for (const subscription of subscriptions) {
      const [existing] = await newsletterService.listNewsletterEvents(
        {
          campaign_id: campaign.id,
          subscription_id: subscription.id,
          event_type: "sent",
        },
        { take: 1 },
      )

      if (existing) {
        continue
      }

      const queued = await newsletterService.createNewsletterEvents({
        campaign_id: campaign.id,
        subscription_id: subscription.id,
        event_type: "queued",
        metadata: { email: subscription.email },
        occurred_at: new Date(),
      })

      try {
        const token = createCampaignNewsletterUnsubscribeToken(
          subscription.id,
          campaign.id,
        )
        const trackingEnabled = newsletterTrackingEnabled()
        const trackingBaseUrl = `${backendUrl()}/newsletter/track`
        const transformLink = trackingEnabled
          ? (url: string) => {
              const trackingToken = createNewsletterTrackingToken({
                action: "click",
                campaignId: campaign.id,
                subscriptionId: subscription.id,
                destination: url,
              })

              return `${trackingBaseUrl}/click?token=${encodeURIComponent(trackingToken)}`
            }
          : undefined
        const trackingPixelUrl = trackingEnabled
          ? `${trackingBaseUrl}/open?token=${encodeURIComponent(
              createNewsletterTrackingToken({
                action: "open",
                campaignId: campaign.id,
                subscriptionId: subscription.id,
              }),
            )}`
          : undefined
        const rendered = renderNewsletterEmail({
          subject: campaign.subject,
          preheader: campaign.preheader,
          blocks,
          recipientName: "there",
          unsubscribeUrl: `${storefrontUrl()}/newsletter/unsubscribe?token=${encodeURIComponent(token)}`,
          transformLink,
          trackingPixelUrl,
        })

        await notificationService.createNotifications({
          to: subscription.email,
          from,
          channel: "email",
          template: "newsletter-campaign",
          content: rendered,
          provider_data: replyTo ? { reply_to: replyTo } : undefined,
          trigger_type: "newsletter.campaign",
          resource_id: campaign.id,
          resource_type: "newsletter_campaign",
          idempotency_key: `${campaign.id}:${subscription.id}:v1`,
        })

        await newsletterService.createNewsletterEvents({
          campaign_id: campaign.id,
          subscription_id: subscription.id,
          event_type: "sent",
          metadata: { email: subscription.email },
          occurred_at: new Date(),
        })
        sent += 1
      } catch (error) {
        failed += 1
        await newsletterService.createNewsletterEvents({
          campaign_id: campaign.id,
          subscription_id: subscription.id,
          event_type: "failed",
          metadata: {
            email: subscription.email,
            message: error instanceof Error ? error.message : "Unknown error",
            queued_event_id: queued.id,
          },
          occurred_at: new Date(),
        })
        logger.error(
          `Newsletter ${campaign.id} failed for ${subscription.id}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        )
      }
    }

    await newsletterService.updateNewsletterCampaigns({
      id: campaign.id,
      status: "sent",
      sent_at: new Date(),
    })

    return new StepResponse({ test: false, sent, failed })
  },
)
