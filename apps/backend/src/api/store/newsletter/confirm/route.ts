import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"
import { confirmNewsletterSubscriptionWorkflow } from "../../../../workflows/confirm-newsletter-subscription"

export const PostStoreNewsletterConfirmSchema = z.object({
  token: z.string().trim().min(20).max(200),
})

type PostStoreNewsletterConfirmBody = z.infer<
  typeof PostStoreNewsletterConfirmSchema
>

export const POST = async (
  req: MedusaRequest<PostStoreNewsletterConfirmBody>,
  res: MedusaResponse
) => {
  await confirmNewsletterSubscriptionWorkflow(req.scope).run({
    input: req.validatedBody,
  })

  res.status(200).json({
    newsletter: { status: "subscribed" },
  })
}
