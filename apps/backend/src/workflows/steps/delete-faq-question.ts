import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { FAQ_MODULE } from "../../modules/faq"
import type FaqModuleService from "../../modules/faq/service"

export const deleteFaqQuestionStep = createStep(
  "delete-faq-question",
  async (id: string, { container }) => {
    const service = container.resolve<FaqModuleService>(FAQ_MODULE)
    const current = await service.retrieveFaqQuestion(id)
    const original = {
      category_id: current.category_id,
      question: current.question,
      answer: current.answer,
      position: current.position,
      published: current.published,
      featured: current.featured,
    }
    await service.deleteFaqQuestions(id)
    return new StepResponse(id, original)
  },
  async (original: Record<string, unknown> | undefined, { container }) => {
    if (!original) return
    const service = container.resolve<FaqModuleService>(FAQ_MODULE)
    await service.createFaqQuestions(original)
  },
)
