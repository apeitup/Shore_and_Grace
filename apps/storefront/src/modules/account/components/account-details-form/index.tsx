"use client"

import { updateCustomer } from "@lib/data/customer"
import { HttpTypes } from "@medusajs/types"
import Input from "@modules/common/components/input"
import NativeSelect from "@modules/common/components/native-select"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"

type State = { success: boolean; error: string | null }

const initialState: State = { success: false, error: null }

function SaveButton() {
  const { pending } = useFormStatus()
  return <button className="sg-brand-button" type="submit" disabled={pending}>{pending ? "Saving…" : "Save changes"}</button>
}

export default function AccountDetailsForm({ customer }: { customer: HttpTypes.StoreCustomer }) {
  const billing = customer.addresses?.find((address) => address.is_default_billing)

  const save = async (_state: State, formData: FormData): Promise<State> => {
    try {
      await updateCustomer({
        first_name: String(formData.get("first_name") || ""),
        last_name: String(formData.get("last_name") || ""),
        phone: String(formData.get("phone") || ""),
      })
      return { success: true, error: null }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  const [state, action] = useActionState(save, initialState)
  const billingLabel = billing
    ? `${billing.address_1}, ${billing.city}, ${billing.province || ""}, ${billing.postal_code}`
    : "No billing address saved"

  return (
    <form className="sg-account-panel sg-account-details" action={action}>
      <header className="sg-account-panel__header">
        <div><h1>Account details</h1><p>Manage your personal information</p></div>
        <SaveButton />
      </header>
      <div className="sg-account-form-grid">
        <Input
          label="First name"
          name="first_name"
          defaultValue={customer.first_name || ""}
          required
          autoComplete="given-name"
        />
        <Input
          label="Last name"
          name="last_name"
          defaultValue={customer.last_name || ""}
          required
          autoComplete="family-name"
        />
        <Input
          label="Email address"
          name="email"
          value={customer.email}
          readOnly
          autoComplete="email"
        />
        <Input
          label="Phone number"
          name="phone"
          defaultValue={customer.phone || ""}
          autoComplete="tel"
        />
        <NativeSelect
          label="Billing address"
          wrapperClassName="sg-account-form-grid__wide"
          defaultValue={billing?.id || ""}
          readOnly
        >
          <option value={billing?.id || ""}>
            Billing address - {billingLabel}
          </option>
        </NativeSelect>
      </div>
      {state.success && <p className="sg-form-message sg-form-message--success">Your account details have been updated.</p>}
      {state.error && <p className="sg-form-message sg-form-message--error">{state.error}</p>}
    </form>
  )
}
