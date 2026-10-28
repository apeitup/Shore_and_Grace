import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"
import { CUSTOMER_PREFERENCES_MODULE } from "../../../modules/customer-preferences"
import CustomerPreferencesModuleService from "../../../modules/customer-preferences/service"
import { upsertCustomerPreferencesWorkflow } from "../../../workflows/upsert-customer-preferences"

export const PostCustomerPreferencesSchema = z.object({
  personalised_recommendations: z.boolean().optional(),
  remember_delivery_preferences: z.boolean().optional(),
  default_delivery_instructions: z.string().trim().max(1000).nullable().optional(),
  leave_in_safe_place: z.boolean().optional(),
  hide_prices: z.boolean().optional(),
})

export type PostCustomerPreferencesBody = z.infer<
  typeof PostCustomerPreferencesSchema
>

const defaults = (customerId: string) => ({
  customer_id: customerId,
  personalised_recommendations: false,
  remember_delivery_preferences: false,
  default_delivery_instructions: null,
  leave_in_safe_place: false,
  hide_prices: true,
})

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const service: CustomerPreferencesModuleService = req.scope.resolve(
    CUSTOMER_PREFERENCES_MODULE
  )
  const [preferences] = await service.listCustomerPreferences({
    customer_id: req.auth_context.actor_id,
  })
  res.json({ preferences: preferences ?? defaults(req.auth_context.actor_id) })
}

export const POST = async (
  req: AuthenticatedMedusaRequest<PostCustomerPreferencesBody>,
  res: MedusaResponse
) => {
  const { result } = await upsertCustomerPreferencesWorkflow(req.scope).run({
    input: {
      customer_id: req.auth_context.actor_id,
      ...req.validatedBody,
    },
  })
  res.json(result)
}
