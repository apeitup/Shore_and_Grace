import LocalizedClientLink from "@modules/common/components/localized-client-link"
import clsx from "clsx"
import Image from "next/image"
import {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  MouseEvent as ReactMouseEvent,
  ReactNode,
} from "react"

export type BrandButtonVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "pagination"
  | "icon-only"
  | "icon-labelled"
  | "social"

export type BrandButtonSize = "default" | "small"
export type BrandButtonState = "default" | "hover" | "selected" | "active"

type SharedBrandButtonProps = {
  children?: ReactNode
  className?: string
  disabled?: boolean
  href?: string
  leadingIcon?: ReactNode
  selected?: boolean
  showLeadingIcon?: boolean
  showTrailingIcon?: boolean
  size?: BrandButtonSize
  state?: BrandButtonState
  tone?: "sage" | "ink" | "outline"
  trailingIcon?: ReactNode
  variant?: BrandButtonVariant
}

type NativeBrandButtonProps = SharedBrandButtonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof SharedBrandButtonProps> & {
    href?: undefined
  }

type LinkBrandButtonProps = SharedBrandButtonProps &
  Omit<
    AnchorHTMLAttributes<HTMLAnchorElement>,
    keyof SharedBrandButtonProps | "href"
  > & {
    href: string
  }

export type BrandButtonProps = NativeBrandButtonProps | LinkBrandButtonProps

const iconVariants: BrandButtonVariant[] = [
  "icon-only",
  "icon-labelled",
  "social",
]

export default function BrandButton(props: BrandButtonProps) {
  const {
    children,
    className,
    disabled = false,
    href,
    leadingIcon,
    selected = false,
    showLeadingIcon,
    showTrailingIcon = false,
    size = "default",
    state = "default",
    tone,
    trailingIcon,
    variant: suppliedVariant,
    ...elementProps
  } = props

  const variant =
    suppliedVariant ?? (tone === "outline" ? "secondary" : "primary")
  const visualState = selected ? "selected" : state
  const hasLeadingIcon =
    showLeadingIcon ?? (iconVariants.includes(variant) || Boolean(leadingIcon))
  const hasLabel = variant !== "icon-only" && variant !== "social"
  const isPrimary = variant === "primary"
  const isSmallIcon = size === "small" && variant === "social"

  const defaultLeadingIcon = (
    <Image
      src={
        isSmallIcon
          ? "/assets/brand/buttons/heart-social-small.svg"
          : iconVariants.includes(variant)
          ? "/assets/brand/buttons/heart-icon-dark.svg"
          : isPrimary
          ? "/assets/brand/buttons/heart-text-white.svg"
          : "/assets/brand/buttons/heart-text-dark.svg"
      }
      alt=""
      width={isSmallIcon ? 20.16 : iconVariants.includes(variant) ? 28 : 18}
      height={isSmallIcon ? 20.16 : iconVariants.includes(variant) ? 28 : 18}
    />
  )

  const defaultTrailingIcon = (
    <Image
      src={
        isPrimary
          ? "/assets/brand/buttons/arrow-text-white.svg"
          : "/assets/brand/buttons/arrow-text-dark.svg"
      }
      alt=""
      width={18}
      height={18}
    />
  )

  const content = (
    <>
      {hasLeadingIcon && (
        <span className="sg-brand-button__icon sg-brand-button__icon--leading">
          {leadingIcon ?? defaultLeadingIcon}
        </span>
      )}
      {hasLabel && children !== undefined && (
        <span className="sg-brand-button__label">{children}</span>
      )}
      {showTrailingIcon && (
        <span className="sg-brand-button__icon sg-brand-button__icon--trailing">
          {trailingIcon ?? defaultTrailingIcon}
        </span>
      )}
    </>
  )

  const classes = clsx(
    "sg-brand-button",
    `sg-brand-button--${variant}`,
    `sg-brand-button--${size}`,
    `is-${visualState}`,
    className
  )

  if (href) {
    const { onClick, ...linkProps } =
      elementProps as AnchorHTMLAttributes<HTMLAnchorElement>
    const linkInteractionProps =
      disabled || onClick
        ? {
            onClick: (event: ReactMouseEvent<HTMLAnchorElement>) => {
              if (disabled) {
                event.preventDefault()
                return
              }
              onClick?.(event)
            },
          }
        : {}

    return (
      <LocalizedClientLink
        {...linkProps}
        {...linkInteractionProps}
        href={href}
        className={classes}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : linkProps.tabIndex}
      >
        {content}
      </LocalizedClientLink>
    )
  }

  const buttonProps = elementProps as ButtonHTMLAttributes<HTMLButtonElement>

  return (
    <button
      {...buttonProps}
      type={buttonProps.type ?? "button"}
      className={classes}
      disabled={disabled}
    >
      {content}
    </button>
  )
}
