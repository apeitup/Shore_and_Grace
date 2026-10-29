import {
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { CUSTOMER_PREFERENCES_MODULE } from "../../modules/customer-preferences"
import CustomerPreferencesModuleService from "../../modules/customer-preferences/service"

export type UpsertCustomerPreferencesInput = {
  customer_id: string
  personalised_recommendations?: boolean
  remember_delivery_preferences?: boolean
  delivery_updates?: boolean
  occasion_reminders?: boolean
  marketing_collections?: boolean
  marketing_offers?: boolean
  marketing_stories?: boolean
  default_delivery_instructions?: string | null
  leave_in_safe_place?: boolean
  hide_prices?: boolean
}

type Compensation = {
  created_id?: string
  previous?: Record<string, unknown>
}

export const upsertCustomerPreferencesStep = createStep(
  "upsert-customer-preferences",
  async (input: UpsertCustomerPreferencesInput, { container }) => {
    const service: CustomerPreferencesModuleService = container.resolve(
      CUSTOMER_PREFERENCES_MODULE
    )
    const [existing] = await service.listCustomerPreferences({
      customer_id: input.customer_id,
    })

    if (existing) {
      const updated = await service.updateCustomerPreferences({
        id: existing.id,
        ...input,
      })
      return new StepResponse(updated, {
        previous: { ...existing },
      } satisfies Compensation)
    }

    const created = await service.createCustomerPreferences(input)
    return new StepResponse(created, {
      created_id: created.id,
    } satisfies Compensation)
  },
  async (compensation: Compensation | undefined, { container }) => {
    if (!compensation) {
      return
    }
    const service: CustomerPreferencesModuleService = container.resolve(
      CUSTOMER_PREFERENCES_MODULE
    )
    if (compensation.created_id) {
      await service.deleteCustomerPreferences(compensation.created_id)
      return
    }
    if (compensation.previous?.id) {
      await service.updateCustomerPreferences({
        ...compensation.previous,
        id: compensation.previous.id as string,
      })
    }
  }
)
