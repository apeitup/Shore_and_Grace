import {
  ArrowDownMini,
  ArrowUpMini,
  Image,
  SquareTwoStack,
  Trash,
} from "@medusajs/icons"
import { IconButton, Tooltip } from "@medusajs/ui"
import { useState } from "react"
import type { NewsletterBlock, NewsletterBlockType, NewsletterProduct } from "./types"

type EmailPreviewProps = {
  blocks: NewsletterBlock[]
  selectedBlockId: string | null
  preview: "desktop" | "mobile"
  onSelectBlock: (id: string) => void
  onMoveBlock: (id: string, direction: -1 | 1) => void
  onDuplicateBlock: (id: string) => void
  onDeleteBlock: (id: string) => void
  onDropBlock: (type: NewsletterBlockType, index: number) => void
  onReorderBlock: (id: string, index: number) => void
}

const BLOCK_TYPE_TRANSFER = "application/x-sg-newsletter-block-type"
const BLOCK_ID_TRANSFER = "application/x-sg-newsletter-block-id"

const PreviewPlaceholder = ({ type }: { type: NewsletterBlockType }) => (
  <div className="flex h-40 items-center justify-center rounded-xl bg-[#f4f4f6] text-[#8a8a83]">
    <Image className="size-8" />
    <span className="ml-2 text-sm">{type === "hero" ? "Hero image" : "Image"}</span>
  </div>
)
const BlockActions = ({
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
}: {
  onMoveUp: () => void
  onMoveDown: () => void
  onDuplicate: () => void
  onDelete: () => void
}) => (
  <div className="absolute -top-10 right-2 z-10 flex items-center rounded-lg border border-ui-border-base bg-ui-bg-base p-1 shadow-elevation-flyout">
    <Tooltip content="Move up">
      <IconButton size="small" variant="transparent" onClick={onMoveUp}>
        <ArrowUpMini />
      </IconButton>
    </Tooltip>
    <Tooltip content="Move down">
      <IconButton size="small" variant="transparent" onClick={onMoveDown}>
        <ArrowDownMini />
      </IconButton>
    </Tooltip>
    <Tooltip content="Duplicate">
      <IconButton size="small" variant="transparent" onClick={onDuplicate}>
        <SquareTwoStack />
      </IconButton>
    </Tooltip>
    <Tooltip content="Delete">
      <IconButton size="small" variant="transparent" onClick={onDelete}>
        <Trash />
      </IconButton>
    </Tooltip>
  </div>
)

const hasText = (value?: string) => Boolean(value?.trim())

const storefrontUrl = (
  import.meta.env.VITE_STOREFRONT_URL || "http://localhost:8000"
).replace(/\/$/, "")

const EmailPreviewHeader = () => (
  <div className="bg-[#78866b] px-[10px] py-[25px] text-white">
    <div className="relative mx-auto h-[70px] w-[220px] text-left">
      <img
        src={`${storefrontUrl}/assets/email/header-botanical.png`}
        width="87"
        height="56"
        alt=""
        className="absolute left-[-16px] top-0 h-[56px] w-[87px]"
      />
      <div className="absolute left-0 top-[14px] z-[2] w-[220px]">
        <div className="whitespace-nowrap font-serif text-[30px] font-normal leading-[30px] tracking-[1.8px]">
          Shore &amp; Grace
        </div>
        <div className="whitespace-nowrap font-sans text-[9.7px] font-medium uppercase leading-4 tracking-[5.4px]">
          Floral &amp; Gift Studio
        </div>
      </div>
    </div>
  </div>
)

const socialLinks = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61594766006657",
    icon: "facebook.png",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/shore_and_grace",
    icon: "instagram.png",
  },
  {
    label: "Pinterest",
    href: "https://pin.it/3d5EAgITz",
    icon: "pinterest.png",
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@shoreandgrace",
    icon: "youtube.png",
  },
]

