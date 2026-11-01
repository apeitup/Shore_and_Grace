import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { deleteFaqCategoryStep } from "./steps/delete-faq-category"

export const deleteFaqCategoryWorkflow = createWorkflow(
  "delete-faq-category",
  function (input: { id: string }) {
    const id = deleteFaqCategoryStep(input.id)
    return new WorkflowResponse({ id })
  },
)
