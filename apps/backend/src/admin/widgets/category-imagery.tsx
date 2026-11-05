import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { PencilSquare } from "@medusajs/icons"
import type { DetailWidgetProps, HttpTypes } from "@medusajs/framework/types"
import {
  Button,
  Container,
  Drawer,
  Input,
  Label,
  Text,
  toast,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"

import { ImageUploadField } from "../components/image-upload-field"
import { sdk } from "../lib/sdk"

type CategoryMedia = {
  alt_text: string
  card_image_url: string
  hero_desktop_url: string
  hero_mobile_url: string
}

const EMPTY_MEDIA: CategoryMedia = {
  alt_text: "",
  card_image_url: "",
  hero_desktop_url: "",
  hero_mobile_url: "",
}

const readCategoryMedia = (
  category?: HttpTypes.AdminProductCategory,
): CategoryMedia => {
  const media = category?.metadata?.category_media

  if (!media || typeof media !== "object" || Array.isArray(media)) {
    return EMPTY_MEDIA
  }

  const values = media as Record<string, unknown>
  return {
    alt_text: typeof values.alt_text === "string" ? values.alt_text : "",
    card_image_url:
      typeof values.card_image_url === "string" ? values.card_image_url : "",
    hero_desktop_url:
      typeof values.hero_desktop_url === "string"
        ? values.hero_desktop_url
        : "",
    hero_mobile_url:
      typeof values.hero_mobile_url === "string"
        ? values.hero_mobile_url
        : "",
  }
}

const CategoryImagePreview = ({
  alt,
  label,
  url,
}: {
  alt: string
  label: string
  url: string
}) => (
  <div className="flex min-w-0 flex-col gap-y-2">
    <Text size="small" leading="compact" weight="plus">
      {label}
    </Text>
    {url ? (
      <img
        src={url}
        alt={alt}
        className="h-32 w-full rounded-lg border border-ui-border-base object-cover"
      />
    ) : (
      <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-ui-border-strong bg-ui-bg-subtle px-3 text-center">
        <Text size="small" leading="compact" className="text-ui-fg-subtle">
          No image uploaded
        </Text>
      </div>
    )}
  </div>
)

const CategoryImageryWidget = ({
  data,
}: DetailWidgetProps<HttpTypes.AdminProductCategory>) => {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<CategoryMedia>(EMPTY_MEDIA)
  const queryClient = useQueryClient()

  const categoryQuery = useQuery({
    queryKey: ["category-imagery", data.id],
    queryFn: () =>
      sdk.admin.productCategory.retrieve(data.id, { fields: "+metadata" }),
  })
  const category = categoryQuery.data?.product_category
  const media = readCategoryMedia(category)

  useEffect(() => {
    if (!open) {
      setDraft(media)
    }
  }, [media.alt_text, media.card_image_url, media.hero_desktop_url, media.hero_mobile_url, open])

  const updateCategory = useMutation({
    mutationFn: (nextMedia: CategoryMedia) =>
      sdk.admin.productCategory.update(
        data.id,
        {
          metadata: {
            ...(category?.metadata ?? {}),
            category_media: nextMedia,
          },
        },
        { fields: "+metadata" },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["category-imagery", data.id],
      })
      queryClient.invalidateQueries({ queryKey: ["product-category", data.id] })
      queryClient.invalidateQueries({ queryKey: ["product-categories"] })
      toast.success("Category imagery updated")
      setOpen(false)
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "The category imagery could not be updated",
      )
    },
  })

  const openEditor = () => {
    setDraft(media)
    setOpen(true)
  }

  return (
    <>
      <Container className="divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex flex-col gap-y-1">
            <Text size="small" leading="compact" weight="plus">
              Category imagery
            </Text>
            <Text size="small" leading="compact" className="text-ui-fg-subtle">
              Images used for category cards and responsive landing-page heroes.
            </Text>
          </div>
          <Button
            size="small"
            variant="secondary"
            onClick={openEditor}
            disabled={categoryQuery.isLoading}
          >
            <PencilSquare />
            Edit
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 px-6 py-4 md:grid-cols-3">
          {categoryQuery.isLoading ? (
            <Text size="small" leading="compact" className="text-ui-fg-subtle">
              Loading category imagery…
            </Text>
          ) : (
            <>
              <CategoryImagePreview
                label="Card image"
                url={media.card_image_url}
                alt={media.alt_text || `${data.name} card image`}
              />
              <CategoryImagePreview
                label="Desktop hero"
                url={media.hero_desktop_url}
                alt={media.alt_text || `${data.name} desktop hero`}
              />
              <CategoryImagePreview
                label="Mobile hero"
                url={media.hero_mobile_url}
                alt={media.alt_text || `${data.name} mobile hero`}
              />
            </>
          )}
        </div>
      </Container>

      <Drawer open={open} onOpenChange={setOpen}>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>Edit category imagery</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body className="flex-1 overflow-auto p-4">
            <div className="flex flex-col gap-y-6">
              <ImageUploadField
                label="Card image"
                value={draft.card_image_url}
                onChange={(card_image_url) =>
                  setDraft((current) => ({ ...current, card_image_url }))
                }
                previewAlt={draft.alt_text || `${data.name} card image`}
                helperText="Recommended: square or 4:5 crop, PNG, JPG or WebP."
              />
              <ImageUploadField
                label="Desktop hero"
                value={draft.hero_desktop_url}
                onChange={(hero_desktop_url) =>
                  setDraft((current) => ({ ...current, hero_desktop_url }))
                }
                previewAlt={draft.alt_text || `${data.name} desktop hero`}
                previewClassName="h-32"
                helperText="Recommended: wide landscape crop, PNG, JPG or WebP."
              />
              <ImageUploadField
                label="Mobile hero"
                value={draft.hero_mobile_url}
                onChange={(hero_mobile_url) =>
                  setDraft((current) => ({ ...current, hero_mobile_url }))
                }
                previewAlt={draft.alt_text || `${data.name} mobile hero`}
                previewClassName="h-56"
                helperText="Recommended: portrait crop, PNG, JPG or WebP."
              />
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="category-image-alt-text">Image alt text</Label>
                <Input
                  id="category-image-alt-text"
                  value={draft.alt_text}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      alt_text: event.target.value,
                    }))
                  }
                  placeholder={`Describe the ${data.name} imagery`}
                />
                <Text size="small" leading="compact" className="text-ui-fg-subtle">
                  Describe the meaningful subject of the images for customers using
                  screen readers.
                </Text>
              </div>
            </div>
          </Drawer.Body>
          <Drawer.Footer>
            <div className="flex items-center justify-end gap-x-2">
              <Drawer.Close asChild>
                <Button
                  size="small"
                  variant="secondary"
                  disabled={updateCategory.isPending}
                >
                  Cancel
                </Button>
              </Drawer.Close>
              <Button
                size="small"
                onClick={() => updateCategory.mutate(draft)}
                isLoading={updateCategory.isPending}
              >
                Save
              </Button>
            </div>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>
    </>
  )
}

export const config = defineWidgetConfig({
  zone: "product_category.details",
  id: "shore-and-grace-category-imagery",
})

export default CategoryImageryWidget
