import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { deleteMerchandisingSetStep } from "./steps/delete-merchandising-set"

export const deleteMerchandisingSetWorkflow = createWorkflow(
  "delete-merchandising-set",
  function (input: { id: string }) {
    const id = deleteMerchandisingSetStep(input.id)
    return new WorkflowResponse({ id })
  },
)
