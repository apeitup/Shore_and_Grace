"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import React, { ComponentPropsWithoutRef } from "react"

/**
 * Use this component to create a Next.js `<Link />` that persists the current country code in the url,
 * without having to explicitly pass it as a prop.
 */
const LocalizedClientLink = ({
  children,
  href,
  ...props
}: Omit<ComponentPropsWithoutRef<typeof Link>, "href"> & { href: string }) => {
  const { countryCode } = useParams<{ countryCode?: string }>()
  const activeCountryCode = countryCode ?? "gb"

  return (
    <Link href={`/${activeCountryCode}${href}`} {...props}>
      {children}
    </Link>
  )
}

export default LocalizedClientLink
