import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"
import { MERCHANDISING_MODULE } from "../../../modules/merchandising"
import type MerchandisingModuleService from "../../../modules/merchandising/service"
import { MerchandisingKindSchema } from "../../admin/merchandising/route"

export const GetStoreMerchandisingSchema = z.object({
  kind: MerchandisingKindSchema.optional(),
  source_product_id: z.string().optional(),
  handle: z.string().optional(),
})

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const service = req.scope.resolve<MerchandisingModuleService>(
    MERCHANDISING_MODULE,
  )
  const query = req.validatedQuery as z.infer<
    typeof GetStoreMerchandisingSchema
  >
  const filter: Record<string, unknown> = { active: true }
  if (query.kind) filter.kind = query.kind
  if (query.source_product_id) {
    filter.source_product_id = query.source_product_id
  }
  if (query.handle) filter.handle = query.handle

  const sets = await service.listMerchandisingSets(filter, {
    order: { updated_at: "DESC" },
  })
  const setIds = sets.map((set) => set.id)
  const items = setIds.length
    ? await service.listMerchandisingItems(
        { set_id: setIds },
        { order: { position: "ASC" } },
      )
    : []

  res.json({
    merchandising_sets: sets.map((set) => ({
      id: set.id,
      name: set.name,
      handle: set.handle,
      kind: set.kind,
      source_product_id: set.source_product_id,
      strategy: set.strategy,
      product_ids: items
        .filter((item) => item.set_id === set.id)
        .map((item) => item.product_id),
    })),
  })
}
