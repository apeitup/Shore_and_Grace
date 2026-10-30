import {
  colors,
  contentResult,
  emailButton,
  emailSignature,
  emailSignatureText,
  escapeHtml,
  infoCard,
} from "../layout"
import type { EmailContent, SimpleActionEmailData } from "../types"

export const renderSimpleActionEmail = (
  data: SimpleActionEmailData,
): EmailContent => {
  const detail = data.detailTitle || data.detailLines?.length
    ? `<div style="padding-top:24px">${infoCard(`
        ${data.detailTitle ? `<div class="sg-section-title" style="font-family:Montserrat,Arial,sans-serif;font-size:18px;line-height:24px;font-weight:600;color:${colors.ink}">${escapeHtml(data.detailTitle)}</div>` : ""}
        ${(data.detailLines || []).map((line) => `<div class="sg-copy sg-secondary" style="padding-top:8px;font-family:Montserrat,Arial,sans-serif;font-size:14px;line-height:22px;color:${colors.secondary}">${escapeHtml(line)}</div>`).join("")}
      `)}</div>`
    : ""
  const action = data.actionLabel && data.actionUrl
    ? `<div style="padding-top:24px">${emailButton(data.actionLabel, data.actionUrl)}</div>`
    : ""
  const paragraphs = (data.paragraphs || [])
    .map((paragraph) => `<div class="sg-copy" style="padding-top:16px;font-family:Montserrat,Arial,sans-serif;font-size:15px;line-height:24px;color:${colors.ink}">${escapeHtml(paragraph)}</div>`)
    .join("")
  const footerNote = data.footerNote
    ? `<div class="sg-copy sg-secondary" style="padding-top:16px;font-family:Montserrat,Arial,sans-serif;font-size:14px;line-height:22px;color:${colors.secondary}">${escapeHtml(data.footerNote)}</div>`
    : ""
  const html = `
    <div class="sg-eyebrow" style="font-family:Montserrat,Arial,sans-serif;font-size:11px;line-height:16px;font-weight:600;letter-spacing:1.4px;color:${colors.sage};text-transform:uppercase">${escapeHtml(data.eyebrow)}</div>
    <h1 class="sg-title" style="padding-top:24px;font-family:'Cormorant Garamond',Georgia,serif;font-size:36px;line-height:42px;font-weight:400;color:${colors.ink};margin:0">${escapeHtml(data.title)}</h1>
    <div class="sg-copy" style="padding-top:24px;font-family:Montserrat,Arial,sans-serif;font-size:16px;line-height:24px;font-weight:600;color:${colors.ink}">Hello ${escapeHtml(data.recipientName)},</div>
    <div class="sg-copy" style="padding-top:16px;font-family:Montserrat,Arial,sans-serif;font-size:15px;line-height:24px;color:${colors.ink}">${escapeHtml(data.intro)}</div>
    ${paragraphs}
    ${detail}
    ${action}
    ${footerNote}
    <div style="height:1px;background:${colors.border};margin-top:24px"></div>
    <div style="padding-top:24px">${emailSignature(data.signature)}</div>`
  const text = [
    `Hello ${data.recipientName},`,
    "",
    data.intro,
    ...(data.paragraphs || []).flatMap((paragraph) => ["", paragraph]),
    "",
    data.detailTitle || "",
    ...(data.detailLines || []),
    data.actionUrl ? `\n${data.actionLabel}: ${data.actionUrl}` : "",
    data.footerNote ? `\n${data.footerNote}` : "",
    "",
    emailSignatureText(data.signature),
  ].filter((line, index, lines) => line || lines[index - 1]).join("\n")
  return contentResult(data.subject, text, html, data.preheader || data.intro)
}

type NamedEmailInput = {
  recipientName: string
  actionUrl?: string
  reference?: string
  orderReference?: string
  occasionName?: string
  occasionDate?: string
  deliveryDate?: string
  refundAmount?: string
}

export const renderAccountWelcomeEmail = ({
  recipientName,
  actionUrl,
}: NamedEmailInput) => renderSimpleActionEmail({
  recipientName,
  eyebrow: "Welcome",
  title: "Your Shore & Grace account is ready",
  intro: "You can now track deliveries, save flowers, manage addresses and keep the dates that matter in one place.",
  actionLabel: "View your account",
  actionUrl,
  signature: "formal",
  subject: "Welcome to Shore & Grace",
})

