import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  updatePrivacyRequestStep,
  UpdatePrivacyRequestStepInput,
} from "./steps/update-privacy-request"

export const updatePrivacyRequestWorkflow = createWorkflow(
  "update-privacy-request",
  (input: UpdatePrivacyRequestStepInput) => {
    const request = updatePrivacyRequestStep(input)
    return new WorkflowResponse({ request })
  }
)
