import { HttpTypes } from "@medusajs/types"
import { Container } from "@modules/common/components/ui"
import Input from "@modules/common/components/input"
import { mapKeys } from "lodash"
import React, { useMemo, useState } from "react"
import AddressSelect from "../address-select"
import CountrySelect from "../country-select"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const ShippingAddress = ({
  customer,
  cart,
  checked,
  onChange,
}: {
  customer: HttpTypes.StoreCustomer | null
  cart: HttpTypes.StoreCart | null
  checked: boolean
  onChange: () => void
}) => {
  const [formData, setFormData] = useState<Record<string, string>>({
    "shipping_address.first_name": cart?.shipping_address?.first_name || "",
    "shipping_address.last_name": cart?.shipping_address?.last_name || "",
    "shipping_address.address_1": cart?.shipping_address?.address_1 || "",
    "shipping_address.address_2": cart?.shipping_address?.address_2 || "",
    "shipping_address.company": cart?.shipping_address?.company || "",
    "shipping_address.postal_code": cart?.shipping_address?.postal_code || "",
    "shipping_address.city": cart?.shipping_address?.city || "",
    "shipping_address.country_code": cart?.shipping_address?.country_code || "",
    "shipping_address.province": cart?.shipping_address?.province || "",
    "shipping_address.phone": cart?.shipping_address?.phone || "",
    email: cart?.email || customer?.email || "",
    purchaser_first_name: customer?.first_name || cart?.billing_address?.first_name || "",
    purchaser_last_name: customer?.last_name || cart?.billing_address?.last_name || "",
    purchaser_phone: cart?.billing_address?.phone || "",
  })

  const countriesInRegion = useMemo(
    () => cart?.region?.countries?.map((c) => c.iso_2),
    [cart?.region]
  )

  // check if customer has saved addresses that are in the current region
  const addressesInRegion = useMemo(
    () =>
      customer?.addresses.filter(
        (a) => a.country_code && countriesInRegion?.includes(a.country_code)
      ),
    [customer?.addresses, countriesInRegion]
  )

  const setFormAddress = (
    address?: HttpTypes.StoreCartAddress,
    email?: string
  ) => {
    if (address) {
      setFormData((prevState: Record<string, string>) => ({
        ...prevState,
        "shipping_address.first_name": address?.first_name || "",
        "shipping_address.last_name": address?.last_name || "",
        "shipping_address.address_1": address?.address_1 || "",
        "shipping_address.address_2": address?.address_2 || "",
        "shipping_address.company": address?.company || "",
        "shipping_address.postal_code": address?.postal_code || "",
        "shipping_address.city": address?.city || "",
        "shipping_address.country_code": address?.country_code || "",
        "shipping_address.province": address?.province || "",
        "shipping_address.phone": address?.phone || "",
      }))
    }

    if (email) {
      setFormData((prevState: Record<string, string>) => ({
        ...prevState,
        email: email,
      }))
    }
  }

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLInputElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <>
      {customer && (addressesInRegion?.length || 0) > 0 && (
        <Container className="mb-6 flex flex-col gap-y-4 p-5">
          <p className="text-small-regular">
            {`Hi ${customer.first_name}, do you want to use one of your saved addresses?`}
          </p>
          <AddressSelect
            addresses={customer.addresses}
            addressInput={
              mapKeys(formData, (_, key) =>
                key.replace("shipping_address.", "")
              ) as unknown as HttpTypes.StoreCartAddress
            }
            onSelect={setFormAddress}
          />
        </Container>
      )}
      <section className="sg-checkout-address-group">
        <h3>Your details</h3>
        <p>Checking out as a guest. Already have an account? <LocalizedClientLink href="/account">Sign in</LocalizedClientLink></p>
        <div className="grid grid-cols-2 gap-4">
        <Input
          label="First name"
          placeholder="First name"
          name="purchaser_first_name"
          autoComplete="section-purchaser billing given-name"
          value={formData.purchaser_first_name}
          onChange={handleChange}
          required
        />
        <Input
          label="Last name"
          placeholder="Last name"
          name="purchaser_last_name"
          autoComplete="section-purchaser billing family-name"
          value={formData.purchaser_last_name}
          onChange={handleChange}
          required
        />
        <Input
          label="Email address"
          placeholder="you@example.com"
          name="email"
          type="email"
          title="Enter a valid email address."
          autoComplete="section-purchaser email"
          value={formData.email}
          onChange={handleChange}
          required
          data-testid="shipping-email-input"
        />
        <Input
          label="Phone number"
          placeholder="07123 456789"
          name="purchaser_phone"
          autoComplete="section-purchaser billing tel"
          value={formData.purchaser_phone}
          onChange={handleChange}
        />
        </div>
      </section>

      <section className="sg-checkout-address-group sg-checkout-recipient-choice">
        <h3>Who are the flowers for?</h3>
        <p>We&apos;ll use this to keep the purchaser and recipient details clear.</p>
        <div>
          <label>
            <input
              type="radio"
              name="recipient_type"
              value="me"
              checked={checked}
              onChange={() => !checked && onChange()}
            />
            Me
          </label>
          <label>
            <input
              type="radio"
              name="recipient_type"
              value="someone_else"
              checked={!checked}
              onChange={() => checked && onChange()}
            />
            Someone else
          </label>
        </div>
        {checked && <input type="hidden" name="same_as_billing" value="on" />}
      </section>

      <section className="sg-checkout-address-group">
        <h3>Recipient &amp; delivery address</h3>
        <p>Enter the address where the flowers should be delivered.</p>
        <div className="grid grid-cols-2 gap-4">
        {checked ? (
          <>
            <input
              type="hidden"
              name="shipping_address.first_name"
              value={formData.purchaser_first_name}
            />
            <input
              type="hidden"
              name="shipping_address.last_name"
              value={formData.purchaser_last_name}
            />
            <input
              type="hidden"
              name="shipping_address.phone"
              value={formData.purchaser_phone}
            />
          </>
        ) : (
          <>
            <Input
              label="Recipient first name"
              placeholder="First name"
              name="shipping_address.first_name"
              autoComplete="section-recipient shipping given-name"
              value={formData["shipping_address.first_name"]}
              onChange={handleChange}
              required
              data-testid="shipping-first-name-input"
            />
            <Input
              label="Recipient last name"
              placeholder="Last name"
              name="shipping_address.last_name"
              autoComplete="section-recipient shipping family-name"
              value={formData["shipping_address.last_name"]}
              onChange={handleChange}
              required
              data-testid="shipping-last-name-input"
            />
            <Input
              label="Recipient phone number"
              placeholder="Used only if delivery is difficult"
              name="shipping_address.phone"
              autoComplete="section-recipient shipping tel"
              value={formData["shipping_address.phone"]}
              onChange={handleChange}
              required
              data-testid="shipping-phone-input"
            />
          </>
        )}
        <Input
          label="Postcode"
          placeholder="e.g. BH14 8HT"
          name="shipping_address.postal_code"
          autoComplete="section-recipient shipping postal-code"
          value={formData["shipping_address.postal_code"]}
          onChange={handleChange}
          required
          data-testid="shipping-postal-code-input"
        />
        <Input
          label="Address line 1"
          placeholder="House number and street"
          name="shipping_address.address_1"
          autoComplete="section-recipient shipping address-line1"
          value={formData["shipping_address.address_1"]}
          onChange={handleChange}
          required
          data-testid="shipping-address-input"
        />
        <Input
          label="Address line 2"
          placeholder="Apartment, suite or unit"
          name="shipping_address.address_2"
          autoComplete="section-recipient shipping address-line2"
          value={formData["shipping_address.address_2"]}
          onChange={handleChange}
        />
        <Input
          label="Town or city"
          placeholder="Town or city"
          name="shipping_address.city"
          autoComplete="section-recipient shipping address-level2"
          value={formData["shipping_address.city"]}
          onChange={handleChange}
          required
          data-testid="shipping-city-input"
        />
        <Input
          label="County"
          placeholder="County"
          name="shipping_address.province"
          autoComplete="section-recipient shipping address-level1"
          value={formData["shipping_address.province"]}
          onChange={handleChange}
          data-testid="shipping-province-input"
        />
        <div className="sg-checkout-country-field">
          <label htmlFor="shipping-country-select">Country *</label>
          <CountrySelect
            id="shipping-country-select"
            name="shipping_address.country_code"
            autoComplete="section-recipient shipping country"
            region={cart?.region}
            value={formData["shipping_address.country_code"]}
            onChange={handleChange}
            required
            data-testid="shipping-country-select"
          />
        </div>
      </div>
      </section>
    </>
  )
}

export default ShippingAddress