export const renderEmailVerificationEmail = ({
  recipientName,
  actionUrl,
}: NamedEmailInput) => renderSimpleActionEmail({
  recipientName,
  eyebrow: "Confirm your email",
  title: "One quick step",
  intro: "Please confirm this email address so we can keep your account and order updates secure.",
  actionLabel: "Confirm email address",
  actionUrl,
  signature: "informal",
  subject: "Confirm your Shore & Grace email address",
})

export const renderPasswordResetEmail = ({
  recipientName,
  actionUrl,
}: NamedEmailInput) => renderSimpleActionEmail({
  recipientName,
  eyebrow: "Account security",
  title: "Reset your password",
  intro: "We received a request to reset your password. This secure link will expire, so please use it soon. If you did not request this, you can ignore this email.",
  actionLabel: "Reset password",
  actionUrl,
  signature: "informal",
  subject: "Reset your Shore & Grace password",
})

export const renderOrderPreparedEmail = ({
  recipientName,
  actionUrl,
  orderReference,
  deliveryDate,
}: NamedEmailInput) => renderSimpleActionEmail({
  recipientName,
  eyebrow: "Order update",
  title: "Your order is being prepared",
  intro: "Our florists are preparing your order with care.",
  detailTitle: orderReference,
  detailLines: deliveryDate ? [`Delivery: ${deliveryDate}`] : [],
  actionLabel: "View order",
  actionUrl,
  signature: "informal",
  subject: `${orderReference || "Your order"} is being prepared`,
})

export const renderOrderDispatchedEmail = ({
  recipientName,
  actionUrl,
  orderReference,
  deliveryDate,
}: NamedEmailInput) => renderSimpleActionEmail({
  recipientName,
  eyebrow: "On its way",
  title: "Your order is out for delivery",
  intro: "Your order has left the studio and is on its way to the recipient.",
  detailTitle: orderReference,
  detailLines: deliveryDate ? [`Expected delivery: ${deliveryDate}`] : [],
  actionLabel: "Track order",
  actionUrl,
  signature: "informal",
  subject: `${orderReference || "Your order"} is on its way`,
})

export const renderOrderDeliveredEmail = ({
  recipientName,
  actionUrl,
  orderReference,
}: NamedEmailInput) => renderSimpleActionEmail({
  recipientName,
  eyebrow: "Delivered",
  title: "Your order has arrived",
  intro: "Your order has been delivered. We hope it brings exactly the moment you intended.",
  detailTitle: orderReference,
  actionLabel: "View order",
  actionUrl,
  signature: "informal",
  subject: `${orderReference || "Your order"} has been delivered`,
})

export const renderOrderCancelledEmail = ({
  recipientName,
  actionUrl,
  orderReference,
}: NamedEmailInput) => renderSimpleActionEmail({
  recipientName,
  eyebrow: "Order cancelled",
  title: "Your order has been cancelled",
  intro: "This order has been cancelled. If a payment was taken, any refund will be returned to the original payment method.",
  detailTitle: orderReference,
  actionLabel: "View order",
  actionUrl,
  signature: "informal",
  subject: `${orderReference || "Your order"} has been cancelled`,
})

export const renderPaymentFailedEmail = ({
  recipientName,
  actionUrl,
  orderReference,
}: NamedEmailInput) => renderSimpleActionEmail({
  recipientName,
  eyebrow: "Payment needs attention",
  title: "We could not complete your payment",
  intro: "Your order has not been confirmed because the payment did not complete. You can return securely to try again or choose another payment method.",
  detailTitle: orderReference,
  actionLabel: "Return to payment",
  actionUrl,
  signature: "informal",
  subject: `Payment needed for ${orderReference || "your Shore & Grace order"}`,
})

export const renderDeliveryDelayedEmail = ({
  recipientName,
  actionUrl,
  orderReference,
  deliveryDate,
}: NamedEmailInput) => renderSimpleActionEmail({
  recipientName,
  eyebrow: "Delivery update",
  title: "There is a delay with your order",
  intro: "We are sorry that your delivery is taking longer than expected. We are looking after it and will keep you updated.",
  detailTitle: orderReference,
  detailLines: deliveryDate ? [`Updated delivery: ${deliveryDate}`] : [],
  actionLabel: "View order",
  actionUrl,
  signature: "formal",
  subject: `Delivery update for ${orderReference || "your order"}`,
})

