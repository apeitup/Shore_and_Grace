import type {
  EmailAddress,
  EmailContent,
  EmailSignatureVariant,
} from "./types"

const colors = {
  ink: "#403a34",
  secondary: "#817a73",
  sage: "#78866b",
  success: "#2f9b68",
  linen: "#f2f0ed",
  border: "#d9d6d1",
  white: "#ffffff",
}

export const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")

export const lineBreaks = (value: unknown) =>
  escapeHtml(value).replace(/\r?\n/g, "<br>")

export const formatAddress = (address: EmailAddress) => {
  const name = [address.firstName, address.lastName].filter(Boolean).join(" ")
  const locality = [address.city, address.province].filter(Boolean).join(", ")
  const postalCountry = [address.postalCode, address.country]
    .filter(Boolean)
    .join(" · ")

  return [
    name,
    address.address1,
    address.address2,
    locality,
    postalCountry,
  ].filter((line): line is string => Boolean(line))
}

export const emailDivider = () =>
  `<tr><td style="height:1px;background:${colors.border};font-size:0;line-height:0">&nbsp;</td></tr>`

export const emailButton = (label: string, url: string) => `
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center">
    <tr>
      <td bgcolor="${colors.ink}" style="border-radius:12px;text-align:center">
        <a href="${escapeHtml(url)}" class="sg-button" style="display:inline-block;padding:17px 24px;color:${colors.white};font-family:Montserrat,Arial,sans-serif;font-size:16px;font-weight:600;line-height:16px;letter-spacing:.3px;text-decoration:none;border-radius:12px">${escapeHtml(label)}</a>
      </td>
    </tr>
  </table>`

export const infoCard = (content: string, tone: "linen" | "white" = "linen") => `
  <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background:${tone === "linen" ? colors.linen : colors.white};border:1px solid ${colors.border};border-radius:12px">
    <tr><td class="sg-card" style="padding:16px">${content}</td></tr>
  </table>`

export const emailSignature = (variant: EmailSignatureVariant) => {
  const studio = variant === "formal"
    ? `<br><strong>Shore &amp; Grace</strong><br>Floral &amp; Gift Studio`
    : "<br>Shore &amp; Grace"

  return `<div class="sg-copy" style="font-family:Montserrat,Arial,sans-serif;font-size:14px;line-height:22px;color:${colors.ink}">Warmest regards,<br>Amanda${studio}</div>`
}

export const emailSignatureText = (variant: EmailSignatureVariant) => [
  "Warmest regards,",
  "Amanda",
  "Shore & Grace",
  ...(variant === "formal" ? ["Floral & Gift Studio"] : []),
].join("\n")

type LayoutInput = {
  preheader: string
  content: string
  siteUrl?: string
  unsubscribeUrl?: string
}

