"use client"

import BrandButton from "@modules/brand/components/button"
import { RefreshDouble } from "iconoir-react"
import type { ReactNode } from "react"
import { useFormStatus } from "react-dom"

type AuthSubmitButtonProps = { children: ReactNode; testId: string }

export default function AuthSubmitButton({
  children,
  testId,
}: AuthSubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <BrandButton
      className="sg-auth-submit"
      data-testid={testId}
      disabled={pending}
      type="submit"
      variant="primary"
      leadingIcon={
        pending ? <RefreshDouble className="sg-auth-spinner" /> : null
      }
      showLeadingIcon={pending}
    >
      {pending ? "Please wait" : children}
    </BrandButton>
  )
}
