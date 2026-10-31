import {
  Button,
  Calendar,
  DocumentText,
  DotsSix,
  Image,
  LayoutTopBottom,
  Minus,
  SquaresPlus,
  Tag,
  Text as TextIcon,
} from "@medusajs/icons"
import { Text } from "@medusajs/ui"
import type { ComponentType } from "react"
import type { NewsletterBlockType } from "./types"

type BlockDefinition = {
  type: NewsletterBlockType
  label: string
  description: string
  icon: ComponentType<{ className?: string }>
}

const blockDefinitions: BlockDefinition[] = [
  {
    type: "hero",
    label: "Hero",
    description: "Image, title and CTA",
    icon: LayoutTopBottom,
  },
  {
    type: "text",
    label: "Text",
    description: "Heading and body copy",
    icon: TextIcon,
  },
  {
    type: "image",
    label: "Image",
    description: "Single image",
    icon: Image,
  },
  {
    type: "product",
    label: "Product",
    description: "One store product",
    icon: Tag,
  },
  {
    type: "product-grid",
    label: "Product grid",
    description: "Two or more products",
    icon: SquaresPlus,
  },
  {
    type: "occasion",
    label: "Occasion",
    description: "Date-led callout",
    icon: Calendar,
  },
  {
    type: "button",
    label: "Button",
    description: "Primary call to action",
    icon: Button,
  },
  {
    type: "divider",
    label: "Divider",
    description: "Visual separator",
    icon: Minus,
  },
  {
    type: "signature",
    label: "Signature",
    description: "Shore & Grace sign-off",
    icon: DocumentText,
  },
  {
    type: "spacer",
    label: "Spacer",
    description: "Adjust vertical space",
    icon: Minus,
  },
  {
    type: "heading",
    label: "Heading",
    description: "Standalone section title",
    icon: TextIcon,
  },
  {
    type: "columns",
    label: "Two columns",
    description: "Paired text content",
    icon: SquaresPlus,
  },
  {
    type: "collection",
    label: "Collection",
    description: "Feature a collection",
    icon: Tag,
  },
  {
    type: "promotion",
    label: "Promotion",
    description: "Offer or coupon code",
    icon: Tag,
  },
  {
    type: "contact",
    label: "Contact details",
    description: "Email, phone and hours",
    icon: DocumentText,
  },
  {
    type: "testimonial",
    label: "Testimonial",
    description: "Customer quote",
    icon: DocumentText,
  },
  {
    type: "delivery-notice",
    label: "Delivery notice",
    description: "Deadline or service update",
    icon: Calendar,
  },
  {
    type: "personalised-greeting",
    label: "Personal greeting",
    description: "Recipient-aware welcome",
    icon: TextIcon,
  },
  {
    type: "content-card",
    label: "Content card",
    description: "Image, copy and CTA",
    icon: LayoutTopBottom,
  },
]

const sortedBlockDefinitions = [...blockDefinitions].sort((left, right) =>
  left.label.localeCompare(right.label),
)
type BlockLibraryProps = {
  onAddBlock: (type: NewsletterBlockType) => void
}

export const BlockLibrary = ({ onAddBlock }: BlockLibraryProps) => (
  <aside className="flex min-h-0 w-[320px] shrink-0 flex-col border-r border-ui-border-base bg-ui-bg-base">
    <div className="px-6 py-5">
      <Text size="small" weight="plus">
        Add content
      </Text>
      <Text size="xsmall" className="mt-1 text-ui-fg-subtle">
        Drag or click a block to add it to the email.
      </Text>
    </div>
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto p-4">
      {sortedBlockDefinitions.map((block) => {
        const Icon = block.icon

        return (
          <button
            key={block.type}
            type="button"
            draggable
            onDragStart={(event) => {
              event.dataTransfer.effectAllowed = "copy"
              event.dataTransfer.setData(
                "application/x-sg-newsletter-block-type",
                block.type,
              )
            }}
            onClick={() => onAddBlock(block.type)}
            className="group flex w-full items-center gap-3 rounded-lg border border-ui-border-base bg-ui-bg-base p-2 text-left shadow-elevation-card-rest transition hover:bg-ui-bg-base-hover hover:shadow-elevation-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-fg-interactive"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-ui-bg-subtle text-ui-fg-subtle">
              <Icon className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
              <Text size="small" weight="plus">
                {block.label}
              </Text>
              <Text size="xsmall" className="text-ui-fg-subtle">
                {block.description}
              </Text>
            </span>
            <DotsSix className="size-4 shrink-0 text-ui-fg-muted" />
          </button>
        )
      })}
    </div>
  </aside>
)
