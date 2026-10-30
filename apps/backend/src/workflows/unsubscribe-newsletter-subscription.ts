import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  unsubscribeNewsletterSubscriptionStep,
  UnsubscribeNewsletterSubscriptionStepInput,
} from "./steps/unsubscribe-newsletter-subscription"

export const unsubscribeNewsletterSubscriptionWorkflow = createWorkflow(
  "unsubscribe-newsletter-subscription",
  function (input: UnsubscribeNewsletterSubscriptionStepInput) {
    const subscription = unsubscribeNewsletterSubscriptionStep(input)
    return new WorkflowResponse({ subscription })
  }
)
