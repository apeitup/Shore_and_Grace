import {
  emailButton,
  emailSignature,
  escapeHtml,
  lineBreaks,
  renderEmailLayout,
} from "./layout"

type NewsletterProduct = {
  title?: string
  handle?: string
  thumbnail?: string
  priceLabel?: string
}

type NewsletterBlock = {
  type?: string
  eyebrow?: string
  title?: string
  body?: string
  imageUrl?: string
  imageAlt?: string
  imageLink?: string
  buttonLabel?: string
  buttonLink?: string
  products?: NewsletterProduct[]
  alignment?: "left" | "center" | "right"
  signatureStyle?: "formal" | "simple"
  signatureGreeting?: string
  signatureName?: string
  signatureStudio?: string
  spacerSize?: "small" | "medium" | "large"
  leftTitle?: string
  leftBody?: string
  rightTitle?: string
  rightBody?: string
  promotionCode?: string
  contactEmail?: string
  contactPhone?: string
  contactHours?: string
  testimonialQuote?: string
  testimonialAuthor?: string
  testimonialRating?: number
  deliveryDeadline?: string
  greetingFallback?: string
}

type RenderNewsletterInput = {
  subject: string
  preheader?: string | null
  blocks: NewsletterBlock[]
  unsubscribeUrl: string
  recipientName?: string | null
  siteUrl?: string
  transformLink?: (url: string) => string
  trackingPixelUrl?: string
}

const text = (value?: string | null) => Boolean(value?.trim())
const section = (content: string) => content
  ? `<div style="padding-bottom:28px">${content}</div>`
  : ""

const renderProducts = (
  products: NewsletterProduct[],
  siteUrl: string,
  transformLink: (url: string) => string,
) => {
  if (!products.length) {
    return ""
  }

  return `<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0"><tr>${products
    .slice(0, 2)
    .map((product) => {
      const url = transformLink(
        `${siteUrl}/products/${encodeURIComponent(product.handle || "")}`,
      )
      return `<td width="50%" valign="top" style="padding:8px;text-align:center">${product.thumbnail ? `<a href="${escapeHtml(url)}"><img src="${escapeHtml(product.thumbnail)}" width="220" alt="${escapeHtml(product.title || "Product")}" style="display:block;width:100%;max-width:220px;border-radius:12px;margin:0 auto 12px"></a>` : ""}<div class="sg-section-title">${escapeHtml(product.title || "")}</div>${product.priceLabel ? `<div class="sg-copy sg-secondary" style="padding-top:6px">${escapeHtml(product.priceLabel)}</div>` : ""}</td>`
    })
    .join("")}</tr></table>`
}

