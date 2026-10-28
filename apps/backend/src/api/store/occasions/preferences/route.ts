import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"
import { upsertCustomerOccasionWorkflow } from "../../../../workflows/upsert-customer-occasion"

export const PostStoreOccasionPreferenceSchema = z.object({
  system_occasion_id: z.string().min(1),
  reminder_days: z.number().int().min(0).max(365).optional(),
  enabled: z.boolean(),
})

export type PostStoreOccasionPreferenceBody = z.infer<
  typeof PostStoreOccasionPreferenceSchema
>

export const POST = async (
  req: AuthenticatedMedusaRequest<PostStoreOccasionPreferenceBody>,
  res: MedusaResponse
) => {
  const { result } = await upsertCustomerOccasionWorkflow(req.scope).run({
    input: {
      customer_id: req.auth_context.actor_id,
      ...req.validatedBody,
    },
  })
  res.json(result)
}
