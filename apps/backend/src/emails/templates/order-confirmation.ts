import {
  colors,
  contentResult,
  emailButton,
  emailSignature,
  emailSignatureText,
  escapeHtml,
  formatAddress,
  infoCard,
  lineBreaks,
} from "../layout"
import type {
  EmailAddress,
  EmailContent,
  OrderConfirmationEmailData,
  OrderEmailItem,
} from "../types"

const addressHtml = (address: EmailAddress) =>
  formatAddress(address).map((line) => escapeHtml(line)).join("<br>")

const orderItemHtml = (item: OrderEmailItem, hidePrices: boolean) => {
  const image = item.imageUrl
    ? `<td class="sg-mobile-block" width="116" valign="top"><img class="sg-product-image" src="${escapeHtml(item.imageUrl)}" width="116" height="116" alt="${escapeHtml(item.title)}" style="display:block;width:116px;height:116px;object-fit:cover;border-radius:10px"></td>`
    : ""
  return `
    <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="border:1px solid ${colors.border};border-radius:12px">
      <tr>
        <td class="sg-card" style="padding:16px">
          <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0"><tr>
            ${image}
            ${image ? '<td class="sg-mobile-hide" width="16">&nbsp;</td>' : ""}
            <td class="sg-mobile-block" valign="top">
              <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td class="sg-section-title sg-wrap" style="font-family:Montserrat,Arial,sans-serif;font-size:17px;line-height:24px;font-weight:600;color:${colors.ink}">${escapeHtml(item.title)}</td>
                  <td class="sg-section-title sg-desktop-only" width="80" align="right" style="width:80px;font-family:Montserrat,Arial,sans-serif;font-size:16px;line-height:24px;font-weight:600;color:${colors.ink};white-space:nowrap">${escapeHtml(item.total)}</td>
                </tr>
                <tr><td colspan="2" class="sg-mobile-only sg-section-title" style="padding-top:8px;font-family:Montserrat,Arial,sans-serif;font-size:16px;line-height:24px;font-weight:600;color:${colors.ink}">${escapeHtml(item.total)}</td></tr>
                ${item.variant ? `<tr><td colspan="2" class="sg-copy sg-secondary" style="padding-top:10px;font-family:Montserrat,Arial,sans-serif;font-size:13px;line-height:20px;color:${colors.secondary}">${escapeHtml(item.variant)}</td></tr>` : ""}
                <tr><td colspan="2" class="sg-copy sg-secondary" style="padding-top:6px;font-family:Montserrat,Arial,sans-serif;font-size:13px;line-height:20px;color:${colors.secondary}">Quantity ${item.quantity}</td></tr>
                ${hidePrices ? `<tr><td colspan="2" class="sg-copy" style="padding-top:6px;font-family:Montserrat,Arial,sans-serif;font-size:12px;line-height:18px;color:${colors.sage}">Gift order · prices hidden from recipient</td></tr>` : ""}
              </table>
            </td>
          </tr></table>
        </td>
      </tr>
    </table>`
}

const totalsHtml = (data: OrderConfirmationEmailData) => infoCard(`
  <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" class="sg-copy sg-desktop-only" style="font-family:Montserrat,Arial,sans-serif;font-size:13px;line-height:22px">
    <tr><td style="padding-bottom:8px;color:${colors.secondary}">Subtotal</td><td align="right" style="padding-bottom:8px;color:${colors.ink};font-weight:500">${escapeHtml(data.subtotal)}</td></tr>
    <tr><td style="padding-bottom:12px;color:${colors.secondary}">Delivery</td><td align="right" style="padding-bottom:12px;color:${colors.ink};font-weight:500">${escapeHtml(data.deliveryTotal)}</td></tr>
    <tr><td class="sg-section-title" style="padding-top:12px;border-top:1px solid ${colors.border};font-size:16px;font-weight:600;color:${colors.ink}">Total</td><td class="sg-section-title" align="right" style="padding-top:12px;border-top:1px solid ${colors.border};font-size:18px;font-weight:600;color:${colors.ink}">${escapeHtml(data.total)}</td></tr>
  </table>
  <div class="sg-mobile-only sg-copy" style="font-family:Montserrat,Arial,sans-serif;font-size:16px;line-height:24px;color:${colors.ink}">
    <div>Subtotal: <strong>${escapeHtml(data.subtotal)}</strong></div>
    <div style="padding-top:8px">Delivery: <strong>${escapeHtml(data.deliveryTotal)}</strong></div>
    <div style="height:1px;background:${colors.border};margin:12px 0"></div>
    <div class="sg-section-title" style="font-family:Montserrat,Arial,sans-serif;font-size:18px;line-height:24px;font-weight:600">Total: ${escapeHtml(data.total)}</div>
  </div>`)

