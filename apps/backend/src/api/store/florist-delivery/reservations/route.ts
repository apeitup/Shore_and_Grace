import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"
import { upsertDeliveryReservationWorkflow } from "../../../../workflows/upsert-delivery-reservation"

export const PostStoreDeliveryReservationSchema = z.object({
  cart_id: z.string().min(1),
  zone_id: z.string().min(1),
  postcode: z.string().trim().max(16).nullable().optional(),
  delivery_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

type Body = z.infer<typeof PostStoreDeliveryReservationSchema>

export const POST = async (req: MedusaRequest<Body>, res: MedusaResponse) => {
  const { result } = await upsertDeliveryReservationWorkflow(req.scope).run({
    input: req.validatedBody,
  })
  res.status(201).json(result)
}
