"use client"

import { signup } from "@lib/data/customer"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ErrorMessage from "@modules/checkout/components/error-message"
import { useActionState } from "react"

import { LOGIN_VIEW } from "../../templates/login-template"
import AuthInput from "../auth-input"
import AuthSubmitButton from "../auth-submit-button"
import SocialAuthButtons from "../social-auth-buttons"

type Props = { setCurrentView: (view: LOGIN_VIEW) => void }

const Register = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(signup, null)

  return (
    <section className="sg-auth-panel" data-testid="register-page">
      <div className="sg-auth-panel__intro">
        <h2>Create your account</h2>
        <p>Join Shore &amp; Grace for a more personal shopping experience.</p>
      </div>
      <SocialAuthButtons />
      <div className="sg-auth-divider" aria-hidden="true">
        <span />
        <p>Or sign up with email</p>
        <span />
      </div>

      {message?.state === "verification_required" && (
        <div
          className="sg-auth-notice"
          data-testid="register-verification-message"
        >
          We sent a verification link to <strong>{message.email}</strong>.
          Please check your inbox to verify your email, then sign in.
        </div>
      )}

      <form className="sg-auth-form" action={formAction}>
        <div className="sg-auth-name-row">
          <AuthInput
            label="First name"
            name="first_name"
            placeholder="First name"
            required
            autoComplete="given-name"
            data-testid="first-name-input"
          />
          <AuthInput
            label="Last name"
            name="last_name"
            placeholder="Last name"
            required
            autoComplete="family-name"
            data-testid="last-name-input"
          />
        </div>
        <AuthInput
          label="Email address"
          name="email"
          placeholder="Enter your email address"
          required
          type="email"
          autoComplete="email"
          data-testid="email-input"
        />
        <AuthInput
          label="Password"
          name="password"
          placeholder="Create a password"
          required
          type="password"
          minLength={12}
          autoComplete="new-password"
          helperText="Must be at least 12 characters"
          data-testid="password-input"
        />

        <label className="sg-auth-marketing">
          <input type="checkbox" name="accepts_marketing" value="true" />
          <span>
            <strong>Keep me in the loop</strong>
            <span>
              Receive thoughtful updates, seasonal inspiration and first access
              to new collections.
            </span>
          </span>
        </label>

        <ErrorMessage
          error={message?.state === "error" ? message.error : null}
          data-testid="register-error"
        />
        <AuthSubmitButton testId="register-submit-button">
          Create account
        </AuthSubmitButton>
        <p className="sg-auth-terms">
          By creating an account, you agree to our{" "}
          <LocalizedClientLink href="/terms">
            Terms &amp; Conditions
          </LocalizedClientLink>{" "}
          and{" "}
          <LocalizedClientLink href="/privacy">
            Privacy Policy
          </LocalizedClientLink>
          .
        </p>
      </form>

      <p className="sg-auth-switch">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
        >
          Sign in
        </button>
      </p>
    </section>
  )
}

export default Register
