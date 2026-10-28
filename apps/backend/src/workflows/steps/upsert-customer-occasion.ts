import { MedusaError } from "@medusajs/framework/utils"
import {
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { SPECIAL_OCCASION_MODULE } from "../../modules/special-occasion"
import SpecialOccasionModuleService from "../../modules/special-occasion/service"

export type UpsertCustomerOccasionInput = {
  id?: string
  customer_id: string
  system_occasion_id?: string | null
  name?: string
  occasion_date?: string | null
  reminder_days?: number
  enabled?: boolean
  repeats_annually?: boolean
}

export const upsertCustomerOccasionStep = createStep(
  "upsert-customer-occasion",
  async (input: UpsertCustomerOccasionInput, { container }) => {
    const service: SpecialOccasionModuleService = container.resolve(
      SPECIAL_OCCASION_MODULE
    )
    if (input.system_occasion_id) {
      const system = await service.retrieveSystemOccasion(
        input.system_occasion_id
      )
      const [existing] = await service.listCustomerOccasions({
        customer_id: input.customer_id,
        system_occasion_id: input.system_occasion_id,
      })
      const data = {
        customer_id: input.customer_id,
        system_occasion_id: system.id,
        name: system.name,
        occasion_date: null,
        reminder_days:
          input.reminder_days ?? system.default_reminder_days,
        enabled: input.enabled ?? system.enabled_by_default,
        repeats_annually: true,
      }
      if (existing) {
        const updated = await service.updateCustomerOccasions({
          id: existing.id,
          ...data,
        })
        return new StepResponse(updated, {
          created_id: null as string | null,
        })
      }
      const created = await service.createCustomerOccasions(data)
      return new StepResponse(created, {
        created_id: created.id as string | null,
      })
    }

    if (!input.name?.trim() || !input.occasion_date) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "A name and date are required for a memorable date."
      )
    }
    if (input.id) {
      const original = await service.retrieveCustomerOccasion(input.id)
      if (
        original.customer_id !== input.customer_id ||
        original.system_occasion_id
      ) {
        throw new MedusaError(
          MedusaError.Types.NOT_ALLOWED,
          "This memorable date cannot be changed."
        )
      }
      const updated = await service.updateCustomerOccasions({
        id: input.id,
        name: input.name.trim(),
        occasion_date: input.occasion_date,
        reminder_days: input.reminder_days ?? original.reminder_days,
        enabled: input.enabled ?? original.enabled,
        repeats_annually:
          input.repeats_annually ?? original.repeats_annually,
      })
      return new StepResponse(updated, {
        created_id: null as string | null,
      })
    }
    const created = await service.createCustomerOccasions({
      customer_id: input.customer_id,
      system_occasion_id: null,
      name: input.name.trim(),
      occasion_date: input.occasion_date,
      reminder_days: input.reminder_days ?? 14,
      enabled: input.enabled ?? true,
      repeats_annually: input.repeats_annually ?? true,
    })
    return new StepResponse(created, {
      created_id: created.id as string | null,
    })
  },
  async (compensation, { container }) => {
    if (!compensation) {
      return
    }
    const service: SpecialOccasionModuleService = container.resolve(
      SPECIAL_OCCASION_MODULE
    )
    if (compensation.created_id) {
      await service.deleteCustomerOccasions(compensation.created_id)
    }
  }
)
