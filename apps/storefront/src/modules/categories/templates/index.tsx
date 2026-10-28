import { getRegion } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"
import StoreTemplate, { StoreCategoryContext } from "@modules/store/templates"
import { notFound } from "next/navigation"

export default async function CategoryTemplate({
  category,
  countryCode,
}: {
  category: HttpTypes.StoreProductCategory
  countryCode: string
}) {
  if (!category || !countryCode) notFound()

  const region = await getRegion(countryCode)

  if (!region) notFound()

  const parents: HttpTypes.StoreProductCategory[] = []
  let parent = category.parent_category

  while (parent) {
    parents.unshift(parent)
    parent = parent.parent_category
  }

  const categoryContext: StoreCategoryContext = {
    name: category.name,
    trail: [
      { label: "Shop", href: "/store" },
      ...parents.map((parentCategory) => ({
        label: parentCategory.name,
        href: `/categories/${parentCategory.handle}`,
      })),
      { label: category.name },
    ],
    subcategories: (category.category_children ?? []).map((child) => ({
      id: child.id,
      name: child.name,
      handle: child.handle,
    })),
  }

  return (
    <StoreTemplate
      currencyCode={region.currency_code}
      regionId={region.id}
      category={categoryContext}
    />
  )
}
