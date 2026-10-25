import { ComponentPropsWithoutRef } from "react"

type BrandTextInputProps = ComponentPropsWithoutRef<"input"> & {
  label: string
}

export default function BrandTextInput({
  label,
  id,
  className = "",
  ...props
}: BrandTextInputProps) {
  const inputId = id ?? `sg-${props.name ?? "input"}`

  return (
    <label className={`sg-brand-input ${className}`.trim()} htmlFor={inputId}>
      <span className="sr-only">{label}</span>
      <input id={inputId} aria-label={label} {...props} />
    </label>
  )
}
