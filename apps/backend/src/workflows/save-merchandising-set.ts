import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"
import {
  saveMerchandisingSetStep,
  type SaveMerchandisingSetInput,
} from "./steps/save-merchandising-set"

export const saveMerchandisingSetWorkflow = createWorkflow(
  "save-merchandising-set",
  function (input: SaveMerchandisingSetInput) {
    const productIds = transform({ input }, ({ input }) =>
      Array.from(
        new Set(
          [input.source_product_id, ...input.product_ids].filter(
            (value): value is string => Boolean(value),
          ),
        ),
      ),
    )
    const { data: products } = useQueryGraphStep({
      entity: "product",
      fields: ["id"],
      filters: { id: productIds },
    })
    const set = saveMerchandisingSetStep({ data: input, products })

    return new WorkflowResponse({ set })
  },
)
