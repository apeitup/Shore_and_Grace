import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  saveNewsletterCampaignStep,
  type SaveNewsletterCampaignStepInput,
} from "./steps/save-newsletter-campaign"

export const saveNewsletterCampaignWorkflow = createWorkflow(
  "save-newsletter-campaign",
  function (input: SaveNewsletterCampaignStepInput) {
    const campaign = saveNewsletterCampaignStep(input)

    return new WorkflowResponse({ campaign })
  },
)
