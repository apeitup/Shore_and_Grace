import { MedusaError } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { FAQ_MODULE } from "../../modules/faq"
import type FaqModuleService from "../../modules/faq/service"

export const deleteFaqCategoryStep = createStep(
  "delete-faq-category",
  async (id: string, { container }) => {
    const service = container.resolve<FaqModuleService>(FAQ_MODULE)
    const questions = await service.listFaqQuestions({ category_id: id }, { take: 1 })
    if (questions.length) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Move or delete this category's questions before deleting the category.",
      )
    }
    const current = await service.retrieveFaqCategory(id)
    const original = {
      name: current.name,
      handle: current.handle,
      description: current.description,
      position: current.position,
      active: current.active,
    }
    await service.deleteFaqCategories(id)
    return new StepResponse(id, original)
  },
  async (original: Record<string, unknown> | undefined, { container }) => {
    if (!original) return
    const service = container.resolve<FaqModuleService>(FAQ_MODULE)
    await service.createFaqCategories(original)
  },
)
