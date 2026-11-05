import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  createProductCategoriesWorkflow,
  createProductTagsWorkflow,
  updateProductCategoriesWorkflow,
} from "@medusajs/medusa/core-flows"

import {
  ProductCategoryDefinition,
  shopCategoryStructure,
  shopProductTags,
} from "../lib/product-taxonomy"

type ExistingCategory = {
  id: string
  handle: string
  metadata?: Record<string, unknown> | null
}
export default async function shopTaxonomySeed({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { data: categoryRows } = await query.graph({
    entity: "product_category",
    fields: ["id", "handle", "metadata"],
  })
  const categoriesByHandle = new Map(
    (categoryRows as ExistingCategory[]).map((category) => [
      category.handle,
      category,
    ]),
  )

  const upsertCategory = async (
    category: ProductCategoryDefinition,
    rank: number,
    parentCategoryId: string | null,
  ) => {
    const current = categoriesByHandle.get(category.handle)
    const categoryData = {
      name: category.name,
      handle: category.handle,
      description: category.description,
      is_active: true,
      is_internal: false,
      rank,
      parent_category_id: parentCategoryId,
      metadata: {
        ...(current?.metadata ?? {}),
        product_guide: category.productTypes,
        recommended_tags: category.tags,
      },
    }

    if (current) {
      const { result } = await updateProductCategoriesWorkflow(container).run({
        input: {
          selector: { id: current.id },
          update: categoryData,
        },
      })
      const updated = result[0]
      categoriesByHandle.set(category.handle, updated)
      return updated
    }

    const { result } = await createProductCategoriesWorkflow(container).run({
      input: { product_categories: [categoryData] },
    })
    const created = result[0]
    categoriesByHandle.set(category.handle, created)
    return created
  }

  for (const [rank, category] of shopCategoryStructure.entries()) {
    const parent = await upsertCategory(category, rank, null)

    for (const [childRank, child] of (category.children ?? []).entries()) {
      await upsertCategory(child, childRank, parent.id)
    }
  }

  const { data: existingTags } = await query.graph({
    entity: "product_tag",
    fields: ["value"],
  })
  const existingTagValues = new Set(
    existingTags.map((tag) => String(tag.value)),
  )
  const missingTags = shopProductTags.filter(
    (tag) => !existingTagValues.has(tag),
  )

  if (missingTags.length) {
    await createProductTagsWorkflow(container).run({
      input: {
        product_tags: missingTags.map((value) => ({ value })),
      },
    })
  }

  logger.info(
    `Shore & Grace shop taxonomy ready: ${categoriesByHandle.size} categories checked and ${missingTags.length} tags created.`,
  )
}
