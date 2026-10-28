import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"
import { WISHLIST_MODULE } from "../../../modules/wishlist"
import WishlistModuleService from "../../../modules/wishlist/service"
import { addWishlistItemWorkflow } from "../../../workflows/add-wishlist-item"

export const PostStoreWishlistSchema = z.object({
  product_id: z.string().min(1),
})

export type PostStoreWishlistReq = z.infer<typeof PostStoreWishlistSchema>

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const wishlistModuleService: WishlistModuleService = req.scope.resolve(
    WISHLIST_MODULE
  )
  const items = await wishlistModuleService.listWishlistItems(
    { customer_id: req.auth_context.actor_id },
    { order: { created_at: "DESC" } }
  )

  res.json({ items })
}

export const POST = async (
  req: AuthenticatedMedusaRequest<PostStoreWishlistReq>,
  res: MedusaResponse
) => {
  const { result } = await addWishlistItemWorkflow(req.scope).run({
    input: {
      customer_id: req.auth_context.actor_id,
      product_id: req.validatedBody.product_id,
    },
  })

  res.status(201).json(result)
}
