import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  upsertCustomerPreferencesStep,
  UpsertCustomerPreferencesInput,
} from "./steps/upsert-customer-preferences"

export const upsertCustomerPreferencesWorkflow = createWorkflow(
  "upsert-customer-preferences",
  function (input: UpsertCustomerPreferencesInput) {
    const preferences = upsertCustomerPreferencesStep(input)
    return new WorkflowResponse({ preferences })
  }
)
