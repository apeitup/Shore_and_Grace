import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"
import { upsertGiftOrderDetailsWorkflow } from "../../../workflows/upsert-gift-order-details"

export const PostStoreGiftOrderSchema = z.object({
  cart_id: z.string().min(1),
  recipient_type: z.enum(["self", "other"]).optional(),
  recipient_first_name: z.string().trim().max(120).nullable().optional(),
  recipient_last_name: z.string().trim().max(120).nullable().optional(),
  recipient_phone: z.string().trim().max(40).nullable().optional(),
  purchaser_first_name: z.string().trim().max(120).nullable().optional(),
  purchaser_last_name: z.string().trim().max(120).nullable().optional(),
  purchaser_phone: z.string().trim().max(40).nullable().optional(),
  purchaser_email: z.string().trim().email().max(320).nullable().optional(),
  gift_message: z.string().trim().max(1000).nullable().optional(),
  delivery_instructions: z.string().trim().max(1000).nullable().optional(),
  leave_safe: z.boolean().optional(),
  hide_prices: z.boolean().optional(),
  anonymous_sender: z.boolean().optional(),
})

type Body = z.infer<typeof PostStoreGiftOrderSchema>

export const POST = async (req: MedusaRequest<Body>, res: MedusaResponse) => {
  const { result } = await upsertGiftOrderDetailsWorkflow(req.scope).run({
    input: req.validatedBody,
  })
  res.status(201).json(result)
}
