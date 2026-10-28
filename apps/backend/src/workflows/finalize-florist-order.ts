import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  finalizeFloristOrderStep,
  FinalizeFloristOrderInput,
} from "./steps/finalize-florist-order"

export const finalizeFloristOrderWorkflow = createWorkflow(
  "finalize-florist-order",
  (input: FinalizeFloristOrderInput) => {
    const result = finalizeFloristOrderStep(input)
    return new WorkflowResponse(result)
  }
)
