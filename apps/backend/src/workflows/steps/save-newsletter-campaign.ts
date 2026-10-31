import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { NEWSLETTER_MODULE } from "../../modules/newsletter"
import type NewsletterModuleService from "../../modules/newsletter/service"

export type NewsletterCampaignStatus =
  | "draft"
  | "scheduled"
  | "sending"
  | "sent"
  | "archived"

export type NewsletterCampaignKind = "newsletter" | "template"

export type SaveNewsletterCampaignStepInput = {
  id?: string
  name: string
  subject?: string | null
  preheader?: string | null
  status?: NewsletterCampaignStatus
  kind?: NewsletterCampaignKind
  season?: string | null
  content: Record<string, unknown>
  html?: string | null
  scheduled_at?: string | null
  sent_at?: string | null
}

type SaveNewsletterCampaignCompensation = {
  created_id?: string
  original?: SaveNewsletterCampaignServiceInput
}

type SaveNewsletterCampaignServiceInput = Omit<
  SaveNewsletterCampaignStepInput,
  "scheduled_at" | "sent_at"
> & {
  scheduled_at?: Date | null
  sent_at?: Date | null
}

const toServiceInput = (
  input: SaveNewsletterCampaignStepInput,
): SaveNewsletterCampaignServiceInput => ({
  ...input,
  scheduled_at:
    input.scheduled_at === undefined
      ? undefined
      : input.scheduled_at === null
        ? null
        : new Date(input.scheduled_at),
  sent_at:
    input.sent_at === undefined
      ? undefined
      : input.sent_at === null
        ? null
        : new Date(input.sent_at),
})

export const saveNewsletterCampaignStep = createStep(
  "save-newsletter-campaign",
  async (input: SaveNewsletterCampaignStepInput, { container }) => {
    const service = container.resolve<NewsletterModuleService>(
      NEWSLETTER_MODULE,
    )
    const serviceInput = toServiceInput(input)

    if (input.id) {
      const original = await service.retrieveNewsletterCampaign(input.id)
      const campaign = await service.updateNewsletterCampaigns(serviceInput)

      return new StepResponse(campaign, {
        original: {
          id: original.id,
          name: original.name,
          subject: original.subject,
          preheader: original.preheader,
          status: original.status,
          kind: original.kind,
          season: original.season,
          content: original.content,
          html: original.html,
          scheduled_at: original.scheduled_at,
          sent_at: original.sent_at,
        },
      })
    }

    const campaign = await service.createNewsletterCampaigns(serviceInput)

    return new StepResponse(campaign, { created_id: campaign.id })
  },
  async (
    compensation: SaveNewsletterCampaignCompensation | undefined,
    { container },
  ) => {
    if (!compensation) {
      return
    }

    const service = container.resolve<NewsletterModuleService>(
      NEWSLETTER_MODULE,
    )

    if (compensation.created_id) {
      await service.deleteNewsletterCampaigns(compensation.created_id)
      return
    }

    if (compensation.original) {
      await service.updateNewsletterCampaigns(compensation.original)
    }
  },
)
