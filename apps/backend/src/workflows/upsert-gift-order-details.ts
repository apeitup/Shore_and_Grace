import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  upsertGiftOrderDetailsStep,
  UpsertGiftOrderDetailsInput,
} from "./steps/upsert-gift-order-details"

export const upsertGiftOrderDetailsWorkflow = createWorkflow(
  "upsert-gift-order-details",
  (input: UpsertGiftOrderDetailsInput) => {
    const details = upsertGiftOrderDetailsStep(input)
    return new WorkflowResponse({ details })
  }
)
