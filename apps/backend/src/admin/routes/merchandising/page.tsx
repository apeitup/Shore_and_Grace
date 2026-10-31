import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  ArrowDown,
  ArrowUpMini,
  Plus,
  Sparkles,
  Trash,
} from "@medusajs/icons"
import {
  Badge,
  Button,
  Container,
  FocusModal,
  Heading,
  IconButton,
  Input,
  Label,
  Select,
  Switch,
  Tabs,
  Text,
  toast,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { sdk } from "../../lib/sdk"

type MerchandisingKind =
  | "featured"
  | "upsell"
  | "complementary"
  | "frequently_bought_together"

type ProductSummary = {
  id: string
  title: string
  handle: string
  thumbnail?: string | null
  status?: string
}

type MerchandisingItem = {
  id: string
  product_id: string
  position: number
  product: ProductSummary | null
}

type MerchandisingSet = {
  id: string
  name: string
  handle: string
  kind: MerchandisingKind
  source_product_id?: string | null
  strategy: "manual" | "automatic"
  active: boolean
  items: MerchandisingItem[]
}

type SetDraft = {
  id?: string
  name: string
  handle: string
  kind: MerchandisingKind
  source_product_id?: string | null
  strategy: "manual" | "automatic"
  active: boolean
  product_ids: string[]
}

const kindLabels: Record<Exclude<MerchandisingKind, "featured">, string> = {
  upsell: "Upsells",
  complementary: "Complementary products",
  frequently_bought_together: "Frequently bought together",
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")

const productSetHandle = (kind: MerchandisingKind, productId: string) =>
  slugify(`${kind}-${productId}`)

const mutationErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}

const OrderedProductPicker = ({
  products,
  productIds,
  sourceProductId,
  onChange,
}: {
  products: ProductSummary[]
  productIds: string[]
  sourceProductId?: string | null
  onChange: (ids: string[]) => void
}) => {
  const [search, setSearch] = useState("")
  const productsById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  )
  const available = products.filter(
    (product) =>
      product.id !== sourceProductId &&
      !productIds.includes(product.id) &&
      product.title.toLowerCase().includes(search.toLowerCase()),
  )

  const move = (index: number, offset: number) => {
    const nextIndex = index + offset
    if (nextIndex < 0 || nextIndex >= productIds.length) return
    const next = [...productIds]
    const [item] = next.splice(index, 1)
    next.splice(nextIndex, 0, item)
    onChange(next)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Label htmlFor="merchandising-product-search">Add products</Label>
          <Input
            id="merchandising-product-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products"
          />
        </div>
        <Select
          value=""
          onValueChange={(id) => {
            onChange([...productIds, id])
            setSearch("")
          }}
        >
          <Select.Trigger className="w-[260px]">
            <Select.Value placeholder="Choose a product" />
          </Select.Trigger>
          <Select.Content>
            {available.slice(0, 50).map((product) => (
              <Select.Item key={product.id} value={product.id}>
                {product.title}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      </div>

      {productIds.length ? (
        <div className="divide-y rounded-lg border">
          {productIds.map((id, index) => {
            const product = productsById.get(id)
            return (
              <div key={id} className="flex items-center gap-3 px-4 py-3">
                <div className="bg-ui-bg-subtle h-12 w-12 overflow-hidden rounded-md">
                  {product?.thumbnail ? (
                    <img
                      src={product.thumbnail}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <Text weight="plus">{product?.title || id}</Text>
                  <Text size="small" className="text-ui-fg-subtle">
                    Position {index + 1}
                  </Text>
                </div>
                <IconButton
                  variant="transparent"
                  size="small"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label="Move product up"
                >
                  <ArrowUpMini />
                </IconButton>
                <IconButton
                  variant="transparent"
                  size="small"
                  onClick={() => move(index, 1)}
                  disabled={index === productIds.length - 1}
                  aria-label="Move product down"
                >
                  <ArrowDown />
                </IconButton>
                <IconButton
                  variant="transparent"
                  size="small"
                  onClick={() => onChange(productIds.filter((item) => item !== id))}
                  aria-label="Remove product"
                >
                  <Trash />
                </IconButton>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-ui-fg-subtle rounded-lg border border-dashed p-8 text-center">
          No products selected. Add products in the order they should appear.
        </div>
      )}
    </div>
  )
}

const MerchandisingPage = () => {
  const queryClient = useQueryClient()
  const [featuredOpen, setFeaturedOpen] = useState(false)
  const [featuredDraft, setFeaturedDraft] = useState<SetDraft>({
    name: "",
    handle: "",
    kind: "featured",
    strategy: "manual",
    active: true,
    product_ids: [],
  })
  const [sourceProductId, setSourceProductId] = useState("")
  const [activeKind, setActiveKind] = useState<Exclude<MerchandisingKind, "featured">>(
    "upsell",
  )
  const [relationshipIds, setRelationshipIds] = useState<Record<string, string[]>>({})

  const { data: productsData, isLoading: productsLoading } = useQuery<{
    products: ProductSummary[]
  }>({
    queryKey: ["merchandising-products"],
    queryFn: () =>
      sdk.client.fetch("/admin/products", {
        query: {
          limit: 100,
          fields: "id,title,handle,thumbnail,status",
          order: "title",
        },
      }),
  })
  const { data: setsData, isLoading: setsLoading } = useQuery<{
    merchandising_sets: MerchandisingSet[]
  }>({
    queryKey: ["merchandising-sets"],
    queryFn: () => sdk.client.fetch("/admin/merchandising"),
  })
  const products = productsData?.products || []
  const sets = setsData?.merchandising_sets || []
  const featuredSets = sets.filter((set) => set.kind === "featured")
  const currentSet = sets.find(
    (set) =>
      set.kind === activeKind && set.source_product_id === sourceProductId,
  )
  const relationshipKey = `${sourceProductId}:${activeKind}`
  const currentRelationshipIds =
    relationshipIds[relationshipKey] ??
    currentSet?.items.map((item) => item.product_id) ??
    []

  const saveMutation = useMutation({
    mutationFn: (draft: SetDraft) =>
      sdk.client.fetch("/admin/merchandising", {
        method: "POST",
        body: draft,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["merchandising-sets"] })
      toast.success("Merchandising set saved")
    },
    onError: (error) =>
      toast.error(
        mutationErrorMessage(error, "Unable to save merchandising set"),
      ),
  })
  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      sdk.client.fetch(`/admin/merchandising/${id}`, { method: "DELETE" }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["merchandising-sets"] })
      toast.success("Featured list deleted")
    },
    onError: () => toast.error("Unable to delete featured list"),
  })

  const openFeatured = (set?: MerchandisingSet) => {
    setFeaturedDraft(
      set
        ? {
            id: set.id,
            name: set.name,
            handle: set.handle,
            kind: "featured",
            strategy: set.strategy,
            active: set.active,
            product_ids: set.items.map((item) => item.product_id),
          }
        : {
            name: "",
            handle: "",
            kind: "featured",
            strategy: "manual",
            active: true,
            product_ids: [],
          },
    )
    setFeaturedOpen(true)
  }

  const saveFeatured = async () => {
    const draft = {
      ...featuredDraft,
      handle: featuredDraft.handle || slugify(featuredDraft.name),
    }
    try {
      await saveMutation.mutateAsync(draft)
      setFeaturedOpen(false)
    } catch {
      // The mutation displays the API error and leaves the form open to fix it.
    }
  }

  const saveRelationship = async () => {
    if (!sourceProductId) return
    try {
      await saveMutation.mutateAsync({
        id: currentSet?.id,
        name: kindLabels[activeKind],
        handle:
          currentSet?.handle || productSetHandle(activeKind, sourceProductId),
        kind: activeKind,
        source_product_id: sourceProductId,
        strategy: "manual",
        active: true,
        product_ids: currentRelationshipIds,
      })
    } catch {
      // The mutation displays the API error without creating an unhandled promise.
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Container className="flex items-center justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Heading>Merchandising</Heading>
            <Badge color="green">Manual curation</Badge>
          </div>
          <Text className="text-ui-fg-subtle">
            Curate featured lists and product-specific recommendations from one place.
          </Text>
        </div>
      </Container>

      <Container>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Heading level="h2">Featured lists</Heading>
            <Text className="text-ui-fg-subtle">
              Reusable ordered lists for the homepage, campaigns and seasonal collections.
            </Text>
          </div>
          <Button onClick={() => openFeatured()}>
            <Plus /> New list
          </Button>
        </div>
        {setsLoading ? (
          <Text className="text-ui-fg-subtle">Loading featured lists…</Text>
        ) : featuredSets.length ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {featuredSets.map((set) => (
              <button
                key={set.id}
                type="button"
                onClick={() => openFeatured(set)}
                className="hover:bg-ui-bg-base-hover rounded-lg border p-4 text-left"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <Text weight="plus">{set.name}</Text>
                  <Badge color={set.active ? "green" : "grey"}>
                    {set.active ? "Active" : "Hidden"}
                  </Badge>
                </div>
                <Text size="small" className="text-ui-fg-subtle">
                  {set.items.length} {set.items.length === 1 ? "product" : "products"} · {set.handle}
                </Text>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-ui-fg-subtle rounded-lg border border-dashed p-8 text-center">
            Create a featured list to start curating products for a storefront placement.
          </div>
        )}
      </Container>

      <Container>
        <div className="mb-6">
          <Heading level="h2">Product merchandising</Heading>
          <Text className="text-ui-fg-subtle">
            Choose a product, then curate its upsells, complementary products and frequently bought together set.
          </Text>
        </div>
        <div className="mb-6 max-w-xl">
          <Label htmlFor="merchandising-source-product">Product</Label>
          <Select value={sourceProductId} onValueChange={setSourceProductId}>
            <Select.Trigger id="merchandising-source-product">
              <Select.Value placeholder={productsLoading ? "Loading products…" : "Choose a product"} />
            </Select.Trigger>
            <Select.Content>
              {products.map((product) => (
                <Select.Item key={product.id} value={product.id}>
                  {product.title}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </div>

        {sourceProductId ? (
          <Tabs value={activeKind} onValueChange={(value) => setActiveKind(value as Exclude<MerchandisingKind, "featured">)}>
            <Tabs.List>
              <Tabs.Trigger value="upsell">Upsells</Tabs.Trigger>
              <Tabs.Trigger value="complementary">Complementary</Tabs.Trigger>
              <Tabs.Trigger value="frequently_bought_together">Frequently bought together</Tabs.Trigger>
            </Tabs.List>
            <div className="pt-6">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <Heading level="h3">{kindLabels[activeKind]}</Heading>
                  <Text size="small" className="text-ui-fg-subtle">
                    {activeKind === "upsell" && "Encourage a considered upgrade or premium alternative."}
                    {activeKind === "complementary" && "Add-ons such as chocolates, vases and cards that suit this product."}
                    {activeKind === "frequently_bought_together" && "A manually curated bundle until enough order data exists for automatic suggestions."}
                  </Text>
                </div>
                {activeKind === "frequently_bought_together" ? (
                  <Badge color="orange">Automatic later</Badge>
                ) : null}
              </div>
              <OrderedProductPicker
                products={products}
                productIds={currentRelationshipIds}
                sourceProductId={sourceProductId}
                onChange={(ids) =>
                  setRelationshipIds((current) => ({
                    ...current,
                    [relationshipKey]: ids,
                  }))
                }
              />
              <div className="mt-6 flex justify-end">
                <Button onClick={saveRelationship} isLoading={saveMutation.isPending}>
                  Save {kindLabels[activeKind].toLowerCase()}
                </Button>
              </div>
            </div>
          </Tabs>
        ) : (
          <div className="text-ui-fg-subtle rounded-lg border border-dashed p-10 text-center">
            Select a product to manage its merchandising relationships.
          </div>
        )}
      </Container>

      <FocusModal open={featuredOpen} onOpenChange={setFeaturedOpen}>
        <FocusModal.Content>
          <FocusModal.Header>
            <div>
              <FocusModal.Title>
                {featuredDraft.id ? "Edit featured list" : "New featured list"}
              </FocusModal.Title>
              <FocusModal.Description>
                Products appear in the order shown below.
              </FocusModal.Description>
            </div>
          </FocusModal.Header>
          <FocusModal.Body className="mx-auto flex w-full max-w-3xl flex-col gap-6 overflow-auto p-8">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="featured-name">Name</Label>
                <Input
                  id="featured-name"
                  value={featuredDraft.name}
                  onChange={(event) =>
                    setFeaturedDraft((current) => ({
                      ...current,
                      name: event.target.value,
                      handle: current.id ? current.handle : slugify(event.target.value),
                    }))
                  }
                  placeholder="Christmas collection"
                />
              </div>
              <div>
                <Label htmlFor="featured-handle">Handle</Label>
                <Input
                  id="featured-handle"
                  value={featuredDraft.handle}
                  onChange={(event) =>
                    setFeaturedDraft((current) => ({
                      ...current,
                      handle: slugify(event.target.value),
                    }))
                  }
                  placeholder="christmas-collection"
                />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Text weight="plus">Visible on the storefront</Text>
                <Text size="small" className="text-ui-fg-subtle">
                  Hidden lists remain available in Admin but are not returned to shoppers.
                </Text>
              </div>
              <Switch
                checked={featuredDraft.active}
                onCheckedChange={(active) =>
                  setFeaturedDraft((current) => ({ ...current, active }))
                }
              />
            </div>
            <OrderedProductPicker
              products={products}
              productIds={featuredDraft.product_ids}
              onChange={(product_ids) =>
                setFeaturedDraft((current) => ({ ...current, product_ids }))
              }
            />
          </FocusModal.Body>
          <FocusModal.Footer className="flex items-center justify-between">
            <div>
              {featuredDraft.id ? (
                <Button
                  variant="danger"
                  onClick={async () => {
                    await deleteMutation.mutateAsync(featuredDraft.id!)
                    setFeaturedOpen(false)
                  }}
                  isLoading={deleteMutation.isPending}
                >
                  Delete list
                </Button>
              ) : null}
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setFeaturedOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={saveFeatured}
                disabled={!featuredDraft.name || !featuredDraft.handle}
                isLoading={saveMutation.isPending}
              >
                Save list
              </Button>
            </div>
          </FocusModal.Footer>
        </FocusModal.Content>
      </FocusModal>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Merchandising",
  icon: Sparkles,
})

export default MerchandisingPage
