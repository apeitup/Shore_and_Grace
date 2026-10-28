"use client"

import { Check } from "iconoir-react"
import { ChangeEventHandler, useId } from "react"

type MobileCheckboxProps = {
  checked: boolean
  disabled?: boolean
  id?: string
  label: string
  name?: string
  onChange: ChangeEventHandler<HTMLInputElement>
}

export default function MobileCheckbox({
  checked,
  disabled = false,
  id,
  label,
  name,
  onChange,
}: MobileCheckboxProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <label className="sg-mobile-checkbox" htmlFor={inputId}>
      <span className="sg-mobile-checkbox__control">
        <input
          id={inputId}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          name={name}
          onChange={onChange}
        />
        {checked && (
          <span className="sg-mobile-checkbox__indicator" aria-hidden="true">
            <Check />
          </span>
        )}
      </span>
      <span className="sg-mobile-checkbox__label">{label}</span>
    </label>
  )
}
