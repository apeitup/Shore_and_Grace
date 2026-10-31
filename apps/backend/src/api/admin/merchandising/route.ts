import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { z } from "@medusajs/framework/zod"
import { MERCHANDISING_MODULE } from "../../../modules/merchandising"
import type MerchandisingModuleService from "../../../modules/merchandising/service"
import { saveMerchandisingSetWorkflow } from "../../../workflows/save-merchandising-set"

export const MerchandisingKindSchema = z.enum([
  "featured",
  "upsell",
  "complementary",
  "frequently_bought_together",
])

export const GetAdminMerchandisingSchema = z.object({
  kind: MerchandisingKindSchema.optional(),
  source_product_id: z.string().optional(),
  handle: z.string().optional(),
})

export const PostAdminMerchandisingSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1).max(160),
  handle: z
    .string()
    .trim()
    .min(1)
    .max(160)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  kind: MerchandisingKindSchema,
  source_product_id: z.string().nullable().optional(),
  strategy: z.enum(["manual", "automatic"]).optional(),
  active: z.boolean().optional(),
  product_ids: z.array(z.string()).max(100),
})

export type PostAdminMerchandising = z.infer<
  typeof PostAdminMerchandisingSchema
>

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  const service = req.scope.resolve<MerchandisingModuleService>(
    MERCHANDISING_MODULE,
  )
  const query = req.validatedQuery as z.infer<
    typeof GetAdminMerchandisingSchema
  >
  const filter: Record<string, unknown> = {}
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
  const productIds = Array.from(new Set(items.map((item) => item.product_id)))
  const graph = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: products } = productIds.length
    ? await graph.graph({
        entity: "product",
        fields: ["id", "title", "handle", "thumbnail", "status"],
        filters: { id: productIds },
      })
    : { data: [] }
  const productsById = new Map(products.map((product) => [product.id, product]))

  res.json({
    merchandising_sets: sets.map((set) => ({
      ...set,
      items: items
        .filter((item) => item.set_id === set.id)
        .map((item) => ({
          ...item,
          product: productsById.get(item.product_id) || null,
        })),
    })),
  })
}

export const POST = async (
  req: AuthenticatedMedusaRequest<PostAdminMerchandising>,
  res: MedusaResponse,
) => {
  const { result } = await saveMerchandisingSetWorkflow(req.scope).run({
    input: req.validatedBody,
  })

  res.status(201).json({ merchandising_set: result.set })
}
