import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { removeWishlistItemWorkflow } from "../../../../workflows/remove-wishlist-item"

export const DELETE = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  await removeWishlistItemWorkflow(req.scope).run({
    input: {
      customer_id: req.auth_context.actor_id,
      product_id: req.params.productId,
    },
  })

  res.status(200).json({ id: req.params.productId, deleted: true })
}