export const renderRefundConfirmationEmail = ({
  recipientName,
  actionUrl,
  orderReference,
  refundAmount,
}: NamedEmailInput) => renderSimpleActionEmail({
  recipientName,
  eyebrow: "Refund confirmed",
  title: "Your refund is on its way",
  intro: "We have issued your refund to the original payment method. Your bank may take several working days to show it.",
  detailTitle: orderReference,
  detailLines: refundAmount ? [`Refund: ${refundAmount}`] : [],
  actionLabel: "View order",
  actionUrl,
  signature: "informal",
  subject: `Refund confirmed for ${orderReference || "your order"}`,
})

export const renderOccasionReminderEmail = ({
  recipientName,
  actionUrl,
  occasionName,
  occasionDate,
}: NamedEmailInput) => renderSimpleActionEmail({
  recipientName,
  eyebrow: "A gentle reminder",
  title: `${occasionName || "A special occasion"} is coming up`,
  intro: "You asked us to remind you before this date. There is still time to choose something thoughtful.",
  detailTitle: occasionName,
  detailLines: occasionDate ? [occasionDate] : [],
  actionLabel: "Find the right flowers",
  actionUrl,
  signature: "formal",
  subject: `${occasionName || "A special occasion"} is coming up`,
})

export const renderReviewRequestEmail = ({
  recipientName,
  actionUrl,
  orderReference,
}: NamedEmailInput) => renderSimpleActionEmail({
  recipientName,
  eyebrow: "Your experience",
  title: "How did we do?",
  intro: "We would love to know how your Shore & Grace order went. Your feedback helps us care for every future order.",
  detailTitle: orderReference,
  actionLabel: "Leave a review",
  actionUrl,
  signature: "formal",
  subject: "Tell us about your Shore & Grace order",
})

export const renderPrivacyRequestReceivedEmail = ({
  recipientName,
  reference,
}: NamedEmailInput) => renderSimpleActionEmail({
  recipientName,
  eyebrow: "Privacy request received",
  title: "We have received your request",
  intro: "We will review your privacy request and contact you if we need to confirm your identity or clarify anything.",
  detailTitle: reference,
  detailLines: ["Keep this reference if you need to follow up."],
  signature: "informal",
  subject: `Privacy request received (${reference || "reference pending"})`,
})

export const renderPrivacyRequestCompletedEmail = ({
  recipientName,
  actionUrl,
  reference,
}: NamedEmailInput) => renderSimpleActionEmail({
  recipientName,
  eyebrow: "Privacy request update",
  title: "Your privacy request is complete",
  intro: "We have completed your request. Use the secure link below if there are files or information for you to collect.",
  detailTitle: reference,
  actionLabel: actionUrl ? "View secure response" : undefined,
  actionUrl,
  signature: "informal",
  subject: `Privacy request completed (${reference || "reference pending"})`,
})

export const renderAccountDataReadyEmail = ({
  recipientName,
  actionUrl,
  reference,
}: NamedEmailInput) => renderSimpleActionEmail({
  recipientName,
  eyebrow: "Your account data",
  title: "Your download is ready",
  intro: "The copy of your Shore & Grace account information that you requested is ready to download securely.",
  detailTitle: reference,
  detailLines: ["For your privacy, the secure download link will expire."],
  actionLabel: "Download account data",
  actionUrl,
  signature: "informal",
  subject: "Your Shore & Grace account data is ready",
})

export const renderAccountDeletedEmail = ({
  recipientName,
}: NamedEmailInput) => renderSimpleActionEmail({
  recipientName,
  eyebrow: "Account closed",
  title: "Your account has been deleted",
  intro: "Your Shore & Grace account details and saved preferences have been removed. Order records that we must keep for legal or accounting reasons remain protected for the required period.",
  signature: "informal",
  subject: "Your Shore & Grace account has been deleted",
})

export const renderNewsletterConfirmationEmail = ({
  recipientName,
  actionUrl,
}: NamedEmailInput) => renderSimpleActionEmail({
  recipientName,
  eyebrow: "Stay inspired,",
  title: "Would you like to hear from us?",
  intro: "We care about our customers and community, so we just want to make sure you’re happy to hear from us.",
  paragraphs: [
    "Confirm below if you’d like to receive occasional emails about new collections, seasonal flowers and news from the Shore & Grace studio. We’ll never overwhelm your inbox, and you can unsubscribe at any time.",
  ],
  actionLabel: "Yes, I’d love to hear from you",
  actionUrl,
  footerNote: "If you didn’t request this email, you can simply ignore it.",
  signature: "formal",
  subject: "Please confirm you’d like to hear from us",
  preheader: "One quick step to join the Shore & Grace community.",
})