export const renderOrderConfirmationEmail = (
  data: OrderConfirmationEmailData,
): EmailContent => {
  const subject = `Order ${data.orderReference} is confirmed`
  const items = data.items
    .map((item) => `<div style="padding-top:12px">${orderItemHtml(item, Boolean(data.hidePrices))}</div>`)
    .join("")
  const reference = infoCard(`
    <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
      <tr><td class="sg-section-title sg-wrap" style="font-family:Montserrat,Arial,sans-serif;font-size:18px;line-height:24px;font-weight:600;color:${colors.ink}">${escapeHtml(data.orderReference)}</td><td class="sg-section-title sg-mobile-value" align="right" style="font-family:Montserrat,Arial,sans-serif;font-size:13px;line-height:20px;font-weight:600;color:${colors.success}">PAID · ${escapeHtml(data.total)}</td></tr>
      <tr><td class="sg-copy sg-secondary" style="padding-top:8px;font-family:Montserrat,Arial,sans-serif;font-size:13px;line-height:20px;color:${colors.secondary}">${escapeHtml(data.orderDate)}</td><td class="sg-copy sg-secondary sg-mobile-value" align="right" style="padding-top:8px;font-family:Montserrat,Arial,sans-serif;font-size:12px;line-height:20px;color:${colors.secondary}">${escapeHtml(data.paymentSummary || "Payment received")}</td></tr>
    </table>`)
  const recipient = infoCard(`
    <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
      <tr>
        <td class="sg-mobile-block" width="55%" valign="top">
          <div class="sg-section-title" style="font-family:Montserrat,Arial,sans-serif;font-size:16px;line-height:24px;font-weight:600;color:${colors.ink}">${escapeHtml(data.recipientName)}</div>
          ${data.recipientPhone ? `<div class="sg-copy sg-secondary" style="padding-top:8px;font-family:Montserrat,Arial,sans-serif;font-size:13px;line-height:21px;color:${colors.secondary}">${escapeHtml(data.recipientPhone)}</div>` : ""}
          <div class="sg-copy sg-secondary" style="padding-top:8px;font-family:Montserrat,Arial,sans-serif;font-size:13px;line-height:21px;color:${colors.secondary}">${addressHtml(data.recipientAddress)}</div>
        </td>
        <td class="sg-mobile-block sg-mobile-left" valign="top" align="right">
          <div class="sg-copy" style="font-family:Montserrat,Arial,sans-serif;font-size:13px;line-height:21px;font-weight:600;color:${colors.ink}">${escapeHtml(data.deliveryMethod)}</div>
          ${data.deliveryDate ? `<div class="sg-copy sg-secondary" style="padding-top:6px;font-family:Montserrat,Arial,sans-serif;font-size:13px;line-height:21px;color:${colors.secondary}">${escapeHtml(data.deliveryDate)}</div>` : ""}
          ${data.giftMessage ? `<div class="sg-eyebrow" style="padding-top:12px;font-family:Montserrat,Arial,sans-serif;font-size:10px;line-height:16px;font-weight:600;color:${colors.sage};text-transform:uppercase">Gift message</div><div class="sg-copy sg-secondary" style="padding-top:6px;font-family:Montserrat,Arial,sans-serif;font-size:12px;line-height:19px;color:${colors.secondary}">${lineBreaks(data.giftMessage)}</div>` : ""}
        </td>
      </tr>
    </table>`, "white")
  const billing = infoCard(`
    <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
      <tr>
        <td class="sg-mobile-block" width="55%" valign="top"><div class="sg-section-title" style="font-family:Montserrat,Arial,sans-serif;font-size:16px;line-height:24px;font-weight:600;color:${colors.ink}">${escapeHtml(data.purchaserName)}</div><div class="sg-copy sg-secondary" style="padding-top:8px;font-family:Montserrat,Arial,sans-serif;font-size:13px;line-height:21px;color:${colors.secondary}">${escapeHtml(data.purchaserEmail)}</div></td>
        <td class="sg-mobile-block sg-mobile-left" valign="top" align="right"><div class="sg-eyebrow" style="font-family:Montserrat,Arial,sans-serif;font-size:10px;line-height:16px;font-weight:600;color:${colors.sage};text-transform:uppercase">Billing address</div><div class="sg-copy sg-secondary" style="padding-top:8px;font-family:Montserrat,Arial,sans-serif;font-size:12px;line-height:19px;color:${colors.secondary}">${addressHtml(data.billingAddress)}</div></td>
      </tr>
    </table>`)
  const progress = infoCard(`
    <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" class="sg-progress" style="width:100%;table-layout:fixed;font-family:Montserrat,Arial,sans-serif;font-size:11px;line-height:18px;text-align:center">
      <tr><td width="25%" style="color:${colors.success};font-weight:600">● Confirmed</td><td width="25%" style="color:${colors.secondary}">○ Prepared</td><td width="25%" style="color:${colors.secondary}">○ On its way</td><td width="25%" style="color:${colors.secondary}">○ Delivered</td></tr>
    </table>`, "white")

  const html = `
    <div class="sg-eyebrow" style="font-family:Montserrat,Arial,sans-serif;font-size:11px;line-height:16px;font-weight:600;letter-spacing:1.4px;color:${colors.sage};text-transform:uppercase">Order confirmed</div>
    <h1 class="sg-title" style="padding-top:16px;font-family:'Cormorant Garamond',Georgia,serif;font-size:32px;line-height:1.2;font-weight:400;color:${colors.ink};margin:0">Thank you for your order</h1>
    <div class="sg-copy" style="padding-top:20px;font-family:Montserrat,Arial,sans-serif;font-size:16px;line-height:24px;font-weight:600;color:${colors.ink}">Hello ${escapeHtml(data.purchaserName)},</div>
    <div class="sg-copy sg-secondary" style="padding-top:5px;font-family:Montserrat,Arial,sans-serif;font-size:14px;line-height:22px;color:${colors.secondary}">Your order is confirmed. We have sent the receipt and updates to ${escapeHtml(data.purchaserEmail)}.</div>
    <div style="padding-top:20px">${reference}</div>
    <h2 class="sg-section-title" style="padding-top:20px;font-family:Montserrat,Arial,sans-serif;font-size:19px;line-height:26px;font-weight:600;color:${colors.ink};margin:0">Your order</h2>
    ${items}
    <div style="padding-top:12px">${totalsHtml(data)}</div>
    <h2 class="sg-section-title" style="padding-top:20px;font-family:Montserrat,Arial,sans-serif;font-size:19px;line-height:26px;font-weight:600;color:${colors.ink};margin:0">Recipient &amp; delivery</h2>
    <div class="sg-copy sg-secondary" style="padding-top:5px;font-family:Montserrat,Arial,sans-serif;font-size:13px;line-height:20px;color:${colors.secondary}">This is where your order is going.</div>
    <div style="padding-top:12px">${recipient}</div>
    <h2 class="sg-section-title" style="padding-top:20px;font-family:Montserrat,Arial,sans-serif;font-size:19px;line-height:26px;font-weight:600;color:${colors.ink};margin:0">Purchaser &amp; billing</h2>
    <div class="sg-copy sg-secondary" style="padding-top:5px;font-family:Montserrat,Arial,sans-serif;font-size:13px;line-height:20px;color:${colors.secondary}">These details belong to the person who placed the order.</div>
    <div style="padding-top:12px">${billing}</div>
    <h2 class="sg-section-title" style="padding-top:20px;font-family:Montserrat,Arial,sans-serif;font-size:19px;line-height:26px;font-weight:600;color:${colors.ink};margin:0">What happens next</h2>
    <div style="padding-top:12px">${progress}</div>
    <div style="padding-top:20px">${emailButton("View or track order", data.orderUrl)}</div>
    <div class="sg-copy sg-secondary" style="padding-top:16px;font-family:Montserrat,Arial,sans-serif;font-size:12px;line-height:19px;color:${colors.secondary};text-align:center">Need help with this order? Reply to this email or contact us and quote ${escapeHtml(data.orderReference)}.</div>
    <div style="height:1px;background:${colors.border};margin-top:24px"></div>
    <div style="padding-top:24px">${emailSignature("formal")}</div>`

  const textItems = data.items
    .map((item) => `${item.title} · ${item.variant || ""} · Quantity ${item.quantity} · ${item.total}`)
    .join("\n")
  return contentResult(
    subject,
    `Hello ${data.purchaserName},\n\nYour order is confirmed.\n\n${data.orderReference}\n${data.orderDate}\n\n${textItems}\n\nSubtotal: ${data.subtotal}\nDelivery: ${data.deliveryTotal}\nTotal: ${data.total}\n\nRecipient: ${data.recipientName}\n${formatAddress(data.recipientAddress).join(", ")}\n\nView or track your order: ${data.orderUrl}\n\n${emailSignatureText("formal")}`,
    html,
    `${data.orderReference} is confirmed. Total ${data.total}.`,
  )
}
