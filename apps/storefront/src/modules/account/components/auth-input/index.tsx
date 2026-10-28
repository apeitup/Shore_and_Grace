"use client"

import { Eye, EyeClosed, InfoCircle } from "iconoir-react"
import { InputHTMLAttributes, useState } from "react"

type AuthInputProps = InputHTMLAttributes<HTMLInputElement> & {
  helperText?: string
  label: string
}

export default function AuthInput({
  helperText,
  label,
  type = "text",
  ...props
}: AuthInputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === "password"

  return (
    <label className="sg-auth-field">
      <span className="sg-auth-field__label">{label}</span>
      <span className="sg-auth-field__control">
        <input
          {...props}
          type={isPassword && showPassword ? "text" : type}
          className="sg-auth-field__input"
        />
        {isPassword && (
          <button
            className="sg-auth-field__reveal"
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((visible) => !visible)}
          >
            {showPassword ? <EyeClosed /> : <Eye />}
          </button>
        )}
      </span>
      {helperText && (
        <span className="sg-auth-field__helper">
          <InfoCircle aria-hidden="true" />
          {helperText}
        </span>
      )}
    </label>
  )
}
