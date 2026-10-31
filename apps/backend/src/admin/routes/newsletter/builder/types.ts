export type NewsletterBlockType =
  | "hero"
  | "text"
  | "image"
  | "product"
  | "product-grid"
  | "occasion"
  | "button"
  | "divider"
  | "signature"
  | "spacer"
  | "heading"
  | "columns"
  | "collection"
  | "promotion"
  | "contact"
  | "testimonial"
  | "delivery-notice"
  | "personalised-greeting"
  | "content-card"

export type NewsletterAlignment = "left" | "center" | "right"

export type NewsletterProduct = {
  id: string
  title: string
  handle?: string
  thumbnail?: string
  priceLabel?: string
}
export type NewsletterSignatureStyle = "formal" | "simple"
export type NewsletterSpacerSize = "small" | "medium" | "large"

export type NewsletterBlock = {
  id: string
  type: NewsletterBlockType
  eyebrow?: string
  title: string
  body?: string
  imageUrl?: string
  imageAlt?: string
  imageLink?: string
  buttonLabel?: string
  buttonLink?: string
  products?: NewsletterProduct[]
  signatureStyle?: NewsletterSignatureStyle
  signatureGreeting?: string
  signatureName?: string
  signatureStudio?: string
  dividerStyle?: "solid" | "dashed"
  spacerSize?: NewsletterSpacerSize
  leftTitle?: string
  leftBody?: string
  rightTitle?: string
  rightBody?: string
  collectionId?: string
  collectionHandle?: string
  promotionCode?: string
  contactEmail?: string
  contactPhone?: string
  contactHours?: string
  testimonialQuote?: string
  testimonialAuthor?: string
  testimonialRating?: number
  deliveryDeadline?: string
  greetingToken?: string
  greetingFallback?: string
  alignment: NewsletterAlignment
}

export type NewsletterDraft = {
  name: string
  subject?: string
  preheader?: string
  kind?: "newsletter" | "template"
  campaignId?: string
  blocks: NewsletterBlock[]
  selectedBlockId: string | null
}