const EmailPreviewFooter = () => (
  <div className="border-t border-[#e3dfda] bg-[#f2f0ed] px-5 py-6 text-center">
    <div className="font-sans text-[11px] font-semibold uppercase leading-4 tracking-[1.4px] text-[#78866b]">
      Follow us
    </div>
    <div className="flex items-center justify-center gap-2 py-3 pb-[10px]">
      {socialLinks.map((social) => (
        <a
          key={social.label}
          href={social.href}
          aria-label={social.label}
          className="flex size-11 items-center justify-center rounded-full border border-[#78866b]"
          onClick={(event) => event.preventDefault()}
        >
          <img
            src={`${storefrontUrl}/assets/email/${social.icon}`}
            width="20"
            height="20"
            alt={social.label}
            className="size-5"
          />
        </a>
      ))}
    </div>
    <div className="font-sans text-[12px] leading-[18px] text-[#403a34]">
      contact@shoreandgrace.com
    </div>
    <div className="pt-2 font-sans text-[11px] leading-[18px] text-[#817a73]">
      © {new Date().getFullYear()} Shore &amp; Grace. All rights reserved.
    </div>
    <div className="font-sans text-[11px] leading-[18px] text-[#817a73]">
      <a
        href="#unsubscribe"
        className="text-inherit underline"
        onClick={(event) => event.preventDefault()}
      >
        Unsubscribe
      </a>
      &nbsp;·&nbsp; Privacy policy &nbsp;·&nbsp; Cookie policy
    </div>
  </div>
)

const BlockDropZone = ({
  index,
  onDropBlock,
  onReorderBlock,
}: {
  index: number
  onDropBlock: (type: NewsletterBlockType, index: number) => void
  onReorderBlock: (id: string, index: number) => void
}) => {
  const [isActive, setIsActive] = useState(false)

  return (
    <div
      className={`h-3 rounded-md transition-colors ${
        isActive ? "bg-ui-bg-interactive/20 ring-2 ring-ui-fg-interactive" : ""
      }`}
      onDragEnter={(event) => {
        event.preventDefault()
        setIsActive(true)
      }}
      onDragOver={(event) => {
        event.preventDefault()
        event.dataTransfer.dropEffect = event.dataTransfer.types.includes(
          BLOCK_ID_TRANSFER,
        )
          ? "move"
          : "copy"
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsActive(false)
        }
      }}
      onDrop={(event) => {
        event.preventDefault()
        setIsActive(false)

        const blockId = event.dataTransfer.getData(BLOCK_ID_TRANSFER)
        const blockType = event.dataTransfer.getData(
          BLOCK_TYPE_TRANSFER,
        ) as NewsletterBlockType

        if (blockId) {
          onReorderBlock(blockId, index)
          return
        }

        if (blockType) {
          onDropBlock(blockType, index)
        }
      }}
    />
  )
}

const EmptyBlock = ({ children }: { children: string }) => (
  <div className="rounded-lg border border-dashed border-[#c8c4be] bg-[#faf9f7] px-5 py-8 text-center text-[14px] text-[#8a837d]">
    {children}
  </div>
)

const ProductCard = ({ product }: { product: NewsletterProduct }) => (
  <div className="overflow-hidden rounded-xl border border-[#dedbd7] bg-white">
    <div className="flex h-32 items-center justify-center bg-[#f4f4f6] text-[#9a9994]">
      {product.thumbnail ? (
        <img src={product.thumbnail} alt="" className="size-full object-cover" />
      ) : (
        <Image className="size-7" />
      )}
    </div>
    <div className="p-4 text-left">
      <div className="text-[16px] font-semibold text-[#3f3933]">{product.title}</div>
      {hasText(product.priceLabel) && (
        <div className="mt-1 text-[14px] text-[#7d756e]">{product.priceLabel}</div>
      )}
    </div>
  </div>
)

const ProductGrid = ({ products }: { products: NewsletterProduct[] }) => {
  if (!products.length) {
    return <EmptyBlock>Choose products in the block settings</EmptyBlock>
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {products.map((product) => <ProductCard key={product.id} product={product} />)}
    </div>
  )
}

