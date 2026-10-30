import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { NEWSLETTER_MODULE } from "../../modules/newsletter"
import NewsletterModuleService from "../../modules/newsletter/service"

export type DeleteNewsletterSubscriptionsStepInput = {
  ids: string[]
}

export const deleteNewsletterSubscriptionsStep = createStep(
  "delete-newsletter-subscriptions",
  async (
    input: DeleteNewsletterSubscriptionsStepInput,
    { container },
  ) => {
    const service: NewsletterModuleService = container.resolve(
      NEWSLETTER_MODULE,
    )
    const ids = [...new Set(input.ids)]

    await service.deleteNewsletterSubscriptions(ids)

    return new StepResponse(
      { deleted_ids: ids, count: ids.length },
      ids,
    )
  },
  async (ids: string[] | undefined, { container }) => {
    if (!ids?.length) {
      return
    }

    const service: NewsletterModuleService = container.resolve(
      NEWSLETTER_MODULE,
    )
    await service.restoreNewsletterSubscriptions(ids)
  },
)
