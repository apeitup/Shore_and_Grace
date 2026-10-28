import { MedusaError } from "@medusajs/framework/utils"
import {
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { SPECIAL_OCCASION_MODULE } from "../../modules/special-occasion"
import SpecialOccasionModuleService from "../../modules/special-occasion/service"
import { SystemOccasionDateType } from "./create-system-occasion"

export type UpdateSystemOccasionInput = {
  id: string
  name?: string
  slug?: string
  date_type?: SystemOccasionDateType
  month?: number | null
  day?: number | null
  default_reminder_days?: number
  enabled_by_default?: boolean
  active?: boolean
  description?: string | null
  sort_order?: number
}

export const updateSystemOccasionStep = createStep(
  "update-system-occasion",
  async (input: UpdateSystemOccasionInput, { container }) => {
    const service: SpecialOccasionModuleService = container.resolve(
      SPECIAL_OCCASION_MODULE
    )
    const original = await service.retrieveSystemOccasion(input.id)
    const dateType = input.date_type ?? original.date_type
    const month = input.month === undefined ? original.month : input.month
    const day = input.day === undefined ? original.day : input.day
    if (dateType === "fixed" && (!month || !day)) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Fixed occasions require a month and day."
      )
    }
    const occasion = await service.updateSystemOccasions({
      ...input,
      month: dateType === "fixed" ? month : null,
      day: dateType === "fixed" ? day : null,
    })
    return new StepResponse(occasion, original)
  },
  async (original, { container }) => {
    if (!original) {
      return
    }
    const service: SpecialOccasionModuleService = container.resolve(
      SPECIAL_OCCASION_MODULE
    )
    await service.updateSystemOccasions(original)
  }
)
