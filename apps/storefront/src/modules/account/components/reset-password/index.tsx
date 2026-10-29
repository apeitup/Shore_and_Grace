"use client"

import {
  completePasswordReset,
  requestPasswordReset,
} from "@lib/data/customer"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ErrorMessage from "@modules/checkout/components/error-message"
import { useSearchParams } from "next/navigation"
import { useActionState } from "react"

import AuthInput from "../auth-input"
import AuthSubmitButton from "../auth-submit-button"

export default function ResetPassword() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const action = token ? completePasswordReset : requestPasswordReset
  const [message, formAction] = useActionState(action, null)

  if (message?.state === "success") {
    return (
      <section className="sg-auth-panel" data-testid="reset-password-success">
        <div className="sg-auth-panel__intro">
          <h2>Password updated</h2>
          <p>Your new password is ready. You can now sign in.</p>
        </div>
        <LocalizedClientLink className="sg-brand-button sg-brand-button--primary sg-auth-submit" href="/account">
          Sign in
        </LocalizedClientLink>
      </section>
    )
  }

  if (message?.state === "requested") {
    return (
      <section className="sg-auth-panel" data-testid="reset-password-requested">
        <div className="sg-auth-panel__intro">
          <h2>Check your email</h2>
          <p>
            If an account exists for that address, we have sent a secure reset
            link. The link expires after 15 minutes.
          </p>
        </div>
        <LocalizedClientLink className="sg-auth-forgot" href="/account">
          Back to sign in
        </LocalizedClientLink>
      </section>
    )
  }

  return (
    <section className="sg-auth-panel" data-testid="reset-password-page">
      <div className="sg-auth-panel__intro">
        <h2>{token ? "Choose a new password" : "Reset your password"}</h2>
        <p>
          {token
            ? "Enter a new password for your Shore & Grace account."
            : "Enter your account email and we will send you a secure reset link."}
        </p>
      </div>

      <form className="sg-auth-form" action={formAction}>
        {token ? (
          <>
            <input name="token" type="hidden" value={token} />
            <AuthInput
              autoComplete="new-password"
              label="New password"
              minLength={8}
              name="password"
              placeholder="Enter your new password"
              required
              type="password"
            />
            <AuthInput
              autoComplete="new-password"
              label="Confirm new password"
              minLength={8}
              name="password_confirmation"
              placeholder="Enter your new password again"
              required
              type="password"
            />
          </>
        ) : (
          <AuthInput
            autoComplete="email"
            label="Email address"
            name="email"
            placeholder="Enter your email address"
            required
            type="email"
          />
        )}

        <ErrorMessage
          error={message?.state === "error" ? message.error : null}
          data-testid="reset-password-error"
        />
        <AuthSubmitButton testId="reset-password-button">
          {token ? "Save new password" : "Send reset link"}
        </AuthSubmitButton>
      </form>

      <p className="sg-auth-switch">
        Remembered your password?{" "}
        <LocalizedClientLink href="/account">Sign in</LocalizedClientLink>
      </p>
    </section>
  )
}