export const renderEmailLayout = ({
  preheader,
  content,
  siteUrl = process.env.STOREFRONT_URL || "http://localhost:8000",
  unsubscribeUrl,
}: LayoutInput) => {
  const normalizedSiteUrl = siteUrl.replace(/\/$/, "")
  const year = new Date().getFullYear()
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="x-apple-disable-message-reformatting">
    <title>${escapeHtml(preheader)}</title>
    <style>
      body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
      table,td{mso-table-lspace:0;mso-table-rspace:0}
      table{border-collapse:separate}
      img{-ms-interpolation-mode:bicubic;border:0;height:auto;line-height:100%;outline:none;text-decoration:none}
      body{height:100%!important;margin:0!important;padding:0!important;width:100%!important;background:#f7f6f4;color:${colors.ink}}
      .sg-copy{font-family:Montserrat,Arial,sans-serif;font-size:15px;line-height:24px;color:${colors.ink}}
      .sg-secondary{color:${colors.secondary}}
      .sg-title{font-family:"Cormorant Garamond",Georgia,serif;font-size:32px;line-height:1.2;font-weight:400;color:${colors.ink};margin:0}
      .sg-section-title{font-family:Montserrat,Arial,sans-serif;font-size:19px;line-height:26px;font-weight:600;color:${colors.ink};margin:0}
      .sg-eyebrow{font-family:Montserrat,Arial,sans-serif;font-size:11px;line-height:16px;font-weight:600;letter-spacing:1.4px;color:${colors.sage};text-transform:uppercase}
      .sg-container{width:600px;max-width:600px;table-layout:fixed}
      .sg-content{padding:44px 48px}
      .sg-mobile-stack{display:table-cell}
      .sg-mobile-only{display:none;max-height:0;overflow:hidden;mso-hide:all}
      .sg-wrap{overflow-wrap:anywhere;word-break:break-word}
      .sg-progress{font-family:Montserrat,Arial,sans-serif;font-size:11px;line-height:18px;text-align:center}
      .sg-logo-lockup{position:relative;width:220px;height:70px;margin:0 auto;text-align:left}
      .sg-logo-copy{position:absolute;left:0;top:14px;width:220px;z-index:2}
      .sg-logo-name{font-family:"Cormorant Garamond",Georgia,serif;font-size:30px;line-height:30px;letter-spacing:1.8px}
      .sg-logo-mark{position:absolute;left:-16px;top:0;z-index:1;display:block;width:87px;height:56px}
      @media only screen and (max-width:620px){
        .sg-container{width:100%!important;max-width:100%!important}
        .sg-content,.sg-footer{display:block!important;width:auto!important;box-sizing:border-box!important}
        .sg-content{padding:32px 24px!important}
        .sg-copy,.sg-copy p,.sg-secondary{font-size:16px!important;line-height:24px!important}
        .sg-title,.sg-section-title{font-size:18px!important;line-height:24px!important}
        .sg-eyebrow{font-size:12px!important;line-height:18px!important}
        .sg-progress{font-size:12px!important;line-height:16px!important}
        .sg-card{padding:16px!important}
        .sg-mobile-block{display:block!important;width:100%!important;box-sizing:border-box!important}
        .sg-mobile-block+.sg-mobile-block{padding-top:16px!important}
        .sg-mobile-value{display:block!important;width:100%!important;padding-top:8px!important;text-align:left!important;box-sizing:border-box!important}
        .sg-mobile-hide{display:none!important}
        .sg-desktop-only{display:none!important;max-height:0!important;overflow:hidden!important}
        .sg-mobile-only{display:block!important;max-height:none!important;overflow:visible!important}
        .sg-mobile-left{text-align:left!important}
        .sg-button{display:block!important;font-size:16px!important;line-height:18px!important}
        .sg-product-image{width:100px!important;height:100px!important}
        .sg-footer-copy{font-size:16px!important;line-height:24px!important}
        .sg-logo-lockup{width:220px!important;height:70px!important}
      }
    </style>
  </head>
  <body>
    <div style="display:none;font-size:1px;color:#f7f6f4;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden">${escapeHtml(preheader)}</div>
    <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="#f7f6f4">
      <tr><td align="center" style="padding:20px 0">
        <table role="presentation" class="sg-container" width="600" border="0" cellpadding="0" cellspacing="0" bgcolor="#ffffff" style="width:600px;max-width:600px;background:${colors.white};border-radius:16px;overflow:hidden;box-shadow:0 8px 28px rgba(64,59,51,.12)">
          <tr>
            <td align="center" bgcolor="${colors.sage}" style="padding:25px 10px;color:#fff">
              <a href="${escapeHtml(normalizedSiteUrl)}" style="color:#fff;text-decoration:none">
                <div class="sg-logo-lockup" style="position:relative;width:220px;height:70px;margin:0 auto;text-align:left">
                  <img class="sg-logo-mark" src="${escapeHtml(`${normalizedSiteUrl}/assets/email/header-botanical.png`)}" width="87" height="56" alt="" style="position:absolute;left:-16px;top:0;z-index:1;display:block;width:87px;height:56px">
                  <div class="sg-logo-copy" style="position:absolute;left:0;top:14px;width:220px;z-index:2">
                    <div class="sg-logo-name" style="font-family:'Cormorant Garamond',Georgia,serif;font-size:30px;line-height:30px;font-weight:400;letter-spacing:1.8px;color:#fff;white-space:nowrap">Shore &amp; Grace</div>
                    <div style="font-family:Montserrat,Arial,sans-serif;font-size:9.7px;line-height:16px;font-weight:500;letter-spacing:5.4px;text-transform:uppercase;color:#fff;white-space:nowrap">Floral &amp; Gift Studio</div>
                  </div>
                </div>
              </a>
            </td>
          </tr>
          <tr><td class="sg-content" style="padding:44px 48px">${content}</td></tr>
          <tr><td style="height:18px;background:${colors.white};font-size:0;line-height:0">&nbsp;</td></tr>
          <tr>
            <td class="sg-footer" align="center" bgcolor="${colors.linen}" style="padding:24px 20px">
              <div class="sg-eyebrow" style="font-family:Montserrat,Arial,sans-serif;font-size:11px;line-height:16px;font-weight:600;letter-spacing:1.4px;color:${colors.sage};text-transform:uppercase">Follow us</div>
              <div style="padding:12px 0 10px">
                <a href="https://www.facebook.com/profile.php?id=61594766006657" aria-label="Facebook" style="display:inline-block;width:44px;height:44px;border:1px solid ${colors.sage};border-radius:50%;line-height:44px;text-decoration:none;text-align:center;margin:0 4px"><img src="${escapeHtml(`${normalizedSiteUrl}/assets/email/facebook.png`)}" width="20" height="20" alt="Facebook" style="display:inline-block;width:20px;height:20px;vertical-align:middle"></a>
                <a href="https://www.instagram.com/shore_and_grace" aria-label="Instagram" style="display:inline-block;width:44px;height:44px;border:1px solid ${colors.sage};border-radius:50%;line-height:44px;text-decoration:none;text-align:center;margin:0 4px"><img src="${escapeHtml(`${normalizedSiteUrl}/assets/email/instagram.png`)}" width="20" height="20" alt="Instagram" style="display:inline-block;width:20px;height:20px;vertical-align:middle"></a>
                <a href="https://pin.it/3d5EAgITz" aria-label="Pinterest" style="display:inline-block;width:44px;height:44px;border:1px solid ${colors.sage};border-radius:50%;line-height:44px;text-decoration:none;text-align:center;margin:0 4px"><img src="${escapeHtml(`${normalizedSiteUrl}/assets/email/pinterest.png`)}" width="20" height="20" alt="Pinterest" style="display:inline-block;width:20px;height:20px;vertical-align:middle"></a>
                <a href="https://www.youtube.com/@shoreandgrace" aria-label="YouTube" style="display:inline-block;width:44px;height:44px;border:1px solid ${colors.sage};border-radius:50%;line-height:44px;text-decoration:none;text-align:center;margin:0 4px"><img src="${escapeHtml(`${normalizedSiteUrl}/assets/email/youtube.png`)}" width="20" height="20" alt="YouTube" style="display:inline-block;width:20px;height:20px;vertical-align:middle"></a>
              </div>
              <div class="sg-footer-copy" style="font-family:Montserrat,Arial,sans-serif;font-size:12px;line-height:18px;color:${colors.ink}">contact@shoreandgrace.com</div>
              <div class="sg-footer-copy" style="padding-top:8px;font-family:Montserrat,Arial,sans-serif;font-size:11px;line-height:18px;color:${colors.secondary}">© ${year} Shore &amp; Grace. All rights reserved.</div>
              <div class="sg-footer-copy" style="font-family:Montserrat,Arial,sans-serif;font-size:11px;line-height:18px;color:${colors.secondary}">${unsubscribeUrl ? `<a href="${escapeHtml(unsubscribeUrl)}" style="color:${colors.secondary}">Unsubscribe</a> &nbsp;·&nbsp; ` : ""}<a href="${escapeHtml(`${normalizedSiteUrl}/privacy`)}" style="color:${colors.secondary}">Privacy policy</a> &nbsp;·&nbsp; <a href="${escapeHtml(`${normalizedSiteUrl}/cookies`)}" style="color:${colors.secondary}">Cookie policy</a></div>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`
}

export const contentResult = (
  subject: string,
  text: string,
  htmlContent: string,
  preheader = subject,
): EmailContent => ({
  subject,
  text,
  html: renderEmailLayout({ preheader, content: htmlContent }),
})

export { colors }
