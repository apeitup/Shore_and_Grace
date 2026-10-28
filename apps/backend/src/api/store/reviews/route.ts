import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"
import { createReviewWorkflow } from "../../../workflows/create-review"

export const PostStoreReviewSchema = z.object({
  content: z.string().trim().min(1).max(4000),
  rating: z.number().int().min(1).max(5),
  product_id: z.string().min(1),
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(320),
})

type PostStoreReviewReq = z.infer<typeof PostStoreReviewSchema>

export const POST = async (
  req: AuthenticatedMedusaRequest<PostStoreReviewReq>,
  res: MedusaResponse
) => {
  const { result } = await createReviewWorkflow(req.scope).run({
    input: {
      ...req.validatedBody,
      customer_id: req.auth_context?.actor_id,
      status: "pending",
    },
  })

  res.status(201).json({
    review: {
      id: result.review.id,
      status: result.review.status,
    },
  })
}
