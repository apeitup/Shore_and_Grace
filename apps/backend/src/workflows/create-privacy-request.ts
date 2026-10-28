import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  createPrivacyRequestStep,
  CreatePrivacyRequestStepInput,
} from "./steps/create-privacy-request"

export const createPrivacyRequestWorkflow = createWorkflow(
  "create-privacy-request",
  (input: CreatePrivacyRequestStepInput) => {
    const request = createPrivacyRequestStep(input)
    return new WorkflowResponse({ request })
  }
)
