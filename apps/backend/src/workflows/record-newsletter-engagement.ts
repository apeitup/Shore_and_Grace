import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  recordNewsletterEngagementStep,
  RecordNewsletterEngagementStepInput,
} from "./steps/record-newsletter-engagement"

export const recordNewsletterEngagementWorkflow = createWorkflow(
  "record-newsletter-engagement",
  function (input: RecordNewsletterEngagementStepInput) {
    const result = recordNewsletterEngagementStep(input)

    return new WorkflowResponse(result)
  },
)
