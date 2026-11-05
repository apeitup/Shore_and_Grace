import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ArrowDown, ArrowUpMini, Sparkles, Trash } from "@medusajs/icons"
import type { HttpTypes } from "@medusajs/types"
import {
  Button,
  Container,
  Heading,
  IconButton,
  Input,
  Select,
  Text,
  toast,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"

import { sdk } from "../../lib/sdk"

type CategoryMetadata = Record<string, unknown>

type OccasionDraft = {
  categoryId: string
  displayTitle: string
}

type MerchandisingItem = {
  product_id: string
}

type MerchandisingSet = {
  id: string
  handle: string
  items: MerchandisingItem[]
}

const defaultOccasionHandles = [
  "christmas",
  "birthday",
  "autumn",
  "anniversary",
]

const readRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}

const readHomepagePlacement = (category: HttpTypes.AdminProductCategory) => {
  const metadata = readRecord(category.metadata)
  const placement = readRecord(metadata.homepage_popular)

  return {
    enabled: placement.enabled === true,
    position: typeof placement.position === "number" ? placement.position : 999,
    sectionTitle:
      typeof placement.section_title === "string" && placement.section_title
        ? placement.section_title
        : "Shop by Popular Occasions",
    displayTitle:
      typeof placement.display_title === "string" && placement.display_title
        ? placement.display_title
        : category.name,
  }
}

const readCardImage = (category: HttpTypes.AdminProductCategory) => {
  const metadata = readRecord(category.metadata)
  const media = readRecord(metadata.category_media)

  return typeof media.card_image_url === "string" ? media.card_image_url : ""
}

const moveItem = <T,>(items: T[], index: number, offset: number) => {
  const target = index + offset
  if (target < 0 || target >= items.length) return items
  const next = [...items]
  const [item] = next.splice(index, 1)
  next.splice(target, 0, item)
  return next
}

