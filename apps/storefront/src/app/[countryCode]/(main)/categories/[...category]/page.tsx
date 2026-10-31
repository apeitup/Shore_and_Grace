import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getCategoryByHandle } from "@lib/data/categories"
import { getSiteOrigin } from "@lib/util/site"
import CategoryTemplate from "@modules/categories/templates"

type Props = {
  params: Promise<{ category: string[]; countryCode: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  try {
    const productCategory = await getCategoryByHandle(params.category)

    const title = `${productCategory.name} | Shore & Grace`

    const description = productCategory.description ?? `${title} category.`
    const origin = await getSiteOrigin()

    return {
      title,
      description,
      alternates: {
        canonical: `${origin}/categories/${params.category.join("/")}`,
      },
    }
  } catch {
    notFound()
  }
}

export default async function CategoryPage(props: Props) {
  const params = await props.params

  const productCategory = await getCategoryByHandle(params.category)

  if (!productCategory) {
    notFound()
  }

  return (
    <CategoryTemplate
      category={productCategory}
      countryCode={params.countryCode}
    />
  )
}
