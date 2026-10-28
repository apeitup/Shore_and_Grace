import assert from "node:assert/strict"
import test from "node:test"

import {
  buildCheckoutPartyData,
  getOrderPurchaserFirstName,
} from "../src/lib/util/checkout-parties.ts"

const checkoutForm = ({
  purchaser = "Troy",
  recipient = "Amanda",
  forPurchaser = false,
} = {}) => {
  const form = new FormData()
  form.set("purchaser_first_name", purchaser)
  form.set("purchaser_last_name", "Halliday")
  form.set("purchaser_phone", "07000000001")
  form.set("email", "purchaser@example.com")
  form.set("shipping_address.first_name", forPurchaser ? purchaser : recipient)
  form.set("shipping_address.last_name", forPurchaser ? "Halliday" : "Recipient")
  form.set("shipping_address.phone", "07000000002")
  form.set("shipping_address.address_1", "1 Test Street")
  form.set("shipping_address.postal_code", "SW1A 1AA")
  form.set("shipping_address.city", "London")
  form.set("shipping_address.country_code", "gb")
  if (forPurchaser) form.set("same_as_billing", "on")
  return form
}

test("gift checkout keeps purchaser and recipient names separate", () => {
  const data = buildCheckoutPartyData(checkoutForm())

  assert.equal(data.billing_address?.first_name, "Troy")
  assert.equal(data.shipping_address?.first_name, "Amanda")
  assert.equal(data.email, "purchaser@example.com")
  assert.deepEqual(data.additional_data, {
    purchaser_first_name: "Troy",
    purchaser_last_name: "Halliday",
    purchaser_phone: "07000000001",
  })
})

test("self checkout uses purchaser details for billing and delivery", () => {
  const data = buildCheckoutPartyData(
    checkoutForm({ purchaser: "Troy", forPurchaser: true })
  )

  assert.equal(data.billing_address?.first_name, "Troy")
  assert.equal(data.shipping_address?.first_name, "Troy")
})

test("gift confirmation thanks the purchaser rather than the recipient", () => {
  assert.equal(
    getOrderPurchaserFirstName({
      billing_address: { first_name: "Troy" },
      shipping_address: { first_name: "Amanda" },
    }),
    "Troy"
  )
})

test("account name takes precedence over the billing name", () => {
  assert.equal(
    getOrderPurchaserFirstName({
      billing_address: { first_name: "Billing name" },
      shipping_address: { first_name: "Amanda" },
      customer: { first_name: "Troy" },
    }),
    "Troy"
  )
})

test("recipient name is never used as the purchaser fallback", () => {
  assert.equal(
    getOrderPurchaserFirstName({
      billing_address: null,
      shipping_address: { first_name: "Amanda" },
    }),
    null
  )
})

test("confirmation handles an order with no available purchaser name", () => {
  assert.equal(
    getOrderPurchaserFirstName({
      billing_address: { first_name: "  " },
      shipping_address: null,
      customer: { first_name: "  " },
    }),
    null
  )
})
