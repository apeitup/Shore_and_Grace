import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { deleteFaqQuestionStep } from "./steps/delete-faq-question"

export const deleteFaqQuestionWorkflow = createWorkflow(
  "delete-faq-question",
  function (input: { id: string }) {
    const id = deleteFaqQuestionStep(input.id)
    return new WorkflowResponse({ id })
  },
)
