export type EmailContent = {
  subject: string
  text: string
  html: string
}

export type EmailSignatureVariant = "formal" | "informal"

export type EmailAddress = {
  firstName?: string | null
  lastName?: string | null
  address1?: string | null
  address2?: string | null
  city?: string | null
  province?: string | null
  postalCode?: string | null
  country?: string | null
  phone?: string | null
}

export type OrderEmailItem = {
  title: string
  variant?: string | null
  quantity: number
  unitPrice: string
  total: string
  imageUrl?: string | null
}

export type OrderConfirmationEmailData = {
  purchaserName: string
  purchaserEmail: string
  orderReference: string
  orderDate: string
  paymentSummary?: string | null
  subtotal: string
  deliveryTotal: string
  total: string
  items: OrderEmailItem[]
  recipientName: string
  recipientPhone?: string | null
  recipientAddress: EmailAddress
  deliveryMethod: string
  deliveryDate?: string | null
  giftMessage?: string | null
  hidePrices?: boolean
  billingAddress: EmailAddress
  orderUrl: string
}

export type SimpleActionEmailData = {
  recipientName: string
  eyebrow: string
  title: string
  intro: string
  paragraphs?: string[]
  footerNote?: string
  detailTitle?: string
  detailLines?: string[]
  actionLabel?: string
  actionUrl?: string
  signature: EmailSignatureVariant
  subject: string
  preheader?: string
}
