import {
  colors,
  contentResult,
  emailSignature,
  emailSignatureText,
  escapeHtml,
  infoCard,
  lineBreaks,
} from "../layout"
import type { EmailContent } from "../types"

export type ContactAcknowledgementData = {
  name: string
  reference: string
}

export type InternalContactEnquiryData = ContactAcknowledgementData & {
  email: string
  phone?: string | null
  orderReference?: string | null
  category: string
  message: string
}

export type ContactReplyData = ContactAcknowledgementData & {
  subject: string
  message: string
  originalMessage: string
}

export const renderContactReplyEmail = ({
  name,
  reference,
  subject,
  message,
  originalMessage,
}: ContactReplyData): EmailContent => {
  const firstName = name.trim().split(/\s+/)[0] || name
  const replyTitle = /^re:/i.test(subject.trim())
    ? subject.trim()
    : `Re: ${subject.trim()}`
  const html = `
    <div class="sg-eyebrow" style="font-family:Montserrat,Arial,sans-serif;font-size:11px;line-height:16px;font-weight:600;letter-spacing:1.4px;color:${colors.sage};text-transform:uppercase">Contact us reply</div>
    <h1 class="sg-title" style="padding-top:24px;font-family:'Cormorant Garamond',Georgia,serif;font-size:32px;line-height:1.2;font-weight:400;color:${colors.ink};margin:0">${escapeHtml(replyTitle)}</h1>
    <div class="sg-copy" style="padding-top:24px;font-family:Montserrat,Arial,sans-serif;font-size:16px;line-height:24px;color:${colors.ink}">Hello ${escapeHtml(firstName)},</div>
    <div class="sg-copy" style="padding-top:24px;font-family:Montserrat,Arial,sans-serif;font-size:15px;line-height:24px;color:${colors.ink}">${lineBreaks(message)}</div>
    <div style="padding-top:24px">${infoCard(`
      <div class="sg-eyebrow" style="font-family:Montserrat,Arial,sans-serif;font-size:11px;line-height:16px;font-weight:600;letter-spacing:1.2px;color:${colors.sage};text-transform:uppercase">Your enquiry</div>
      <div class="sg-section-title" style="padding-top:6px;font-family:Montserrat,Arial,sans-serif;font-size:16px;line-height:21px;font-weight:600;color:${colors.ink}">REF: ${escapeHtml(reference)}</div>
      <div class="sg-copy" style="padding-top:6px;font-family:Montserrat,Arial,sans-serif;font-size:15px;line-height:24px;color:${colors.ink}">${lineBreaks(originalMessage)}</div>
    `)}</div>
    <div class="sg-copy sg-secondary" style="padding-top:24px;font-family:Montserrat,Arial,sans-serif;font-size:14px;line-height:22px;color:${colors.secondary}">Reply to this email if you would like to add anything to your enquiry.</div>
    <div style="height:1px;background:${colors.border};margin-top:24px"></div>
    <div style="padding-top:24px">${emailSignature("informal")}</div>`

  return contentResult(
    subject,
    `${replyTitle}\n\nHello ${firstName},\n\n${message}\n\nYour enquiry\nREF: ${reference}\n${originalMessage}\n\nReply to this email if you would like to add anything to your enquiry.\n\n${emailSignatureText("informal")}`,
    html,
    `${subject} — enquiry ${reference}`,
  )
}

