import { Button, Input, Label, Select, StatusBadge, Tabs, Text, Textarea } from "@medusajs/ui"
import { useEffect, useMemo, useState } from "react"
import { ImageUploadField } from "./image-upload-field"
import { ProductSelector } from "./product-selector"
import type { NewsletterAlignment, NewsletterBlock } from "./types"

type BlockSettingsProps = {
  block?: NewsletterBlock
  onChange: (block: NewsletterBlock) => void
}

const alignmentOptions: Array<{ label: string; value: NewsletterAlignment }> = [
  { label: "Left", value: "left" },
  { label: "Centre", value: "center" },
  { label: "Right", value: "right" },
]

const TextField = ({ id, label, value, placeholder, onChange }: {
  id: string
  label: string
  value?: string
  placeholder?: string
  onChange: (value: string) => void
}) => (
  <div className="space-y-2">
    <Label htmlFor={id}>{label}</Label>
    <Input id={id} value={value || ""} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
  </div>
)

export const BlockSettings = ({ block, onChange }: BlockSettingsProps) => {
  const [draft, setDraft] = useState<NewsletterBlock | undefined>(block)

  useEffect(() => setDraft(block), [block])

  const hasChanges = useMemo(
    () => Boolean(block && draft && JSON.stringify(block) !== JSON.stringify(draft)),
    [block, draft],
  )

  if (!block || !draft) {
    return (
      <aside className="w-[320px] shrink-0 border-l border-ui-border-base bg-ui-bg-base p-6">
        <Text size="small" weight="plus">Block settings</Text>
        <Text size="xsmall" className="mt-1 text-ui-fg-subtle">Select a content block in the email to edit it.</Text>
      </aside>
    )
  }

  const update = (changes: Partial<NewsletterBlock>) =>
    setDraft((current) => (current ? { ...current, ...changes } : current))
  const apply = () => onChange(draft)
  const settingsTitle = draft.type
    .split("-")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ")

  return (
    <aside className="flex w-[320px] min-h-0 shrink-0 flex-col border-l border-ui-border-base bg-ui-bg-base">
      <div className="flex items-center justify-between px-6 py-5">
        <Text size="small" weight="plus">{settingsTitle} settings</Text>
        <StatusBadge color="blue">Selected</StatusBadge>
      </div>

      <Tabs defaultValue="content" className="flex min-h-0 flex-1 flex-col">
        <Tabs.List className="px-6">
          <Tabs.Trigger value="content">Content</Tabs.Trigger>
          <Tabs.Trigger value="style">Style</Tabs.Trigger>
        </Tabs.List>

        <div className="min-h-0 flex-1 overflow-auto">
          <Tabs.Content value="content" className="space-y-5 p-6">
            {["hero", "occasion", "heading", "collection", "promotion", "delivery-notice", "personalised-greeting", "content-card"].includes(draft.type) && (
              <TextField id="builder-eyebrow" label="Eyebrow" value={draft.eyebrow} onChange={(eyebrow) => update({ eyebrow })} />
            )}

            {["hero", "text", "product", "product-grid", "occasion", "heading", "collection", "promotion", "contact", "testimonial", "delivery-notice", "personalised-greeting", "content-card"].includes(draft.type) && (
              <TextField
                id="builder-title"
                label={draft.type === "product" || draft.type === "product-grid" ? "Section title" : "Title"}
                value={draft.title}
                onChange={(title) => update({ title })}
              />
            )}

            {["hero", "text", "occasion", "collection", "promotion", "delivery-notice", "personalised-greeting", "content-card"].includes(draft.type) && (
              <div className="space-y-2">
                <Label htmlFor="builder-body">Body</Label>
                <Textarea id="builder-body" rows={5} value={draft.body || ""} onChange={(event) => update({ body: event.target.value })} />
              </div>
            )}

            {["hero", "image", "collection", "content-card"].includes(draft.type) && (
              <>
                <ImageUploadField value={draft.imageUrl} onChange={(imageUrl) => update({ imageUrl })} />
                <TextField id="builder-image-alt" label="Alternative text" value={draft.imageAlt} placeholder="Describe this image" onChange={(imageAlt) => update({ imageAlt })} />
                {["image", "collection", "content-card"].includes(draft.type) && (
                  <TextField id="builder-image-link" label="Image link" value={draft.imageLink} placeholder="https://" onChange={(imageLink) => update({ imageLink })} />
                )}
              </>
            )}

            {draft.type === "product" && (
              <ProductSelector value={draft.products || []} onChange={(products) => update({ products })} />
            )}
            {draft.type === "product-grid" && (
              <ProductSelector multiple value={draft.products || []} onChange={(products) => update({ products })} />
            )}

            {["hero", "button", "occasion", "collection", "promotion", "content-card"].includes(draft.type) && (
              <>
                <TextField id="builder-button-label" label="Button label" value={draft.buttonLabel} onChange={(buttonLabel) => update({ buttonLabel })} />
                <TextField id="builder-button-link" label="Button link" value={draft.buttonLink} placeholder="https://" onChange={(buttonLink) => update({ buttonLink })} />
              </>
            )}

            {draft.type === "signature" && (
              <>
                <div className="space-y-2">
                  <Label>Signature style</Label>
                  <Select value={draft.signatureStyle || "formal"} onValueChange={(value) => update({ signatureStyle: value as "formal" | "simple" })}>
                    <Select.Trigger><Select.Value /></Select.Trigger>
                    <Select.Content>
                      <Select.Item value="formal">Formal</Select.Item>
                      <Select.Item value="simple">Simple</Select.Item>
                    </Select.Content>
                  </Select>
                </div>
                <TextField id="builder-signature-greeting" label="Closing" value={draft.signatureGreeting} onChange={(signatureGreeting) => update({ signatureGreeting })} />
                <TextField id="builder-signature-name" label="Name" value={draft.signatureName} onChange={(signatureName) => update({ signatureName })} />
                <TextField id="builder-signature-studio" label="Studio name" value={draft.signatureStudio} onChange={(signatureStudio) => update({ signatureStudio })} />
              </>
            )}

            {draft.type === "divider" && (
              <div className="space-y-2">
                <Label>Line style</Label>
                <Select value={draft.dividerStyle || "solid"} onValueChange={(value) => update({ dividerStyle: value as "solid" | "dashed" })}>
                  <Select.Trigger><Select.Value /></Select.Trigger>
                  <Select.Content>
                    <Select.Item value="solid">Solid</Select.Item>
                    <Select.Item value="dashed">Dashed</Select.Item>
                  </Select.Content>
                </Select>
              </div>
            )}

            {draft.type === "spacer" && (
              <div className="space-y-2">
                <Label>Spacer size</Label>
                <Select value={draft.spacerSize || "medium"} onValueChange={(value) => update({ spacerSize: value as "small" | "medium" | "large" })}>
                  <Select.Trigger><Select.Value /></Select.Trigger>
                  <Select.Content>
                    <Select.Item value="small">Small</Select.Item>
                    <Select.Item value="medium">Medium</Select.Item>
                    <Select.Item value="large">Large</Select.Item>
                  </Select.Content>
                </Select>
              </div>
            )}

            {draft.type === "columns" && (
              <>
                <TextField id="builder-left-title" label="Left title" value={draft.leftTitle} onChange={(leftTitle) => update({ leftTitle })} />
                <div className="space-y-2">
                  <Label htmlFor="builder-left-body">Left body</Label>
                  <Textarea id="builder-left-body" rows={4} value={draft.leftBody || ""} onChange={(event) => update({ leftBody: event.target.value })} />
                </div>
                <TextField id="builder-right-title" label="Right title" value={draft.rightTitle} onChange={(rightTitle) => update({ rightTitle })} />
                <div className="space-y-2">
                  <Label htmlFor="builder-right-body">Right body</Label>
                  <Textarea id="builder-right-body" rows={4} value={draft.rightBody || ""} onChange={(event) => update({ rightBody: event.target.value })} />
                </div>
              </>
            )}

            {draft.type === "collection" && (
              <>
                <TextField id="builder-collection-id" label="Collection ID" value={draft.collectionId} placeholder="Optional Medusa collection ID" onChange={(collectionId) => update({ collectionId })} />
                <TextField id="builder-collection-handle" label="Collection handle" value={draft.collectionHandle} placeholder="christmas-collection" onChange={(collectionHandle) => update({ collectionHandle })} />
              </>
            )}

            {draft.type === "promotion" && (
              <TextField id="builder-promotion-code" label="Promotion code" value={draft.promotionCode} placeholder="Optional coupon code" onChange={(promotionCode) => update({ promotionCode })} />
            )}

            {draft.type === "contact" && (
              <>
                <TextField id="builder-contact-email" label="Email" value={draft.contactEmail} onChange={(contactEmail) => update({ contactEmail })} />
                <TextField id="builder-contact-phone" label="Phone" value={draft.contactPhone} onChange={(contactPhone) => update({ contactPhone })} />
                <TextField id="builder-contact-hours" label="Opening hours" value={draft.contactHours} onChange={(contactHours) => update({ contactHours })} />
              </>
            )}

            {draft.type === "testimonial" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="builder-testimonial-quote">Quote</Label>
                  <Textarea id="builder-testimonial-quote" rows={5} value={draft.testimonialQuote || ""} onChange={(event) => update({ testimonialQuote: event.target.value })} />
                </div>
                <TextField id="builder-testimonial-author" label="Customer name" value={draft.testimonialAuthor} onChange={(testimonialAuthor) => update({ testimonialAuthor })} />
                <div className="space-y-2">
                  <Label>Rating</Label>
                  <Select value={String(draft.testimonialRating || 5)} onValueChange={(value) => update({ testimonialRating: Number(value) })}>
                    <Select.Trigger><Select.Value /></Select.Trigger>
                    <Select.Content>
                      {[5, 4, 3, 2, 1].map((rating) => <Select.Item key={rating} value={String(rating)}>{rating} stars</Select.Item>)}
                    </Select.Content>
                  </Select>
                </div>
              </>
            )}

            {draft.type === "delivery-notice" && (
              <TextField id="builder-delivery-deadline" label="Deadline" value={draft.deliveryDeadline} placeholder="Order by 18 December" onChange={(deliveryDeadline) => update({ deliveryDeadline })} />
            )}

            {draft.type === "personalised-greeting" && (
              <>
                <TextField id="builder-greeting-token" label="Personalisation token" value={draft.greetingToken} onChange={(greetingToken) => update({ greetingToken })} />
                <TextField id="builder-greeting-fallback" label="Fallback name" value={draft.greetingFallback} onChange={(greetingFallback) => update({ greetingFallback })} />
              </>
            )}

            <Button size="small" className="w-full" disabled={!hasChanges} onClick={apply}>Apply changes</Button>
          </Tabs.Content>

          <Tabs.Content value="style" className="space-y-5 p-6">
            {draft.type !== "divider" && (
              <div className="space-y-2">
                <Label>Alignment</Label>
                <div className="grid grid-cols-3 gap-2 rounded-lg bg-ui-bg-subtle p-1">
                  {alignmentOptions.map((option) => (
                    <Button key={option.value} size="small" variant={draft.alignment === option.value ? "secondary" : "transparent"} onClick={() => update({ alignment: option.value })}>
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            <Text size="xsmall" className="text-ui-fg-subtle">Shore & Grace colours, typography and email-safe spacing are applied automatically.</Text>
            <Button size="small" className="w-full" disabled={!hasChanges} onClick={apply}>Apply changes</Button>
          </Tabs.Content>
        </div>
      </Tabs>
    </aside>
  )
}
