import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"
import {
  addWishlistItemStep,
  AddWishlistItemStepInput,
} from "./steps/add-wishlist-item"

export const addWishlistItemWorkflow = createWorkflow(
  "add-wishlist-item",
  (input: AddWishlistItemStepInput) => {
    useQueryGraphStep({
      entity: "product",
      fields: ["id"],
      filters: {
        id: input.product_id,
      },
      options: {
        throwIfKeyNotFound: true,
      },
    })

    const item = addWishlistItemStep(input)

    return new WorkflowResponse({ item })
  }
)
