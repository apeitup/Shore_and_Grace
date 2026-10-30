import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  confirmNewsletterSubscriptionStep,
  ConfirmNewsletterSubscriptionStepInput,
} from "./steps/confirm-newsletter-subscription"

export const confirmNewsletterSubscriptionWorkflow = createWorkflow(
  "confirm-newsletter-subscription",
  function (input: ConfirmNewsletterSubscriptionStepInput) {
    const subscription = confirmNewsletterSubscriptionStep(input)
    return new WorkflowResponse({ subscription })
  }
)
