import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { NEWSLETTER_MODULE } from "../modules/newsletter"
import type NewsletterModuleService from "../modules/newsletter/service"
import { sendNewsletterCampaignWorkflow } from "../workflows/send-newsletter-campaign"

export default async function sendScheduledNewslettersJob(
  container: MedusaContainer,
) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const service = container.resolve<NewsletterModuleService>(NEWSLETTER_MODULE)
  const campaigns = await service.listNewsletterCampaigns(
    {
      status: "scheduled",
      scheduled_at: { $lte: new Date() },
    } as never,
    { take: 50, order: { scheduled_at: "ASC" } },
  )

  for (const campaign of campaigns) {
    try {
      await sendNewsletterCampaignWorkflow(container).run({
        input: { campaign_id: campaign.id },
      })
      logger.info(`[send-scheduled-newsletters] Sent ${campaign.id}.`)
    } catch (error) {
      logger.error(
        `[send-scheduled-newsletters] Failed for ${campaign.id}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      )
    }
  }
}

export const config = {
  name: "send-scheduled-newsletters",
  schedule: "*/5 * * * *",
}
