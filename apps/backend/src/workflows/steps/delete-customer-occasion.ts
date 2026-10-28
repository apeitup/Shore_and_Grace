import { MedusaError } from "@medusajs/framework/utils"
import {
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { SPECIAL_OCCASION_MODULE } from "../../modules/special-occasion"
import SpecialOccasionModuleService from "../../modules/special-occasion/service"

export type DeleteCustomerOccasionInput = {
  id: string
  customer_id: string
}

export const deleteCustomerOccasionStep = createStep(
  "delete-customer-occasion",
  async (input: DeleteCustomerOccasionInput, { container }) => {
    const service: SpecialOccasionModuleService = container.resolve(
      SPECIAL_OCCASION_MODULE
    )
    const occasion = await service.retrieveCustomerOccasion(input.id)
    if (occasion.customer_id !== input.customer_id) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "This memorable date cannot be deleted."
      )
    }
    await service.deleteCustomerOccasions(input.id)
    return new StepResponse(input.id, input.id)
  },
  async (id, { container }) => {
    if (!id) {
      return
    }
    const service: SpecialOccasionModuleService = container.resolve(
      SPECIAL_OCCASION_MODULE
    )
    await service.restoreCustomerOccasions(id)
  }
)
