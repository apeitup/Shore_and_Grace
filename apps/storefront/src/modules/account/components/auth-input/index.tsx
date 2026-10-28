"use client"

import Input from "@modules/common/components/input"
import { InputHTMLAttributes } from "react"

type AuthInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "name"> & {
  helperText?: string
  label: string
  name: string
}

export default function AuthInput({
  helperText,
  label,
  name,
  ...props
}: AuthInputProps) {
  return (
    <Input
      {...props}
      label={label}
      name={name}
      helperText={helperText}
    />
  )
}