const renderBlock = (
  block: NewsletterBlock,
  recipientName: string,
  siteUrl: string,
  transformLink: (url: string) => string,
) => {
  const align = block.alignment || "left"
  const eyebrow = text(block.eyebrow)
    ? `<div class="sg-eyebrow" style="padding-bottom:8px">${escapeHtml(block.eyebrow)}</div>`
    : ""
  const title = text(block.title)
    ? `<h2 class="sg-title" style="text-align:${align}">${escapeHtml(block.title?.replace(/{{\s*first_name\s*}}/g, recipientName))}</h2>`
    : ""
  const body = text(block.body)
    ? `<div class="sg-copy sg-secondary" style="padding-top:12px;text-align:${align}">${lineBreaks(block.body)}</div>`
    : ""
  const button = text(block.buttonLabel) && text(block.buttonLink)
    ? `<div style="padding-top:20px">${emailButton(block.buttonLabel!, transformLink(block.buttonLink!))}</div>`
    : ""

  switch (block.type) {
    case "image":
      return block.imageUrl
        ? section(`<div style="text-align:${align}">${block.imageLink ? `<a href="${escapeHtml(transformLink(block.imageLink))}">` : ""}<img src="${escapeHtml(block.imageUrl)}" alt="${escapeHtml(block.imageAlt || "")}" style="display:block;width:100%;height:auto;border-radius:12px">${block.imageLink ? "</a>" : ""}</div>`)
        : ""
    case "product":
    case "product-grid":
      return section(`${title}${renderProducts(block.products || [], siteUrl, transformLink)}`)
    case "divider":
      return `<div style="height:1px;background:#d9d6d1;margin:0 0 28px">&nbsp;</div>`
    case "spacer":
      return `<div style="height:${block.spacerSize === "large" ? 48 : block.spacerSize === "small" ? 16 : 32}px">&nbsp;</div>`
    case "signature":
      return section(emailSignature(block.signatureStyle === "simple" ? "informal" : "formal"))
    case "columns":
      return section(`<table role="presentation" width="100%"><tr><td width="50%" valign="top" style="padding-right:12px"><div class="sg-section-title">${escapeHtml(block.leftTitle || "")}</div><div class="sg-copy sg-secondary" style="padding-top:8px">${lineBreaks(block.leftBody || "")}</div></td><td width="50%" valign="top" style="padding-left:12px"><div class="sg-section-title">${escapeHtml(block.rightTitle || "")}</div><div class="sg-copy sg-secondary" style="padding-top:8px">${lineBreaks(block.rightBody || "")}</div></td></tr></table>`)
    case "testimonial":
      return section(`<div style="padding:20px;border:1px solid #d9d6d1;border-radius:12px;text-align:${align}"><div class="sg-copy">“${escapeHtml(block.testimonialQuote || "")}”</div>${text(block.testimonialAuthor) ? `<div class="sg-copy sg-secondary" style="padding-top:10px">${escapeHtml(block.testimonialAuthor)}</div>` : ""}</div>`)
    case "contact":
      return section(`${title}<div class="sg-copy sg-secondary" style="padding-top:12px;text-align:${align}">${[block.contactEmail, block.contactPhone, block.contactHours].filter(text).map(escapeHtml).join("<br>")}</div>`)
    case "promotion":
      return section(`<div style="padding:24px;background:#f2f0ed;border-radius:12px;text-align:${align}">${eyebrow}${title}${body}${text(block.promotionCode) ? `<div class="sg-section-title" style="padding-top:16px">Code: ${escapeHtml(block.promotionCode)}</div>` : ""}${button}</div>`)
    default:
      return section(`<div style="text-align:${align}">${eyebrow}${title}${body}${block.imageUrl ? `<img src="${escapeHtml(block.imageUrl)}" alt="${escapeHtml(block.imageAlt || "")}" style="display:block;width:100%;height:auto;border-radius:12px;margin-top:18px">` : ""}${block.deliveryDeadline ? `<div class="sg-section-title" style="padding-top:14px">${escapeHtml(block.deliveryDeadline)}</div>` : ""}${button}</div>`)
  }
}

export const renderNewsletterEmail = ({
  subject,
  preheader,
  blocks,
  unsubscribeUrl,
  recipientName,
  siteUrl = process.env.STOREFRONT_URL || "http://localhost:8000",
  transformLink = (url) => url,
  trackingPixelUrl,
}: RenderNewsletterInput) => {
  const normalizedSiteUrl = siteUrl.replace(/\/$/, "")
  const name = recipientName?.trim() || "there"
  const content = blocks
    .map((block) =>
      renderBlock(block, name, normalizedSiteUrl, transformLink),
    )
    .join("")
  const trackingPixel = trackingPixelUrl
    ? `<img src="${escapeHtml(trackingPixelUrl)}" width="1" height="1" alt="" style="display:block;width:1px;height:1px;border:0;overflow:hidden">`
    : ""

  return {
    subject,
    text: blocks
      .flatMap((block) => [block.eyebrow, block.title, block.body])
      .filter(text)
      .join("\n\n"),
    html: renderEmailLayout({
      preheader: preheader || subject,
      content: `${content}${trackingPixel}`,
      siteUrl: normalizedSiteUrl,
      unsubscribeUrl,
    }),
  }
}
