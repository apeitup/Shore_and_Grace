import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"
import { recordNewsletterEngagementWorkflow } from "../../../../workflows/record-newsletter-engagement"

export const GetNewsletterOpenSchema = z.object({
  token: z.string().trim().min(20).max(5000),
})

type GetNewsletterOpenQuery = z.infer<typeof GetNewsletterOpenSchema>

const transparentGif = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==",
  "base64",
)

export const GET = async (
  req: MedusaRequest<unknown, GetNewsletterOpenQuery>,
  res: MedusaResponse,
) => {
  await recordNewsletterEngagementWorkflow(req.scope).run({
    input: { token: req.validatedQuery.token, action: "open" },
  })

  res.set({
    "Cache-Control": "no-store, max-age=0",
    "Content-Type": "image/gif",
  })
  res.status(200).send(transparentGif)
}
