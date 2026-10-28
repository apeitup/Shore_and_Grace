import { HttpTypes } from "@medusajs/types"
import CountrySelect from "@modules/checkout/components/country-select"
import Input from "@modules/common/components/input"

type AddressFormFieldsProps = {
  region: HttpTypes.StoreRegion
  address?: HttpTypes.StoreCustomerAddress
}

const AddressFormFields = ({ region, address }: AddressFormFieldsProps) => (
  <div className="sg-address-form__fields">
    <div className="sg-address-form__pair">
      <Input
        label="First name"
        name="first_name"
        required
        autoComplete="given-name"
        defaultValue={address?.first_name || undefined}
        data-testid="first-name-input"
      />
      <Input
        label="Last name"
        name="last_name"
        required
        autoComplete="family-name"
        defaultValue={address?.last_name || undefined}
        data-testid="last-name-input"
      />
    </div>
    <div className="sg-address-form__pair">
      <Input
        label="Email address"
        name="email"
        type="email"
        autoComplete="email"
        data-testid="email-input"
      />
      <Input
        label="Phone number"
        name="phone"
        autoComplete="tel"
        defaultValue={address?.phone || undefined}
        data-testid="phone-input"
      />
    </div>
    <div className="sg-address-form__pair">
      <Input
        label="Address line 1"
        name="address_1"
        required
        autoComplete="address-line1"
        defaultValue={address?.address_1 || undefined}
        data-testid="address-1-input"
      />
      <Input
        label="Address line 2"
        name="address_2"
        autoComplete="address-line2"
        defaultValue={address?.address_2 || undefined}
        data-testid="address-2-input"
      />
    </div>
    <div className="sg-address-form__pair">
      <Input
        label="Town or city"
        name="city"
        required
        autoComplete="address-level2"
        defaultValue={address?.city || undefined}
        data-testid="city-input"
      />
      <Input
        label="County"
        name="province"
        autoComplete="address-level1"
        defaultValue={address?.province || undefined}
        data-testid="state-input"
      />
    </div>
    <div className="sg-address-form__pair">
      <Input
        label="Postcode"
        name="postal_code"
        required
        autoComplete="postal-code"
        defaultValue={address?.postal_code || undefined}
        data-testid="postal-code-input"
      />
      <CountrySelect
        label="Country"
        name="country_code"
        region={region}
        required
        autoComplete="country"
        defaultValue={address?.country_code || undefined}
        data-testid="country-select"
      />
    </div>
    <input type="hidden" name="company" value={address?.company || ""} />
  </div>
)

export default AddressFormFields