const CallToAction = ({ label, link }: { label?: string; link?: string }) =>
  hasText(label) && hasText(link) ? (
    <span
      className="mt-5 inline-flex rounded-lg bg-[#433d36] px-6 py-3 text-[14px] font-semibold text-white"
    >
      {label}
    </span>
  ) : null

const renderBlock = (block: NewsletterBlock) => {
  const textAlign = block.alignment

  switch (block.type) {
    case "hero":
      return (
        <div style={{ textAlign }}>
          {hasText(block.eyebrow) && (
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7f9273]">
              {block.eyebrow}
            </div>
          )}
          {hasText(block.title) && (
            <h2 className="font-serif text-[34px] leading-tight text-[#3f3933]">{block.title}</h2>
          )}
          {hasText(block.body) && (
            <p className={`mx-auto max-w-md text-[16px] leading-7 text-[#736b64] ${hasText(block.title) || hasText(block.eyebrow) ? "mt-4" : ""}`}>
              {block.body}
            </p>
          )}
          {block.imageUrl ? (
            <img src={block.imageUrl} alt={block.imageAlt || ""} className="mt-6 h-64 w-full rounded-xl object-cover" />
          ) : (
            <div className="mt-6"><PreviewPlaceholder type="hero" /></div>
          )}
          {hasText(block.buttonLabel) && hasText(block.buttonLink) && (
            <button
              type="button"
              className="mt-6 rounded-lg bg-[#433d36] px-6 py-3 text-[14px] font-semibold text-white"
            >
              {block.buttonLabel}
            </button>
          )}
        </div>
      )
    case "product-grid":
      return (
        <div>
          {hasText(block.title) && <h3 className="mb-4 text-center font-serif text-[26px] text-[#3f3933]">{block.title}</h3>}
          <ProductGrid products={block.products || []} />
        </div>
      )
    case "product":
      return (
        <div>
          {hasText(block.title) && <h3 className="mb-4 text-center font-serif text-[26px] text-[#3f3933]">{block.title}</h3>}
          <div className="mx-auto max-w-[260px]">
            {(block.products || []).length ? (
              <ProductCard product={block.products![0]} />
            ) : (
              <EmptyBlock>Choose a product in the block settings</EmptyBlock>
            )}
          </div>
        </div>
      )
    case "image":
      return block.imageUrl ? (
        <img src={block.imageUrl} alt={block.imageAlt || ""} className="w-full rounded-xl object-cover" />
      ) : (
        <PreviewPlaceholder type="image" />
      )
    case "button":
      return hasText(block.buttonLabel) && hasText(block.buttonLink) ? (
        <div style={{ textAlign }}>
          <button
            type="button"
            className="rounded-lg bg-[#433d36] px-6 py-3 text-[14px] font-semibold text-white"
          >
            {block.buttonLabel}
          </button>
        </div>
      ) : <EmptyBlock>Add a button label and link</EmptyBlock>
    case "divider":
      return <div className={`border-t border-[#dedbd7] ${block.dividerStyle === "dashed" ? "border-dashed" : "border-solid"}`} />
    case "signature":
      return [block.signatureGreeting, block.signatureName, block.signatureStudio].some(hasText) ? (
        <div className="text-[16px] leading-6 text-[#625b55]" style={{ textAlign }}>
          {hasText(block.signatureGreeting) && <p>{block.signatureGreeting}</p>}
          {hasText(block.signatureName) && <p className="mt-1 font-serif text-[24px] text-[#3f3933]">{block.signatureName}</p>}
          {hasText(block.signatureStudio) && <p className="mt-1 font-semibold">{block.signatureStudio}</p>}
          {block.signatureStyle === "formal" && <p>Floral & Gift Studio</p>}
        </div>
      ) : <EmptyBlock>Add signature details</EmptyBlock>
    case "occasion":
      return (
        <div className="rounded-xl bg-[#eef1eb] p-6" style={{ textAlign }}>
          {hasText(block.eyebrow) && <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64815b]">{block.eyebrow}</div>}
          {hasText(block.title) && <h3 className={`${hasText(block.eyebrow) ? "mt-2" : ""} font-serif text-[26px] text-[#3f3933]`}>{block.title}</h3>}
          {hasText(block.body) && <p className={`${hasText(block.title) || hasText(block.eyebrow) ? "mt-2" : ""} text-[16px] text-[#736b64]`}>{block.body}</p>}
          {hasText(block.buttonLabel) && hasText(block.buttonLink) && (
            <button type="button" className="mt-5 rounded-lg bg-[#433d36] px-6 py-3 text-[14px] font-semibold text-white">{block.buttonLabel}</button>
          )}
        </div>
      )
    case "spacer": {
      const height = block.spacerSize === "small" ? 16 : block.spacerSize === "large" ? 64 : 32

      return <div aria-label={`${block.spacerSize || "medium"} spacer`} style={{ height }} />
    }
    case "heading":
      return hasText(block.eyebrow) || hasText(block.title) ? (
        <div style={{ textAlign }}>
          {hasText(block.eyebrow) && <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7f9273]">{block.eyebrow}</div>}
          {hasText(block.title) && <h3 className="font-serif text-[30px] leading-tight text-[#3f3933]">{block.title}</h3>}
        </div>
      ) : <EmptyBlock>Add a heading in the block settings</EmptyBlock>
    case "columns":
      return [block.leftTitle, block.leftBody, block.rightTitle, block.rightBody].some(hasText) ? (
        <div className="grid grid-cols-2 gap-5">
          <div className="rounded-xl bg-[#f7f5f2] p-5">
            {hasText(block.leftTitle) && <h3 className="font-serif text-[22px] text-[#3f3933]">{block.leftTitle}</h3>}
            {hasText(block.leftBody) && <p className={`${hasText(block.leftTitle) ? "mt-2" : ""} text-[16px] leading-6 text-[#736b64]`}>{block.leftBody}</p>}
          </div>
          <div className="rounded-xl bg-[#f7f5f2] p-5">
            {hasText(block.rightTitle) && <h3 className="font-serif text-[22px] text-[#3f3933]">{block.rightTitle}</h3>}
            {hasText(block.rightBody) && <p className={`${hasText(block.rightTitle) ? "mt-2" : ""} text-[16px] leading-6 text-[#736b64]`}>{block.rightBody}</p>}
          </div>
        </div>
      ) : <EmptyBlock>Add column content in the block settings</EmptyBlock>
    case "collection":
      return [block.eyebrow, block.title, block.body, block.imageUrl, block.buttonLabel].some(hasText) ? (
        <div className="overflow-hidden rounded-xl border border-[#dedbd7] bg-white" style={{ textAlign }}>
          {block.imageUrl && <img src={block.imageUrl} alt={block.imageAlt || ""} className="h-56 w-full object-cover" />}
          <div className="p-6">
            {hasText(block.eyebrow) && <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7f9273]">{block.eyebrow}</div>}
            {hasText(block.title) && <h3 className={`${hasText(block.eyebrow) ? "mt-2" : ""} font-serif text-[28px] text-[#3f3933]`}>{block.title}</h3>}
            {hasText(block.body) && <p className="mt-3 text-[16px] leading-7 text-[#736b64]">{block.body}</p>}
            <CallToAction label={block.buttonLabel} link={block.buttonLink} />
          </div>
        </div>
      ) : <EmptyBlock>Add collection content in the block settings</EmptyBlock>
    case "promotion":
      return [block.eyebrow, block.title, block.body, block.promotionCode, block.buttonLabel].some(hasText) ? (
        <div className="rounded-xl bg-[#eef1eb] p-7" style={{ textAlign }}>
          {hasText(block.eyebrow) && <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64815b]">{block.eyebrow}</div>}
          {hasText(block.title) && <h3 className={`${hasText(block.eyebrow) ? "mt-2" : ""} font-serif text-[28px] text-[#3f3933]`}>{block.title}</h3>}
          {hasText(block.body) && <p className="mt-3 text-[16px] leading-7 text-[#736b64]">{block.body}</p>}
          {hasText(block.promotionCode) && <div className="mx-auto mt-5 inline-block rounded-lg border border-dashed border-[#7f9273] bg-white px-5 py-3 font-mono text-[16px] font-semibold tracking-[0.12em] text-[#3f3933]">{block.promotionCode}</div>}
          <div><CallToAction label={block.buttonLabel} link={block.buttonLink} /></div>
        </div>
      ) : <EmptyBlock>Add promotion content in the block settings</EmptyBlock>
    case "contact":
      return [block.title, block.contactEmail, block.contactPhone, block.contactHours].some(hasText) ? (
        <div className="rounded-xl border border-[#dedbd7] p-6" style={{ textAlign }}>
          {hasText(block.title) && <h3 className="font-serif text-[26px] text-[#3f3933]">{block.title}</h3>}
          <div className={`${hasText(block.title) ? "mt-4" : ""} space-y-1 text-[16px] leading-6 text-[#736b64]`}>
            {hasText(block.contactEmail) && <p>{block.contactEmail}</p>}
            {hasText(block.contactPhone) && <p>{block.contactPhone}</p>}
            {hasText(block.contactHours) && <p>{block.contactHours}</p>}
          </div>
        </div>
      ) : <EmptyBlock>Add contact details in the block settings</EmptyBlock>
    case "testimonial":
      return [block.title, block.testimonialQuote, block.testimonialAuthor].some(hasText) ? (
        <div className="rounded-xl bg-[#f7f5f2] p-7" style={{ textAlign }}>
          {hasText(block.title) && <h3 className="font-serif text-[26px] text-[#3f3933]">{block.title}</h3>}
          {Boolean(block.testimonialRating) && <div className="mt-3 tracking-[0.2em] text-[#a39175]">{"★".repeat(block.testimonialRating || 0)}</div>}
          {hasText(block.testimonialQuote) && <blockquote className="mt-4 font-serif text-[22px] italic leading-8 text-[#514a44]">“{block.testimonialQuote}”</blockquote>}
          {hasText(block.testimonialAuthor) && <p className="mt-3 text-[14px] font-semibold text-[#736b64]">{block.testimonialAuthor}</p>}
        </div>
      ) : <EmptyBlock>Add a testimonial in the block settings</EmptyBlock>
    case "delivery-notice":
      return [block.eyebrow, block.title, block.body, block.deliveryDeadline].some(hasText) ? (
        <div className="rounded-xl border border-[#b9c4b1] bg-[#f7faf5] p-6" style={{ textAlign }}>
          {hasText(block.eyebrow) && <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64815b]">{block.eyebrow}</div>}
          {hasText(block.title) && <h3 className={`${hasText(block.eyebrow) ? "mt-2" : ""} font-serif text-[26px] text-[#3f3933]`}>{block.title}</h3>}
          {hasText(block.deliveryDeadline) && <p className="mt-3 text-[16px] font-semibold text-[#4f6848]">{block.deliveryDeadline}</p>}
          {hasText(block.body) && <p className="mt-2 text-[16px] leading-7 text-[#736b64]">{block.body}</p>}
        </div>
      ) : <EmptyBlock>Add a delivery notice in the block settings</EmptyBlock>
    case "personalised-greeting":
      return [block.eyebrow, block.title, block.body].some(hasText) ? (
        <div style={{ textAlign }}>
          {hasText(block.eyebrow) && <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7f9273]">{block.eyebrow}</div>}
          {hasText(block.title) && <h3 className="font-serif text-[30px] text-[#3f3933]">{block.title}</h3>}
          {hasText(block.body) && <p className={`${hasText(block.title) ? "mt-3" : ""} text-[16px] leading-7 text-[#736b64]`}>{block.body}</p>}
          {hasText(block.greetingFallback) && <p className="mt-3 text-[12px] text-[#9a938c]">Fallback: {block.greetingFallback}</p>}
        </div>
      ) : <EmptyBlock>Add a greeting in the block settings</EmptyBlock>
    case "content-card":
      return [block.eyebrow, block.title, block.body, block.imageUrl, block.buttonLabel].some(hasText) ? (
        <div className="overflow-hidden rounded-xl border border-[#dedbd7] bg-white">
          {block.imageUrl && <img src={block.imageUrl} alt={block.imageAlt || ""} className="h-52 w-full object-cover" />}
          <div className="p-6" style={{ textAlign }}>
            {hasText(block.eyebrow) && <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7f9273]">{block.eyebrow}</div>}
            {hasText(block.title) && <h3 className={`${hasText(block.eyebrow) ? "mt-2" : ""} font-serif text-[26px] text-[#3f3933]`}>{block.title}</h3>}
            {hasText(block.body) && <p className="mt-3 text-[16px] leading-7 text-[#736b64]">{block.body}</p>}
            <CallToAction label={block.buttonLabel} link={block.buttonLink} />
          </div>
        </div>
      ) : <EmptyBlock>Add card content in the block settings</EmptyBlock>
    default:
      return hasText(block.title) || hasText(block.body) ? (
        <div style={{ textAlign }}>
          {hasText(block.title) && <h3 className="font-serif text-[26px] text-[#3f3933]">{block.title}</h3>}
          {hasText(block.body) && <p className={`${hasText(block.title) ? "mt-3" : ""} text-[16px] leading-7 text-[#736b64]`}>{block.body}</p>}
        </div>
      ) : <EmptyBlock>Add text in the block settings</EmptyBlock>
  }
}

