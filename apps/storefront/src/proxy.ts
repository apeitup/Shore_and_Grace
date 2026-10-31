import { HttpTypes } from "@medusajs/types"
import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
const DEFAULT_REGION = (
  process.env.NEXT_PUBLIC_DEFAULT_REGION || "gb"
).toLowerCase()

const regionMapCache = {
  regionMap: new Map<string, HttpTypes.StoreRegion>(),
  regionMapUpdated: Date.now(),
}

async function getRegionMap() {
  const { regionMap, regionMapUpdated } = regionMapCache

  if (!BACKEND_URL) {
    throw new Error(
      "Proxy.ts: Error fetching regions. Did you set up regions in your Medusa Admin and define a NEXT_PUBLIC_MEDUSA_BACKEND_URL environment variable."
    )
  }

  if (
    !regionMap.keys().next().value ||
    regionMapUpdated < Date.now() - 3600 * 1000
  ) {
    const response = await fetch(`${BACKEND_URL}/store/regions`, {
      method: "GET",
      headers: {
        "x-publishable-api-key": PUBLISHABLE_API_KEY!,
      },
    })

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`)
    }

    const { regions } = await response.json()

    if (!regions?.length) {
      return new Map<string, HttpTypes.StoreRegion>()
    }

    regions.forEach((region: HttpTypes.StoreRegion) => {
      region.countries?.forEach((country) => {
        regionMapCache.regionMap.set(country.iso_2?.toLowerCase() ?? "", region)
      })
    })

    regionMapCache.regionMapUpdated = Date.now()
  }

  return regionMapCache.regionMap
}

function withCacheId(response: NextResponse, cacheId: string, hasCookie: boolean) {
  if (!hasCookie) {
    response.cookies.set("_medusa_cache_id", cacheId, {
      maxAge: 60 * 60 * 24,
    })
  }

  return response
}

/**
 * The store only serves the UK. Public URLs therefore stay unprefixed, while
 * requests are rewritten internally to the starter's country-code route tree.
 */
export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.includes(".")) {
    return NextResponse.next()
  }

  const cacheIdCookie = request.cookies.get("_medusa_cache_id")
  const cacheId = cacheIdCookie?.value || crypto.randomUUID()
  const regionMap = await getRegionMap()
  const country = regionMap.has(DEFAULT_REGION)
    ? DEFAULT_REGION
    : regionMap.keys().next().value || DEFAULT_REGION

  const publicUrl = request.nextUrl.clone()
  const segments = publicUrl.pathname.split("/").filter(Boolean)
  const firstSegment = segments[0]?.toLowerCase()

  // Preserve old bookmarks without keeping the regional prefix canonical.
  if (firstSegment && regionMap.has(firstSegment)) {
    publicUrl.pathname = `/${segments.slice(1).join("/")}`
    return withCacheId(
      NextResponse.redirect(publicUrl, 308),
      cacheId,
      Boolean(cacheIdCookie)
    )
  }

  const internalUrl = request.nextUrl.clone()
  internalUrl.pathname = `/${country}${
    request.nextUrl.pathname === "/" ? "" : request.nextUrl.pathname
  }`

  return withCacheId(
    NextResponse.rewrite(internalUrl),
    cacheId,
    Boolean(cacheIdCookie)
  )
}

export const config = {
  matcher: [
    "/((?!api|medusa|ucp|buy|_next/static|_next/image|favicon.ico|images|assets|png|svg|jpg|jpeg|gif|webp).*)",
  ],
}
