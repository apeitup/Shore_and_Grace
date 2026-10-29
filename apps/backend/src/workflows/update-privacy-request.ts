import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  updatePrivacyRequestStep,
  UpdatePrivacyRequestStepInput,
} from "./steps/update-privacy-request"
import { emitEventStep } from "@medusajs/medusa/core-flows"

export const updatePrivacyRequestWorkflow = createWorkflow(
  "update-privacy-request",
  (input: UpdatePrivacyRequestStepInput) => {
    const request = updatePrivacyRequestStep(input)
    emitEventStep({
      eventName: "privacy_request.updated",
      data: { id: request.id },
    })
    return new WorkflowResponse({ request })
  }
)
