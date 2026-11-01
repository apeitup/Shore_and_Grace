import { MedusaError } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { FAQ_MODULE } from "../../modules/faq"
import type FaqModuleService from "../../modules/faq/service"

export type SaveFaqCategoryInput = {
  id?: string
  name: string
  handle: string
  description?: string | null
  position?: number
  active?: boolean
}

type CompensationData = {
  created_id?: string
  original?: Record<string, unknown>
}

export const saveFaqCategoryStep = createStep(
  "save-faq-category",
  async (input: SaveFaqCategoryInput, { container }) => {
    const service = container.resolve<FaqModuleService>(FAQ_MODULE)
    const duplicates = await service.listFaqCategories(
      { handle: input.handle },
      { take: 2 },
    )
    const duplicate = duplicates.find((category) => category.id !== input.id)

    if (duplicate) {
      throw new MedusaError(
        MedusaError.Types.DUPLICATE_ERROR,
        "A FAQ category already uses this handle.",
      )
    }

    const data = {
      name: input.name,
      handle: input.handle,
      description: input.description || null,
      position: input.position ?? 0,
      active: input.active ?? true,
    }

    if (!input.id) {
      const category = await service.createFaqCategories(data)
      return new StepResponse(category, { created_id: category.id })
    }

    const current = await service.retrieveFaqCategory(input.id)
    const original = {
      id: current.id,
      name: current.name,
      handle: current.handle,
      description: current.description,
      position: current.position,
      active: current.active,
    }
    const category = await service.updateFaqCategories({ id: input.id, ...data })

    return new StepResponse(category, { original })
  },
  async (compensation: CompensationData | undefined, { container }) => {
    if (!compensation) return
    const service = container.resolve<FaqModuleService>(FAQ_MODULE)
    if (compensation.created_id) {
      await service.deleteFaqCategories(compensation.created_id)
    } else if (compensation.original) {
      await service.updateFaqCategories(compensation.original)
    }
  },
)
