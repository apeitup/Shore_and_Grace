import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  upsertCustomerOccasionStep,
  UpsertCustomerOccasionInput,
} from "./steps/upsert-customer-occasion"

export const upsertCustomerOccasionWorkflow = createWorkflow(
  "upsert-customer-occasion",
  function (input: UpsertCustomerOccasionInput) {
    const occasion = upsertCustomerOccasionStep(input)
    return new WorkflowResponse({ occasion })
  }
)
