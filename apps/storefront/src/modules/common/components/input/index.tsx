"use client"

import {
  Check,
  Eye,
  EyeClosed,
  InfoCircle,
  WarningTriangle,
} from "iconoir-react"
import React, {
  ReactNode,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from "react"

type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> & {
  label: string
  name: string
  errors?: Record<string, unknown>
  touched?: Record<string, unknown>
  error?: string
  helperText?: string
  validated?: boolean
  leadingIcon?: ReactNode
  trailingIcon?: ReactNode
  wrapperClassName?: string
  topLabel?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type = "text",
      id,
      name,
      label,
      errors,
      touched,
      error,
      helperText,
      validated = false,
      leadingIcon,
      trailingIcon,
      wrapperClassName = "",
      topLabel,
      required,
      disabled,
      readOnly,
      className = "",
      "aria-describedby": ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    const generatedId = useId()
    const inputRef = useRef<HTMLInputElement>(null)
    const [showPassword, setShowPassword] = useState(false)
    const inputId = id ?? `sg-input-${generatedId.replace(/:/g, "")}`
    const labelText = topLabel ?? label
    const fieldError = errors?.[name]
    const wasTouched = touched ? Boolean(touched[name]) : true
    const resolvedError =
      error ?? (wasTouched && typeof fieldError === "string" ? fieldError : undefined)
    const errorId = resolvedError ? `${inputId}-error` : undefined
    const helperId = helperText && !resolvedError ? `${inputId}-helper` : undefined
    const describedBy =
      [ariaDescribedBy, errorId, helperId].filter(Boolean).join(" ") || undefined
    const inputType = type === "password" && showPassword ? "text" : type

    useImperativeHandle(ref, () => inputRef.current!)

    return (
      <div
        className={`sg-input-field ${wrapperClassName}`.trim()}
        data-error={resolvedError ? "true" : undefined}
        data-validated={validated && !resolvedError ? "true" : undefined}
        data-read-only={readOnly ? "true" : undefined}
      >
        <label className="sg-input-field__label" htmlFor={inputId}>
          {labelText}
          {required && <span aria-hidden="true">*</span>}
        </label>

        <div className="sg-input-field__control">
          {leadingIcon && (
            <span className="sg-input-field__leading" aria-hidden="true">
              {leadingIcon}
            </span>
          )}
          <input
            {...props}
            ref={inputRef}
            id={inputId}
            name={name}
            type={inputType}
            required={required}
            disabled={disabled}
            readOnly={readOnly}
            className={`sg-input-field__input ${className}`.trim()}
            aria-invalid={resolvedError ? "true" : undefined}
            aria-describedby={describedBy}
          />
          {validated && !resolvedError && (
            <span className="sg-input-field__validated" aria-hidden="true">
              <Check />
            </span>
          )}
          {trailingIcon && !validated && (
            <span className="sg-input-field__trailing" aria-hidden="true">
              {trailingIcon}
            </span>
          )}
          {type === "password" && (
            <button
              type="button"
              className="sg-input-field__action"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((visible) => !visible)}
            >
              {showPassword ? <EyeClosed /> : <Eye />}
            </button>
          )}
        </div>

        {resolvedError && (
          <p className="sg-input-field__error" id={errorId}>
            <WarningTriangle aria-hidden="true" />
            {resolvedError}
          </p>
        )}
        {helperText && !resolvedError && (
          <p className="sg-input-field__helper" id={helperId}>
            <InfoCircle aria-hidden="true" />
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"

export default Input
