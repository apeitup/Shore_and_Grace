import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"
import { unsubscribeNewsletterSubscriptionWorkflow } from "../../../../workflows/unsubscribe-newsletter-subscription"

export const PostStoreNewsletterUnsubscribeSchema = z.object({
  token: z.string().trim().min(20).max(500),
})

type PostStoreNewsletterUnsubscribeBody = z.infer<
  typeof PostStoreNewsletterUnsubscribeSchema
>

export const POST = async (
  req: MedusaRequest<PostStoreNewsletterUnsubscribeBody>,
  res: MedusaResponse
) => {
  await unsubscribeNewsletterSubscriptionWorkflow(req.scope).run({
    input: req.validatedBody,
  })

  res.status(200).json({
    newsletter: { status: "unsubscribed" },
  })
}
