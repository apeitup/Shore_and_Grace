import {
  renderAccountWelcomeEmail,
  renderContactAcknowledgementEmail,
  renderDeliveryDelayedEmail,
  renderEmailVerificationEmail,
  renderNewsletterConfirmationEmail,
  renderOrderConfirmationEmail,
  renderOrderDispatchedEmail,
  renderOrderDeliveredEmail,
  renderPasswordResetEmail,
  renderPrivacyRequestReceivedEmail,
} from ".."

describe("Shore & Grace email templates", () => {
  it("renders the contact acknowledgement with branded responsive typography", () => {
    const email = renderContactAcknowledgementEmail({
      name: "Troy <Halliday>",
      reference: "SG-C-20261029-D57C65",
    })

    expect(email.subject).toContain("SG-C-20261029-D57C65")
    expect(email.text).toContain("within two working days")
    expect(email.html).toContain("Shore &amp; Grace")
    expect(email.html).toContain("font-size:16px!important")
    expect(email.html).toContain("font-size:18px!important")
    expect(email.html).toContain("font-size:12px!important")
    expect(email.html).toContain("Troy &lt;Halliday&gt;")
    expect(email.html).not.toContain("Troy <Halliday>")
    expect(email.html).toContain("/assets/email/header-botanical.png")
    expect(email.html).toContain("class=\"sg-logo-lockup\"")
    expect(email.html).toContain("/assets/email/facebook.png")
    expect(email.html).toContain("alt=\"Instagram\"")
    expect(email.html).not.toContain(">ig</a>")
  })

  it("keeps purchaser and recipient details separate in an order confirmation", () => {
    const email = renderOrderConfirmationEmail({
      purchaserName: "Troy Halliday",
      purchaserEmail: "troy@example.com",
      orderReference: "SG-42",
      orderDate: "29 October 2026",
      subtotal: "£80.00",
      deliveryTotal: "£5.00",
      total: "£85.00",
      items: [
        {
          title: "Pearly Everlasting",
          variant: "Medium · White",
          quantity: 1,
          unitPrice: "£80.00",
          total: "£80.00",
          imageUrl: "https://example.com/flowers.jpg",
        },
      ],
      recipientName: "Amanda Speller",
      recipientPhone: "07754 870498",
      recipientAddress: {
        address1: "303 Walton Road",
        city: "Walton-on-the-Naze",
        postalCode: "CO14 8LS",
        country: "United Kingdom",
      },
      deliveryMethod: "Hand delivery",
      deliveryDate: "31 October 2026",
      giftMessage: "With love",
      billingAddress: {
        firstName: "Troy",
        lastName: "Halliday",
        address1: "303 Walton Road",
        city: "Walton-on-the-Naze",
        postalCode: "CO14 8LS",
        country: "United Kingdom",
      },
      orderUrl: "https://shoreandgrace.com/gb/order/SG-42",
    })

    expect(email.subject).toBe("Order SG-42 is confirmed")
    expect(email.html).toContain("Amanda Speller")
    expect(email.html).toContain("Troy Halliday")
    expect(email.html).toContain("Pearly Everlasting")
    expect(email.html).toContain("This is where your order is going.")
    expect(email.html).toContain("border-top:1px solid #d9d6d1")
    expect(email.html).not.toContain(
      'colspan="2" style="height:1px;background:#d9d6d1',
    )
    expect(email.text).toContain("Warmest regards,\nAmanda\nShore & Grace\nFloral & Gift Studio")
    expect(email.html).toContain("font-size:16px!important")
    expect(email.text).toContain("View or track your order")
  })

  it("renders the reusable transactional catalogue", () => {
    const templates = [
      renderAccountWelcomeEmail({
        recipientName: "Amanda",
        actionUrl: "https://shoreandgrace.com/gb/account",
      }),
      renderPasswordResetEmail({
        recipientName: "Amanda",
        actionUrl: "https://shoreandgrace.com/gb/reset-password",
      }),
      renderOrderDeliveredEmail({
        recipientName: "Amanda",
        orderReference: "SG-42",
        actionUrl: "https://shoreandgrace.com/gb/order/SG-42",
      }),
    ]

    templates.forEach((email) => {
      expect(email.subject).toBeTruthy()
      expect(email.text).toContain("Amanda")
      expect(email.html).toContain("<!doctype html>")
      expect(email.html).toContain("Shore &amp; Grace")
    })
  })

  it("uses the requested formal and informal signature variants", () => {
    const formal = [
      renderAccountWelcomeEmail({ recipientName: "Amanda" }),
      renderDeliveryDelayedEmail({ recipientName: "Amanda" }),
      renderNewsletterConfirmationEmail({ recipientName: "Amanda" }),
    ]
    const informal = [
      renderEmailVerificationEmail({ recipientName: "Amanda" }),
      renderPasswordResetEmail({ recipientName: "Amanda" }),
      renderPrivacyRequestReceivedEmail({ recipientName: "Amanda" }),
    ]

    formal.forEach((email) => {
      expect(email.text).toContain("Warmest regards,\nAmanda\nShore & Grace\nFloral & Gift Studio")
    })
    informal.forEach((email) => {
      expect(email.text).toContain("Warmest regards,\nAmanda\nShore & Grace")
      expect(email.text).not.toContain("Floral & Gift Studio")
    })
  })

  it("uses the approved dispatched and delivered wording", () => {
    const dispatched = renderOrderDispatchedEmail({
      recipientName: "Amanda",
      orderReference: "SG-42",
    })
    const delivered = renderOrderDeliveredEmail({
      recipientName: "Amanda",
      orderReference: "SG-42",
    })

    expect(dispatched.text).toContain("Your order has left the studio and is on its way to the recipient.")
    expect(dispatched.text).not.toContain("Your flowers have left")
    expect(delivered.html).toContain("Your order has arrived")
    expect(delivered.html).not.toContain("Your flowers have arrived")
  })
})
