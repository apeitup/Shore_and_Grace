import {
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { MERCHANDISING_MODULE } from "../../modules/merchandising"
import type MerchandisingModuleService from "../../modules/merchandising/service"

export const deleteMerchandisingSetStep = createStep(
  "delete-merchandising-set",
  async (id: string, { container }) => {
    const service = container.resolve<MerchandisingModuleService>(
      MERCHANDISING_MODULE,
    )
    const set = await service.retrieveMerchandisingSet(id)
    const items = await service.listMerchandisingItems({ set_id: id })
    if (items.length) {
      await service.deleteMerchandisingItems(items.map((item) => item.id))
    }
    await service.deleteMerchandisingSets(id)

    return new StepResponse(id, {
      set: {
        name: set.name,
        handle: set.handle,
        kind: set.kind,
        source_product_id: set.source_product_id,
        strategy: set.strategy,
        active: set.active,
      },
      items: items.map((item) => ({
        product_id: item.product_id,
        position: item.position,
      })),
    })
  },
  async (original, { container }) => {
    if (!original) {
      return
    }
    const service = container.resolve<MerchandisingModuleService>(
      MERCHANDISING_MODULE,
    )
    const set = await service.createMerchandisingSets(original.set)
    if (original.items.length) {
      await service.createMerchandisingItems(
        original.items.map((item: { product_id: string; position: number }) => ({
          ...item,
          set_id: set.id,
        })),
      )
    }
  },
)
