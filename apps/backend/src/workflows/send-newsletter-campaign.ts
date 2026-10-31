import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  sendNewsletterCampaignStep,
  type SendNewsletterCampaignStepInput,
} from "./steps/send-newsletter-campaign"

export const sendNewsletterCampaignWorkflow = createWorkflow(
  "send-newsletter-campaign",
  function (input: SendNewsletterCampaignStepInput) {
    const result = sendNewsletterCampaignStep(input)

    return new WorkflowResponse(result)
  },
)
