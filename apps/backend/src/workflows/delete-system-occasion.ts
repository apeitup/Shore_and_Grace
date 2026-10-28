import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { deleteSystemOccasionStep } from "./steps/delete-system-occasion"

export const deleteSystemOccasionWorkflow = createWorkflow(
  "delete-system-occasion",
  function (id: string) {
    const deletedId = deleteSystemOccasionStep(id)
    return new WorkflowResponse({ deleted_id: deletedId })
  }
)
