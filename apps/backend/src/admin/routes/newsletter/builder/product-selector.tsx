import { Image, XMark } from "@medusajs/icons"
import {
  Button,
  Checkbox,
  FocusModal,
  IconButton,
  Input,
  Text,
} from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { sdk } from "../../../lib/sdk"
import type { NewsletterProduct } from "./types"

type ProductSelectorProps = {
  value: NewsletterProduct[]
  multiple?: boolean
  onChange: (products: NewsletterProduct[]) => void
}

const PAGE_SIZE = 12

const toNewsletterProduct = (product: {
  id: string
  title: string
  handle: string
  thumbnail?: string | null
  variants?: Array<{
    prices?: Array<{ amount: number; currency_code: string }> | null
  }> | null
}): NewsletterProduct => ({
  id: product.id,
  title: product.title,
  handle: product.handle,
  thumbnail: product.thumbnail || undefined,
  priceLabel: (() => {
    const price = product.variants?.[0]?.prices?.[0]

    if (!price) {
      return undefined
    }

    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: price.currency_code.toUpperCase(),
    }).format(price.amount)
  })(),
})

export const ProductSelector = ({
  value,
  multiple = false,
  onChange,
}: ProductSelectorProps) => {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(0)
  const [pending, setPending] = useState<NewsletterProduct[]>(value)

  const productsQuery = useQuery({
    queryKey: ["newsletter-builder-products", query, page],
    queryFn: () =>
      sdk.admin.product.list({
        q: query || undefined,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
        fields: "id,title,handle,thumbnail,*variants.prices",
      }),
    enabled: open,
  })

  const selectedIds = useMemo(() => new Set(pending.map((product) => product.id)), [pending])
  const totalPages = Math.max(1, Math.ceil((productsQuery.data?.count || 0) / PAGE_SIZE))

  const setModalOpen = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (nextOpen) {
      setPending(value)
      setQuery("")
      setPage(0)
    }
  }

  const toggle = (product: NewsletterProduct) => {
    if (!multiple) {
      setPending([product])
      return
    }

    setPending((current) =>
      current.some((item) => item.id === product.id)
        ? current.filter((item) => item.id !== product.id)
        : [...current, product],
    )
  }

  return (
    <div className="space-y-3">
      {value.map((product) => (
        <div
          key={product.id}
          className="flex items-center gap-3 rounded-lg border border-ui-border-base p-2"
        >
          <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-ui-bg-subtle">
            {product.thumbnail ? (
              <img src={product.thumbnail} alt="" className="size-full object-cover" />
            ) : (
              <Image className="size-5 text-ui-fg-muted" />
            )}
          </div>
          <Text size="small" weight="plus" className="min-w-0 flex-1 truncate">
            {product.title}
          </Text>
          <IconButton
            size="small"
            variant="transparent"
            onClick={() => onChange(value.filter((item) => item.id !== product.id))}
          >
            <XMark />
          </IconButton>
        </div>
      ))}

      <Button size="small" variant="secondary" className="w-full" onClick={() => setModalOpen(true)}>
        {value.length ? "Change products" : multiple ? "Choose products" : "Choose product"}
      </Button>

      <FocusModal open={open} onOpenChange={setModalOpen}>
        <FocusModal.Content>
          <div className="flex h-full flex-col">
            <FocusModal.Header>
              <div className="mr-auto">
                <FocusModal.Title>{multiple ? "Choose products" : "Choose a product"}</FocusModal.Title>
                <FocusModal.Description>
                  Select the store products to feature in this email block.
                </FocusModal.Description>
              </div>
              <div className="flex items-center gap-2">
                <FocusModal.Close asChild>
                  <Button size="small" variant="secondary">Cancel</Button>
                </FocusModal.Close>
                <Button
                  size="small"
                  disabled={!pending.length}
                  onClick={() => {
                    onChange(multiple ? pending : pending.slice(0, 1))
                    setModalOpen(false)
                  }}
                >
                  Add {pending.length ? `(${pending.length})` : ""}
                </Button>
              </div>
            </FocusModal.Header>
            <FocusModal.Body className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="border-b border-ui-border-base p-6">
                <Input
                  value={query}
                  placeholder="Search products"
                  onChange={(event) => {
                    setQuery(event.target.value)
                    setPage(0)
                  }}
                />
              </div>
              <div className="min-h-0 flex-1 overflow-auto p-6">
                {productsQuery.isLoading ? (
                  <div className="flex h-48 items-center justify-center">
                    <div className="size-5 animate-spin rounded-full border-2 border-ui-border-strong border-t-ui-fg-interactive" aria-label="Loading products" />
                  </div>
                ) : productsQuery.data?.products.length ? (
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    {productsQuery.data.products.map((product) => {
                      const option = toNewsletterProduct(product)
                      const checked = selectedIds.has(product.id)

                      return (
                        <div
                          key={product.id}
                          className="flex items-center gap-3 rounded-lg border border-ui-border-base p-3 hover:bg-ui-bg-subtle"
                        >
                          <Checkbox checked={checked} onCheckedChange={() => toggle(option)} />
                          <button
                            type="button"
                            onClick={() => toggle(option)}
                            className="flex min-w-0 flex-1 items-center gap-3 text-left"
                          >
                          <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-md bg-ui-bg-subtle">
                            {product.thumbnail ? (
                              <img src={product.thumbnail} alt="" className="size-full object-cover" />
                            ) : (
                              <Image className="size-5 text-ui-fg-muted" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <Text size="small" weight="plus" className="truncate">{product.title}</Text>
                            <Text size="xsmall" className="truncate text-ui-fg-subtle">/{product.handle}</Text>
                          </div>
                          </button>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <Text size="small" className="py-12 text-center text-ui-fg-subtle">No products found.</Text>
                )}
              </div>
              <div className="flex items-center justify-between border-t border-ui-border-base px-6 py-4">
                <Text size="xsmall" className="text-ui-fg-subtle">
                  Page {page + 1} of {totalPages}
                </Text>
                <div className="flex gap-2">
                  <Button size="small" variant="secondary" disabled={page === 0} onClick={() => setPage((current) => current - 1)}>Previous</Button>
                  <Button size="small" variant="secondary" disabled={page + 1 >= totalPages} onClick={() => setPage((current) => current + 1)}>Next</Button>
                </div>
              </div>
            </FocusModal.Body>
          </div>
        </FocusModal.Content>
      </FocusModal>
    </div>
  )
}
