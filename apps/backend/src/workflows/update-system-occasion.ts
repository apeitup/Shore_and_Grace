import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  updateSystemOccasionStep,
  UpdateSystemOccasionInput,
} from "./steps/update-system-occasion"

export const updateSystemOccasionWorkflow = createWorkflow(
  "update-system-occasion",
  function (input: UpdateSystemOccasionInput) {
    const occasion = updateSystemOccasionStep(input)
    return new WorkflowResponse({ occasion })
  }
)
