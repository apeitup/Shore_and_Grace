import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ComponentPropsWithoutRef, ReactNode } from "react"

type BrandButtonProps = {
  children: ReactNode
  href?: string
  tone?: "sage" | "ink" | "outline"
} & ComponentPropsWithoutRef<"button">

export default function BrandButton({
  children,
  href,
  tone = "sage",
  className = "",
  ...buttonProps
}: BrandButtonProps) {
  const classes = `sg-brand-button sg-brand-button--${tone} ${className}`.trim()

  if (href) {
    return (
      <LocalizedClientLink href={href} className={classes}>
        {children}
      </LocalizedClientLink>
    )
  }

  return (
    <button className={classes} {...buttonProps}>
      {children}
    </button>
  )
}
