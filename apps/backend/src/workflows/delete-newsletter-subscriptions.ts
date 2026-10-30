import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  deleteNewsletterSubscriptionsStep,
  DeleteNewsletterSubscriptionsStepInput,
} from "./steps/delete-newsletter-subscriptions"

export const deleteNewsletterSubscriptionsWorkflow = createWorkflow(
  "delete-newsletter-subscriptions",
  function (input: DeleteNewsletterSubscriptionsStepInput) {
    const result = deleteNewsletterSubscriptionsStep(input)

    return new WorkflowResponse(result)
  },
)
