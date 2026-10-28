import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { createReviewStep, CreateReviewStepInput } from "./steps/create-review"

export const createReviewWorkflow = createWorkflow(
  "create-review",
  (input: CreateReviewStepInput) => {
    useQueryGraphStep({
      entity: "product",
      fields: ["id"],
      filters: {
        id: input.product_id,
      },
      options: {
        throwIfKeyNotFound: true,
      },
    })

    const review = createReviewStep(input)

    return new WorkflowResponse({ review })
  }
)
