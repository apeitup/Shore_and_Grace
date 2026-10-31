"use client"

import Link from "next/link"
import React, { ComponentPropsWithoutRef } from "react"

/**
 * The UK-only storefront keeps region routing internal, so public links remain
 * clean and unprefixed.
 */
const LocalizedClientLink = ({
  children,
  href,
  ...props
}: Omit<ComponentPropsWithoutRef<typeof Link>, "href"> & { href: string }) => {
  return (
    <Link href={href} {...props}>
      {children}
    </Link>
  )
}

export default LocalizedClientLink
