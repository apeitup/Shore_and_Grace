import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"
import { deleteCustomerOccasionWorkflow } from "../../../../../workflows/delete-customer-occasion"
import { upsertCustomerOccasionWorkflow } from "../../../../../workflows/upsert-customer-occasion"

export const PostStoreOccasionUpdateSchema = z.object({
  name: z.string().trim().min(1),
  occasion_date: z.iso.date(),
  reminder_days: z.number().int().min(0).max(365),
  enabled: z.boolean(),
  repeats_annually: z.boolean(),
})

export type PostStoreOccasionUpdateBody = z.infer<
  typeof PostStoreOccasionUpdateSchema
>

export const POST = async (
  req: AuthenticatedMedusaRequest<PostStoreOccasionUpdateBody>,
  res: MedusaResponse
) => {
  const { result } = await upsertCustomerOccasionWorkflow(req.scope).run({
    input: {
      id: req.params.id,
      customer_id: req.auth_context.actor_id,
      ...req.validatedBody,
    },
  })
  res.json(result)
}

export const DELETE = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  await deleteCustomerOccasionWorkflow(req.scope).run({
    input: {
      id: req.params.id,
      customer_id: req.auth_context.actor_id,
    },
  })
  res.status(200).json({ id: req.params.id, deleted: true })
}
