"use client"

import { login } from "@lib/data/customer"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { useActionState } from "react"

import AuthInput from "../auth-input"
import AuthSubmitButton from "../auth-submit-button"
import SocialAuthButtons from "../social-auth-buttons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type Props = { setCurrentView: (view: LOGIN_VIEW) => void }

const Login = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(login, null)

  return (
    <section className="sg-auth-panel" data-testid="login-page">
      <div className="sg-auth-panel__intro">
        <h2>Sign in</h2>
      </div>
      <SocialAuthButtons />
      <div className="sg-auth-divider" aria-hidden="true">
        <span />
        <p>Or continue with email</p>
        <span />
      </div>

      {message?.state === "verification_required" && (
        <div
          className="sg-auth-notice"
          data-testid="login-verification-message"
        >
          We sent a verification link to <strong>{message.email}</strong>.
          Please verify your email, then sign in.
        </div>
      )}

      <form className="sg-auth-form" action={formAction}>
        <AuthInput
          label="Email address"
          name="email"
          type="email"
          placeholder="Enter your email address"
          title="Enter a valid email address."
          autoComplete="email"
          required
          data-testid="email-input"
        />
        <AuthInput
          label="Password"
          name="password"
          type="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          required
          data-testid="password-input"
        />

        <div className="sg-auth-options">
          <label className="sg-auth-checkbox">
            <input type="checkbox" name="remember_me" value="true" />
            <span>Remember me</span>
          </label>
          <LocalizedClientLink
            className="sg-auth-forgot"
            href="/reset-password"
          >
            Forgot password?
          </LocalizedClientLink>
        </div>

        <ErrorMessage
          error={message?.state === "error" ? message.error : null}
          data-testid="login-error-message"
        />
        <AuthSubmitButton testId="sign-in-button">Sign in</AuthSubmitButton>
      </form>

      <p className="sg-auth-switch">
        Don&apos;t have an account?{" "}
        <button
          type="button"
          onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
          data-testid="register-button"
        >
          Sign up
        </button>
      </p>
    </section>
  )
}

export default Login
