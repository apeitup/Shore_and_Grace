import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"
import { createBlockedDeliveryDateWorkflow } from "../../../../workflows/create-blocked-delivery-date"

export const PostAdminBlockedDeliveryDateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  fulfillment_type: z.enum(["delivery", "collection", "all"]).default("all"),
  reason: z.string().trim().max(240).nullable().optional(),
})

type Body = z.infer<typeof PostAdminBlockedDeliveryDateSchema>

export const POST = async (req: MedusaRequest<Body>, res: MedusaResponse) => {
  const { result } = await createBlockedDeliveryDateWorkflow(req.scope).run({
    input: req.validatedBody,
  })
  res.status(201).json(result)
}
