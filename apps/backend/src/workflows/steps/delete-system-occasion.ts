import {
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { SPECIAL_OCCASION_MODULE } from "../../modules/special-occasion"
import SpecialOccasionModuleService from "../../modules/special-occasion/service"

export const deleteSystemOccasionStep = createStep(
  "delete-system-occasion",
  async (id: string, { container }) => {
    const service: SpecialOccasionModuleService = container.resolve(
      SPECIAL_OCCASION_MODULE
    )
    await service.retrieveSystemOccasion(id)
    await service.deleteSystemOccasions(id)
    return new StepResponse(id, id)
  },
  async (id, { container }) => {
    if (!id) {
      return
    }
    const service: SpecialOccasionModuleService = container.resolve(
      SPECIAL_OCCASION_MODULE
    )
    await service.restoreSystemOccasions(id)
  }
)