const HomepagePage = () => {
  const queryClient = useQueryClient()
  const [occasionDraft, setOccasionDraft] = useState<OccasionDraft[]>([])
  const [occasionSectionTitle, setOccasionSectionTitle] = useState(
    "Shop by Popular Occasions",
  )
  const [giftProductIds, setGiftProductIds] = useState<string[]>([])
  const [giftSectionTitle, setGiftSectionTitle] = useState("Gifts")
  const [occasionsReady, setOccasionsReady] = useState(false)
  const [giftsReady, setGiftsReady] = useState(false)

  const categoriesQuery = useQuery({
    queryKey: ["homepage", "categories"],
    queryFn: () =>
      sdk.admin.productCategory.list({
        limit: 100,
        fields: "id,name,handle,+metadata",
      }),
  })
  const productsQuery = useQuery({
    queryKey: ["homepage", "products"],
    queryFn: () =>
      sdk.admin.product.list({
        limit: 100,
        fields: "id,title,handle,thumbnail,status",
        order: "title",
      }),
  })
  const giftsQuery = useQuery<{ merchandising_sets: MerchandisingSet[] }>({
    queryKey: ["homepage", "gifts"],
    queryFn: () =>
      sdk.client.fetch("/admin/merchandising", {
        query: { handle: "homepage-gifts" },
      }),
  })

  const categories = categoriesQuery.data?.product_categories ?? []
  const products = productsQuery.data?.products ?? []
  const categoriesById = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  )
  const productsById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  )

  useEffect(() => {
    if (!occasionsReady && categoriesQuery.data) {
      const selected = [...categories]
        .map((category) => ({
          category,
          placement: readHomepagePlacement(category),
        }))
        .filter(({ placement }) => placement.enabled)
        .sort((a, b) => a.placement.position - b.placement.position)
        .slice(0, 4)
        .map(({ category, placement }) => ({
          categoryId: category.id,
          displayTitle: placement.displayTitle,
        }))
      const selectedPlacement = [...categories]
        .map((category) => readHomepagePlacement(category))
        .find((placement) => placement.enabled)
      const initialSelection = selected.length
        ? selected
        : defaultOccasionHandles
            .map((handle) =>
              categories.find((category) => category.handle === handle),
            )
            .filter((category): category is HttpTypes.AdminProductCategory =>
              Boolean(category),
            )
            .map((category) => ({
              categoryId: category.id,
              displayTitle: category.name,
            }))
      setOccasionDraft(initialSelection)
      setOccasionSectionTitle(
        selectedPlacement?.sectionTitle ?? "Shop by Popular Occasions",
      )
      setOccasionsReady(true)
    }
  }, [categories, categoriesQuery.data, occasionsReady])

  useEffect(() => {
    if (!giftsReady && giftsQuery.data) {
      const currentSet = giftsQuery.data.merchandising_sets[0]
      setGiftProductIds(
        (currentSet?.items ?? []).map((item) => item.product_id).slice(0, 3),
      )
      setGiftSectionTitle(currentSet?.name || "Gifts")
      setGiftsReady(true)
    }
  }, [giftsQuery.data, giftsReady])

  const saveOccasions = useMutation({
    mutationFn: async () => {
      const selected = new Map(
        occasionDraft.map((item, position) => [
          item.categoryId,
          { ...item, position },
        ]),
      )

      await Promise.all(
        categories.map((category) => {
          const metadata = readRecord(category.metadata) as CategoryMetadata
          const current = readRecord(metadata.homepage_popular)
          const placement = selected.get(category.id)

          return sdk.admin.productCategory.update(category.id, {
            metadata: {
              ...metadata,
              homepage_popular: placement
                ? {
                    ...current,
                    enabled: true,
                    position: placement.position,
                    section_title:
                      occasionSectionTitle.trim() ||
                      "Shop by Popular Occasions",
                    display_title:
                      placement.displayTitle.trim() || category.name,
                  }
                : { ...current, enabled: false },
            },
          })
        }),
      )
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["homepage", "categories"],
      })
      toast.success("Popular occasions updated")
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Unable to update occasions",
      )
    },
  })

  const saveGifts = useMutation({
    mutationFn: () => {
      const current = giftsQuery.data?.merchandising_sets[0]
      return sdk.client.fetch("/admin/merchandising", {
        method: "POST",
        body: {
          id: current?.id,
          name: giftSectionTitle.trim() || "Gifts",
          handle: "homepage-gifts",
          kind: "featured",
          strategy: "manual",
          active: true,
          product_ids: giftProductIds,
        },
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["homepage", "gifts"] })
      toast.success("Homepage gifts updated")
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Unable to update gifts",
      )
    },
  })

  const availableCategories = categories.filter(
    (category) =>
      !occasionDraft.some((item) => item.categoryId === category.id),
  )
  const availableProducts = products.filter(
    (product) =>
      !giftProductIds.includes(product.id) && product.status === "published",
  )

  return (
    <div className="flex flex-col gap-y-3">
      <Container className="px-6 py-4">
        <Heading>Homepage</Heading>
        <Text size="small" className="text-ui-fg-subtle">
          Curate the category and product slots displayed on the storefront
          homepage.
        </Text>
      </Container>

      <Container className="divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <Text size="small" leading="compact" weight="plus">
              Shop by Popular Occasions
            </Text>
            <Text size="small" leading="compact" className="text-ui-fg-subtle">
              Select up to four product categories. Card images come from
              Category imagery.
            </Text>
          </div>
          <Button
            size="small"
            onClick={() => saveOccasions.mutate()}
            isLoading={saveOccasions.isPending}
            disabled={categoriesQuery.isLoading}
          >
            Save occasions
          </Button>
        </div>
        <div className="flex flex-col gap-y-4 px-6 py-4">
          <div className="max-w-md">
            <Text size="small" leading="compact" weight="plus">
              Section title
            </Text>
            <Input
              className="mt-2"
              value={occasionSectionTitle}
              onChange={(event) => setOccasionSectionTitle(event.target.value)}
              aria-label="Popular occasions section title"
            />
          </div>
          {occasionDraft.map((item, index) => {
            const category = categoriesById.get(item.categoryId)
            if (!category) return null
            const image = readCardImage(category)

            return (
              <div
                key={item.categoryId}
                className="flex items-center gap-x-3 rounded-lg border p-3"
              >
                <div className="bg-ui-bg-subtle size-14 overflow-hidden rounded-md">
                  {image ? (
                    <img
                      src={image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <Input
                    value={item.displayTitle}
                    onChange={(event) =>
                      setOccasionDraft((current) =>
                        current.map((draft) =>
                          draft.categoryId === item.categoryId
                            ? { ...draft, displayTitle: event.target.value }
                            : draft,
                        ),
                      )
                    }
                    aria-label={`Display title for ${category.name}`}
                  />
                  <Text size="xsmall" className="mt-1 text-ui-fg-subtle">
                    Category: {category.name} · Position {index + 1}
                  </Text>
                  {!image ? (
                    <Text size="xsmall" className="mt-1 text-ui-fg-error">
                      No card image. Add one under this category&apos;s Category
                      imagery section.
                    </Text>
                  ) : null}
                </div>
                <IconButton
                  size="small"
                  variant="transparent"
                  onClick={() =>
                    setOccasionDraft((current) => moveItem(current, index, -1))
                  }
                  disabled={index === 0}
                  aria-label={`Move ${category.name} up`}
                >
                  <ArrowUpMini />
                </IconButton>
                <IconButton
                  size="small"
                  variant="transparent"
                  onClick={() =>
                    setOccasionDraft((current) => moveItem(current, index, 1))
                  }
                  disabled={index === occasionDraft.length - 1}
                  aria-label={`Move ${category.name} down`}
                >
                  <ArrowDown />
                </IconButton>
                <IconButton
                  size="small"
                  variant="transparent"
                  onClick={() =>
                    setOccasionDraft((current) =>
                      current.filter(
                        (draft) => draft.categoryId !== item.categoryId,
                      ),
                    )
                  }
                  aria-label={`Remove ${category.name}`}
                >
                  <Trash />
                </IconButton>
              </div>
            )
          })}
          {!categoriesQuery.isLoading && !occasionDraft.length ? (
            <div className="rounded-lg border border-dashed p-6 text-center">
              <Text size="small" className="text-ui-fg-subtle">
                No occasion categories are selected. Add up to four categories
                below.
              </Text>
            </div>
          ) : null}
          {occasionDraft.length < 4 && availableCategories.length ? (
            <Select
              value=""
              onValueChange={(categoryId) => {
                const category = categoriesById.get(categoryId)
                if (category) {
                  setOccasionDraft((current) => [
                    ...current,
                    { categoryId, displayTitle: category.name },
                  ])
                }
              }}
            >
              <Select.Trigger className="max-w-sm">
                <Select.Value placeholder="Add a product category" />
              </Select.Trigger>
              <Select.Content>
                {availableCategories.map((category) => (
                  <Select.Item key={category.id} value={category.id}>
                    {category.name}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          ) : null}
        </div>
      </Container>

      <Container className="divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <Text size="small" leading="compact" weight="plus">
              Gifts
            </Text>
            <Text size="small" leading="compact" className="text-ui-fg-subtle">
              Select up to three published products. Their live image, title and
              price are used.
            </Text>
          </div>
          <Button
            size="small"
            onClick={() => saveGifts.mutate()}
            isLoading={saveGifts.isPending}
            disabled={giftsQuery.isLoading}
          >
            Save gifts
          </Button>
        </div>
        <div className="flex flex-col gap-y-4 px-6 py-4">
          <div className="max-w-md">
            <Text size="small" leading="compact" weight="plus">
              Section title
            </Text>
            <Input
              className="mt-2"
              value={giftSectionTitle}
              onChange={(event) => setGiftSectionTitle(event.target.value)}
              aria-label="Gifts section title"
            />
          </div>
          {giftProductIds.map((productId, index) => {
            const product = productsById.get(productId)
            return (
              <div
                key={productId}
                className="flex items-center gap-x-3 rounded-lg border p-3"
              >
                <div className="bg-ui-bg-subtle size-14 overflow-hidden rounded-md">
                  {product?.thumbnail ? (
                    <img
                      src={product.thumbnail}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <Text size="small" leading="compact" weight="plus">
                    {product?.title ?? productId}
                  </Text>
                  <Text size="xsmall" className="text-ui-fg-subtle">
                    Position {index + 1}
                  </Text>
                </div>
                <IconButton
                  size="small"
                  variant="transparent"
                  onClick={() =>
                    setGiftProductIds((current) => moveItem(current, index, -1))
                  }
                  disabled={index === 0}
                  aria-label={`Move ${product?.title ?? "product"} up`}
                >
                  <ArrowUpMini />
                </IconButton>
                <IconButton
                  size="small"
                  variant="transparent"
                  onClick={() =>
                    setGiftProductIds((current) => moveItem(current, index, 1))
                  }
                  disabled={index === giftProductIds.length - 1}
                  aria-label={`Move ${product?.title ?? "product"} down`}
                >
                  <ArrowDown />
                </IconButton>
                <IconButton
                  size="small"
                  variant="transparent"
                  onClick={() =>
                    setGiftProductIds((current) =>
                      current.filter((id) => id !== productId),
                    )
                  }
                  aria-label={`Remove ${product?.title ?? "product"}`}
                >
                  <Trash />
                </IconButton>
              </div>
            )
          })}
          {!giftsQuery.isLoading && !giftProductIds.length ? (
            <div className="rounded-lg border border-dashed p-6 text-center">
              <Text size="small" className="text-ui-fg-subtle">
                No live gift products are selected. The designed placeholders
                remain on the storefront until this list is saved with products.
              </Text>
            </div>
          ) : null}
          {giftProductIds.length < 3 && availableProducts.length ? (
            <Select
              value=""
              onValueChange={(productId) =>
                setGiftProductIds((current) => [...current, productId])
              }
            >
              <Select.Trigger className="max-w-sm">
                <Select.Value placeholder="Add a published product" />
              </Select.Trigger>
              <Select.Content>
                {availableProducts.map((product) => (
                  <Select.Item key={product.id} value={product.id}>
                    {product.title}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          ) : null}
        </div>
      </Container>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Homepage",
  icon: Sparkles,
})

export default HomepagePage
