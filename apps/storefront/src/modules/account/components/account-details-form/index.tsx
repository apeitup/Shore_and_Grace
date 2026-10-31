"use client"

import {
  type PasswordResetState,
  requestAccountPasswordChange,
  updateCustomer,
} from "@lib/data/customer"
import { HttpTypes } from "@medusajs/types"
import BrandButton from "@modules/brand/components/button"
import Input from "@modules/common/components/input"
import { useActionState, useState, useTransition } from "react"
import { useFormStatus } from "react-dom"

type State = { success: boolean; error: string | null }

const initialState: State = { success: false, error: null }

function SaveButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus()

  return (
    <BrandButton type="submit" disabled={disabled || pending}>
      {pending ? "Saving…" : "Save changes"}
    </BrandButton>
  )
}

export default function AccountDetailsForm({
  customer,
}: {
  customer: HttpTypes.StoreCustomer
}) {
  const [isDirty, setIsDirty] = useState(false)
  const [passwordState, setPasswordState] =
    useState<PasswordResetState>(null)
  const [passwordPending, startPasswordTransition] = useTransition()

  const save = async (_state: State, formData: FormData): Promise<State> => {
    try {
      await updateCustomer({
        first_name: String(formData.get("first_name") || ""),
        last_name: String(formData.get("last_name") || ""),
        phone: String(formData.get("phone") || ""),
      })

      setIsDirty(false)
      return { success: true, error: null }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  const [state, action] = useActionState(save, initialState)

  const requestPasswordChange = () => {
    startPasswordTransition(async () => {
      const result = await requestAccountPasswordChange()

      setPasswordState(result)
    })
  }

  return (
    <form
      className="sg-account-panel sg-account-details"
      action={action}
      onChange={() => setIsDirty(true)}
    >
      <header className="sg-account-panel__header">
        <div>
          <h1>Account details</h1>
          <p>Manage your personal information</p>
        </div>
      </header>
      <div className="sg-account-details__body">
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
            required
            readOnly
            autoComplete="email"
          />
          <Input
            label="Phone number"
            name="phone"
            defaultValue={customer.phone || ""}
            autoComplete="tel"
          />
        </div>
        <div aria-live="polite">
          {state.success && (
            <p className="sg-form-message sg-form-message--success">
              Your account details have been updated.
            </p>
          )}
          {state.error && (
            <p className="sg-form-message sg-form-message--error">
              {state.error}
            </p>
          )}
        </div>
        <div className="sg-account-details__actions">
          <SaveButton disabled={!isDirty} />
        </div>
        <section
          className="sg-account-password"
          aria-labelledby="password-heading"
        >
          <div>
            <h2 id="password-heading">Password</h2>
            <p>
              We will email a secure password-change link to {customer.email}.
              The link expires after 15 minutes.
            </p>
          </div>
          <BrandButton
            type="button"
            variant="secondary"
            disabled={passwordPending}
            onClick={requestPasswordChange}
          >
            {passwordPending
              ? "Sending…"
              : passwordState?.state === "requested"
                ? "Send another email"
                : "Change password"}
          </BrandButton>
        </section>
        <div aria-live="polite">
          {passwordState?.state === "requested" && (
            <p className="sg-form-message sg-form-message--success">
              Check your inbox for your secure password-change link.
            </p>
          )}
          {passwordState?.state === "error" && (
            <p className="sg-form-message sg-form-message--error">
              {passwordState.error}
            </p>
          )}
        </div>
      </div>
    </form>
  )
}
