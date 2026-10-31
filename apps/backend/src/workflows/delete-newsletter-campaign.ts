import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { deleteNewsletterCampaignStep } from "./steps/delete-newsletter-campaign"

export const deleteNewsletterCampaignWorkflow = createWorkflow(
  "delete-newsletter-campaign",
  function (id: string) {
    const deleted = deleteNewsletterCampaignStep(id)

    return new WorkflowResponse({ deleted })
  },
)
