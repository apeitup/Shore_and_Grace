import { Check, NavArrowDown, WarningTriangle } from "iconoir-react"
import { ReactNode, SelectHTMLAttributes, forwardRef, useId } from "react"

export type NativeSelectProps = {
  label?: string
  placeholder?: string
  error?: string
  validated?: boolean
  leadingIcon?: ReactNode
  readOnly?: boolean
  wrapperClassName?: string
} & SelectHTMLAttributes<HTMLSelectElement>

const NativeSelect = forwardRef<HTMLSelectElement, NativeSelectProps>(
  (
    {
      label,
      placeholder,
      error,
      validated = false,
      leadingIcon,
      readOnly = false,
      wrapperClassName = "",
      className = "",
      id,
      children,
      required,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = useId()
    const selectId = id ?? `sg-select-${generatedId.replace(/:/g, "")}`
    const errorId = error ? `${selectId}-error` : undefined

    return (
      <div
        className={`sg-select-field ${wrapperClassName}`.trim()}
        data-error={error ? "true" : undefined}
        data-validated={validated && !error ? "true" : undefined}
        data-read-only={readOnly ? "true" : undefined}
      >
        {label && (
          <label className="sg-select-field__label" htmlFor={selectId}>
            {label}
            {required && <span aria-hidden="true">*</span>}
          </label>
        )}

        <div className="sg-select-field__control">
          {leadingIcon && (
            <span className="sg-select-field__leading" aria-hidden="true">
              {leadingIcon}
            </span>
          )}
          <select
            ref={ref}
            id={selectId}
            className={`sg-select-field__select ${className}`.trim()}
            required={required}
            disabled={disabled || readOnly}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={errorId}
            {...props}
          >
            {placeholder !== undefined && (
              <option disabled value="">
                {placeholder}
              </option>
            )}
            {children}
          </select>
          {validated && !error && (
            <span className="sg-select-field__validated" aria-hidden="true">
              <Check />
            </span>
          )}
          <span className="sg-select-field__chevron" aria-hidden="true">
            <NavArrowDown />
          </span>
        </div>

        {error && (
          <p className="sg-select-field__error" id={errorId}>
            <WarningTriangle aria-hidden="true" />
            {error}
          </p>
        )}
      </div>
    )
  }
)

NativeSelect.displayName = "NativeSelect"

export default NativeSelect