export const EmailPreview = ({
  blocks,
  selectedBlockId,
  preview,
  onSelectBlock,
  onMoveBlock,
  onDuplicateBlock,
  onDeleteBlock,
  onDropBlock,
  onReorderBlock,
}: EmailPreviewProps) => (
  <div
    className={`mx-auto overflow-hidden rounded-2xl bg-white shadow-elevation-card-rest transition-[width] duration-200 ${
      preview === "mobile" ? "w-[390px]" : "w-[600px]"
    }`}
  >
    <EmailPreviewHeader />

    <div className="px-8 py-10">
      {blocks.map((block, index) => {
        const isSelected = block.id === selectedBlockId

        return (
          <div key={block.id}>
            <BlockDropZone
              index={index}
              onDropBlock={onDropBlock}
              onReorderBlock={onReorderBlock}
            />
            <section
              role="button"
              tabIndex={0}
              draggable
              onDragStart={(event) => {
                event.dataTransfer.effectAllowed = "move"
                event.dataTransfer.setData(BLOCK_ID_TRANSFER, block.id)
              }}
              onClick={() => onSelectBlock(block.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  onSelectBlock(block.id)
                }
              }}
              className={`relative my-7 cursor-grab rounded-lg outline-none transition active:cursor-grabbing ${
                isSelected
                  ? "ring-2 ring-ui-fg-interactive ring-offset-4"
                  : "hover:ring-1 hover:ring-ui-border-strong hover:ring-offset-4"
              }`}
            >
              {isSelected && (
                <BlockActions
                  onMoveUp={() => onMoveBlock(block.id, -1)}
                  onMoveDown={() => onMoveBlock(block.id, 1)}
                  onDuplicate={() => onDuplicateBlock(block.id)}
                  onDelete={() => onDeleteBlock(block.id)}
                />
              )}
              {renderBlock(block)}
            </section>
          </div>
        )
      })}
      <BlockDropZone
        index={blocks.length}
        onDropBlock={onDropBlock}
        onReorderBlock={onReorderBlock}
      />
    </div>

    <EmailPreviewFooter />
  </div>
)
