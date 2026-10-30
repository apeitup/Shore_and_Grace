import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"
import { deleteNewsletterSubscriptionsWorkflow } from "../../../../workflows/delete-newsletter-subscriptions"

export const PostAdminNewsletterBatchSchema = z.object({
  action: z.literal("delete"),
  ids: z.array(z.string().trim().min(1)).min(1).max(500),
})

type PostAdminNewsletterBatch = z.infer<
  typeof PostAdminNewsletterBatchSchema
>

export const POST = async (
  req: MedusaRequest<PostAdminNewsletterBatch>,
  res: MedusaResponse,
) => {
  const { result } = await deleteNewsletterSubscriptionsWorkflow(
    req.scope,
  ).run({
    input: { ids: req.validatedBody.ids },
  })

  res.json(result)
}
