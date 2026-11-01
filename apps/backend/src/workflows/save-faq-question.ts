import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import {
  saveFaqQuestionStep,
  type SaveFaqQuestionInput,
} from "./steps/save-faq-question"

export const saveFaqQuestionWorkflow = createWorkflow(
  "save-faq-question",
  function (input: SaveFaqQuestionInput) {
    const question = saveFaqQuestionStep(input)
    return new WorkflowResponse({ question })
  },
)
