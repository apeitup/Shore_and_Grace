import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  createPrivacyRequestStep,
  CreatePrivacyRequestStepInput,
} from "./steps/create-privacy-request"
import { emitEventStep } from "@medusajs/medusa/core-flows"

export const createPrivacyRequestWorkflow = createWorkflow(
  "create-privacy-request",
  (input: CreatePrivacyRequestStepInput) => {
    const request = createPrivacyRequestStep(input)
    emitEventStep({
      eventName: "privacy_request.created",
      data: { id: request.id },
    })
    return new WorkflowResponse({ request })
  }
)
