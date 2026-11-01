import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { FAQ_MODULE } from "../../modules/faq"
import type FaqModuleService from "../../modules/faq/service"

export type SaveFaqQuestionInput = {
  id?: string
  category_id: string
  question: string
  answer: string
  position?: number
  published?: boolean
  featured?: boolean
}

type CompensationData = {
  created_id?: string
  original?: Record<string, unknown>
}

export const saveFaqQuestionStep = createStep(
  "save-faq-question",
  async (input: SaveFaqQuestionInput, { container }) => {
    const service = container.resolve<FaqModuleService>(FAQ_MODULE)
    await service.retrieveFaqCategory(input.category_id)

    const data = {
      category_id: input.category_id,
      question: input.question,
      answer: input.answer,
      position: input.position ?? 0,
      published: input.published ?? false,
      featured: input.featured ?? false,
    }

    if (!input.id) {
      const question = await service.createFaqQuestions(data)
      return new StepResponse(question, { created_id: question.id })
    }

    const current = await service.retrieveFaqQuestion(input.id)
    const original = {
      id: current.id,
      category_id: current.category_id,
      question: current.question,
      answer: current.answer,
      position: current.position,
      published: current.published,
      featured: current.featured,
    }
    const question = await service.updateFaqQuestions({ id: input.id, ...data })

    return new StepResponse(question, { original })
  },
  async (compensation: CompensationData | undefined, { container }) => {
    if (!compensation) return
    const service = container.resolve<FaqModuleService>(FAQ_MODULE)
    if (compensation.created_id) {
      await service.deleteFaqQuestions(compensation.created_id)
    } else if (compensation.original) {
      await service.updateFaqQuestions(compensation.original)
    }
  },
)
