import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  createSystemOccasionStep,
  CreateSystemOccasionInput,
} from "./steps/create-system-occasion"

export const createSystemOccasionWorkflow = createWorkflow(
  "create-system-occasion",
  function (input: CreateSystemOccasionInput) {
    const occasion = createSystemOccasionStep(input)
    return new WorkflowResponse({ occasion })
  }
)
