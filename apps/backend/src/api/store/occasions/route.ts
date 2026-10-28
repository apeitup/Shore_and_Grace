import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"
import { SPECIAL_OCCASION_MODULE } from "../../../modules/special-occasion"
import SpecialOccasionModuleService from "../../../modules/special-occasion/service"
import { resolveNextOccasionDate } from "../../../utils/occasion-dates"
import { upsertCustomerOccasionWorkflow } from "../../../workflows/upsert-customer-occasion"

export const PostStoreOccasionSchema = z.object({
  name: z.string().trim().min(1),
  occasion_date: z.iso.date(),
  reminder_days: z.number().int().min(0).max(365).default(14),
  enabled: z.boolean().default(true),
  repeats_annually: z.boolean().default(true),
})

export type PostStoreOccasionBody = z.infer<typeof PostStoreOccasionSchema>

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const service: SpecialOccasionModuleService = req.scope.resolve(
    SPECIAL_OCCASION_MODULE
  )
  const [systemOccasions, customerOccasions] = await Promise.all([
    service.listSystemOccasions(
      { active: true },
      { order: { sort_order: "ASC", name: "ASC" } }
    ),
    service.listCustomerOccasions(
      { customer_id: req.auth_context.actor_id },
      { order: { created_at: "ASC" } }
    ),
  ])
  const preferences = new Map(
    customerOccasions
      .filter((item) => item.system_occasion_id)
      .map((item) => [item.system_occasion_id, item])
  )
  res.json({
    system_occasions: systemOccasions.map((occasion) => {
      const preference = preferences.get(occasion.id)
      return {
        ...occasion,
        next_date: resolveNextOccasionDate(occasion),
        enabled: preference?.enabled ?? occasion.enabled_by_default,
        reminder_days:
          preference?.reminder_days ?? occasion.default_reminder_days,
        preference_id: preference?.id ?? null,
      }
    }),
    customer_occasions: customerOccasions.filter(
      (item) => !item.system_occasion_id
    ),
  })
}

export const POST = async (
  req: AuthenticatedMedusaRequest<PostStoreOccasionBody>,
  res: MedusaResponse
) => {
  const { result } = await upsertCustomerOccasionWorkflow(req.scope).run({
    input: {
      customer_id: req.auth_context.actor_id,
      ...req.validatedBody,
    },
  })
  res.status(201).json(result)
}
