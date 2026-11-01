import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import {
  saveFaqCategoryStep,
  type SaveFaqCategoryInput,
} from "./steps/save-faq-category"

export const saveFaqCategoryWorkflow = createWorkflow(
  "save-faq-category",
  function (input: SaveFaqCategoryInput) {
    const category = saveFaqCategoryStep(input)
    return new WorkflowResponse({ category })
  },
)
