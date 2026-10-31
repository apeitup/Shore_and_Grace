import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { NEWSLETTER_MODULE } from "../../modules/newsletter"
import type NewsletterModuleService from "../../modules/newsletter/service"

export const deleteNewsletterCampaignStep = createStep(
  "delete-newsletter-campaign",
  async (id: string, { container }) => {
    const service = container.resolve<NewsletterModuleService>(
      NEWSLETTER_MODULE,
    )

    await service.softDeleteNewsletterCampaigns(id)

    return new StepResponse({ id }, id)
  },
  async (id: string | undefined, { container }) => {
    if (!id) {
      return
    }

    const service = container.resolve<NewsletterModuleService>(
      NEWSLETTER_MODULE,
    )
    await service.restoreNewsletterCampaigns(id)
  },
)
