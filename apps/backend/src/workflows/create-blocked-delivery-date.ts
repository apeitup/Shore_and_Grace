import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  createBlockedDeliveryDateStep,
  CreateBlockedDeliveryDateInput,
} from "./steps/create-blocked-delivery-date"

export const createBlockedDeliveryDateWorkflow = createWorkflow(
  "create-blocked-delivery-date",
  (input: CreateBlockedDeliveryDateInput) => {
    const blockedDate = createBlockedDeliveryDateStep(input)
    return new WorkflowResponse({ blocked_date: blockedDate })
  }
)
