import { MedusaError } from "@medusajs/framework/utils"
import {
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { SPECIAL_OCCASION_MODULE } from "../../modules/special-occasion"
import SpecialOccasionModuleService from "../../modules/special-occasion/service"

export type SystemOccasionDateType =
  | "fixed"
  | "easter"
  | "mothering_sunday"
  | "fathers_day"

export type CreateSystemOccasionInput = {
  name: string
  slug: string
  date_type: SystemOccasionDateType
  month?: number | null
  day?: number | null
  default_reminder_days?: number
  enabled_by_default?: boolean
  active?: boolean
  description?: string | null
  sort_order?: number
}

const validateFixedDate = (input: CreateSystemOccasionInput) => {
  if (input.date_type !== "fixed") {
    return
  }
  if (!input.month || !input.day) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Fixed occasions require a month and day."
    )
  }
}

export const createSystemOccasionStep = createStep(
  "create-system-occasion",
  async (input: CreateSystemOccasionInput, { container }) => {
    validateFixedDate(input)
    const service: SpecialOccasionModuleService = container.resolve(
      SPECIAL_OCCASION_MODULE
    )
    const [existing] = await service.listSystemOccasions({ slug: input.slug })
    if (existing) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "An occasion with this slug already exists."
      )
    }
    const occasion = await service.createSystemOccasions({
      ...input,
      month: input.date_type === "fixed" ? input.month : null,
      day: input.date_type === "fixed" ? input.day : null,
    })
    return new StepResponse(occasion, { id: occasion.id, created: true })
  },
  async (compensation, { container }) => {
    if (!compensation?.created) {
      return
    }
    const service: SpecialOccasionModuleService = container.resolve(
      SPECIAL_OCCASION_MODULE
    )
    await service.deleteSystemOccasions(compensation.id)
  }
)
