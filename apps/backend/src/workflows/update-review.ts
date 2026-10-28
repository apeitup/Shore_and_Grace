import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  updateReviewsStep,
  UpdateReviewsStepInput,
} from "./steps/update-review"

export const updateReviewWorkflow = createWorkflow(
  "update-review",
  (input: UpdateReviewsStepInput) => {
    const reviews = updateReviewsStep(input)

    return new WorkflowResponse({ reviews })
  }
)