export const renderContactAcknowledgementEmail = ({
  name,
  reference,
}: ContactAcknowledgementData): EmailContent => {
  const subject = `We received your message (${reference})`
  const card = infoCard(`
    <div class="sg-eyebrow" style="font-family:Montserrat,Arial,sans-serif;font-size:11px;line-height:16px;font-weight:600;letter-spacing:1.2px;color:${colors.sage};text-transform:uppercase">Your message reference</div>
    <div class="sg-section-title" style="padding-top:6px;font-family:Montserrat,Arial,sans-serif;font-size:18px;line-height:24px;font-weight:600;color:${colors.ink}">${escapeHtml(reference)}</div>
    <div class="sg-copy sg-secondary" style="padding-top:6px;font-family:Montserrat,Arial,sans-serif;font-size:13px;line-height:19px;color:${colors.secondary}">Keep this reference if you need to follow up.</div>
  `)
  const html = `
    <div class="sg-eyebrow" style="font-family:Montserrat,Arial,sans-serif;font-size:11px;line-height:16px;font-weight:600;letter-spacing:1.4px;color:${colors.sage};text-transform:uppercase">Message received</div>
    <h1 class="sg-title" style="padding-top:24px;font-family:'Cormorant Garamond',Georgia,serif;font-size:32px;line-height:1.2;font-weight:400;color:${colors.ink};margin:0">Thank you for getting in touch</h1>
    <div class="sg-copy" style="padding-top:24px;font-family:Montserrat,Arial,sans-serif;font-size:16px;line-height:24px;font-weight:600;color:${colors.ink}">Hello ${escapeHtml(name)},</div>
    <div class="sg-copy" style="padding-top:24px;font-family:Montserrat,Arial,sans-serif;font-size:15px;line-height:24px;color:${colors.ink}">Thank you for contacting Shore &amp; Grace. We have received your message and aim to reply within two working days.</div>
    <div style="padding-top:24px">${card}</div>
    <div class="sg-copy sg-secondary" style="padding-top:24px;font-family:Montserrat,Arial,sans-serif;font-size:14px;line-height:22px;color:${colors.secondary}">If you need to add anything, simply reply to this email and your message will stay with the same enquiry.</div>
    <div style="height:1px;background:${colors.border};margin-top:24px"></div>
    <div style="padding-top:24px">${emailSignature("formal")}</div>`

  return contentResult(
    subject,
    `Hello ${name},\n\nThank you for contacting Shore & Grace. We have received your message and aim to reply within two working days.\n\nYour message reference is ${reference}. Keep this reference if you need to follow up.\n\nIf you need to add anything, simply reply to this email and your message will stay with the same enquiry.\n\n${emailSignatureText("formal")}`,
    html,
    `We received your message. Your reference is ${reference}.`,
  )
}

export const renderInternalContactEnquiryEmail = (
  enquiry: InternalContactEnquiryData,
): EmailContent => {
  const subject = `[${enquiry.reference}] ${enquiry.category} enquiry from ${enquiry.name}`
  const optionalRows = [
    enquiry.phone
      ? `<p class="sg-copy" style="margin:0 0 8px"><strong>Phone:</strong> ${escapeHtml(enquiry.phone)}</p>`
      : "",
    enquiry.orderReference
      ? `<p class="sg-copy" style="margin:0 0 8px"><strong>Order/reference:</strong> ${escapeHtml(enquiry.orderReference)}</p>`
      : "",
  ].join("")
  const html = `
    <div class="sg-eyebrow" style="font-family:Montserrat,Arial,sans-serif;font-size:11px;line-height:16px;font-weight:600;letter-spacing:1.4px;color:${colors.sage};text-transform:uppercase">New contact enquiry</div>
    <h1 class="sg-title" style="padding-top:24px;font-family:'Cormorant Garamond',Georgia,serif;font-size:32px;line-height:1.2;font-weight:400;color:${colors.ink};margin:0">${escapeHtml(enquiry.name)} has sent a message</h1>
    <div style="padding-top:24px">${infoCard(`
      <p class="sg-copy" style="margin:0 0 8px"><strong>Reference:</strong> ${escapeHtml(enquiry.reference)}</p>
      <p class="sg-copy" style="margin:0 0 8px"><strong>Category:</strong> ${escapeHtml(enquiry.category)}</p>
      <p class="sg-copy" style="margin:0 0 8px"><strong>Email:</strong> ${escapeHtml(enquiry.email)}</p>
      ${optionalRows}
    `)}</div>
    <div class="sg-section-title" style="padding-top:24px;font-family:Montserrat,Arial,sans-serif;font-size:18px;line-height:24px;font-weight:600;color:${colors.ink}">Message</div>
    <div class="sg-copy" style="padding-top:12px;font-family:Montserrat,Arial,sans-serif;font-size:15px;line-height:24px;color:${colors.ink}">${lineBreaks(enquiry.message)}</div>`

  const details = [
    `Reference: ${enquiry.reference}`,
    `Category: ${enquiry.category}`,
    `Name: ${enquiry.name}`,
    `Email: ${enquiry.email}`,
    enquiry.phone ? `Phone: ${enquiry.phone}` : "",
    enquiry.orderReference ? `Order/reference: ${enquiry.orderReference}` : "",
    "",
    enquiry.message,
  ].filter(Boolean)

  return contentResult(subject, details.join("\n"), html)
}
