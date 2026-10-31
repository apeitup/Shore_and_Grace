import { MedusaError } from "@medusajs/framework/utils"
import {
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { MERCHANDISING_MODULE } from "../../modules/merchandising"
import type MerchandisingModuleService from "../../modules/merchandising/service"

export type MerchandisingKind =
  | "featured"
  | "upsell"
  | "complementary"
  | "frequently_bought_together"

export type SaveMerchandisingSetInput = {
  id?: string
  name: string
  handle: string
  kind: MerchandisingKind
  source_product_id?: string | null
  strategy?: "manual" | "automatic"
  active?: boolean
  product_ids: string[]
}

type ProductReference = { id: string }

type CompensationData = {
  created_set_id?: string
  original_set?: Record<string, unknown>
  original_items?: Array<Record<string, unknown>>
}

export const saveMerchandisingSetStep = createStep(
  "save-merchandising-set",
  async (
    input: {
      data: SaveMerchandisingSetInput
      products: ProductReference[]
    },
    { container },
  ) => {
    const service = container.resolve<MerchandisingModuleService>(
      MERCHANDISING_MODULE,
    )
    const data = input.data
    const uniqueProductIds = Array.from(new Set(data.product_ids))
    const expectedIds = new Set(uniqueProductIds)

    if (data.source_product_id) {
      expectedIds.add(data.source_product_id)
    }

    const foundIds = new Set(input.products.map((product) => product.id))
    const missingIds = Array.from(expectedIds).filter((id) => !foundIds.has(id))

    if (missingIds.length) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Unknown product IDs: ${missingIds.join(", ")}`,
      )
    }

    if (data.kind === "featured" && data.source_product_id) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Featured lists cannot be scoped to a source product.",
      )
    }

    if (data.kind !== "featured" && !data.source_product_id) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Product merchandising sets require a source product.",
      )
    }

    let setId = data.id
    if (!setId) {
      const existing = await service.listMerchandisingSets(
        { handle: data.handle },
        { take: 1 },
      )
      setId = existing[0]?.id
    }

    let originalSet: Record<string, unknown> | undefined
    let originalItems: Array<Record<string, unknown>> = []
    let set

    const setInput = {
      ...(setId ? { id: setId } : {}),
      name: data.name,
      handle: data.handle,
      kind: data.kind,
      source_product_id: data.source_product_id || null,
      strategy: data.strategy || "manual",
      active: data.active ?? true,
    }

    if (setId) {
      const currentSet = await service.retrieveMerchandisingSet(setId)
      originalSet = {
        id: currentSet.id,
        name: currentSet.name,
        handle: currentSet.handle,
        kind: currentSet.kind,
        source_product_id: currentSet.source_product_id,
        strategy: currentSet.strategy,
        active: currentSet.active,
      }
      const currentItems = await service.listMerchandisingItems({ set_id: setId })
      originalItems = currentItems.map((item) => ({
        set_id: item.set_id,
        product_id: item.product_id,
        position: item.position,
      }))
      if (currentItems.length) {
        await service.deleteMerchandisingItems(currentItems.map((item) => item.id))
      }
      set = await service.updateMerchandisingSets(setInput)
    } else {
      set = await service.createMerchandisingSets(setInput)
      setId = set.id
    }

    const items = uniqueProductIds.length
      ? await service.createMerchandisingItems(
          uniqueProductIds.map((productId, position) => ({
            set_id: setId!,
            product_id: productId,
            position,
          })),
        )
      : []

    return new StepResponse(
      { ...set, items },
      originalSet
        ? { original_set: originalSet, original_items: originalItems }
        : { created_set_id: set.id },
    )
  },
  async (compensation: CompensationData | undefined, { container }) => {
    if (!compensation) {
      return
    }

    const service = container.resolve<MerchandisingModuleService>(
      MERCHANDISING_MODULE,
    )

    if (compensation.created_set_id) {
      const items = await service.listMerchandisingItems({
        set_id: compensation.created_set_id,
      })
      if (items.length) {
        await service.deleteMerchandisingItems(items.map((item) => item.id))
      }
      await service.deleteMerchandisingSets(compensation.created_set_id)
      return
    }

    if (compensation.original_set) {
      const setId = compensation.original_set.id as string
      const items = await service.listMerchandisingItems({ set_id: setId })
      if (items.length) {
        await service.deleteMerchandisingItems(items.map((item) => item.id))
      }
      await service.updateMerchandisingSets(compensation.original_set)
      if (compensation.original_items?.length) {
        await service.createMerchandisingItems(compensation.original_items)
      }
    }
  },
)
