const checkEnvVariables = require("./check-env-variables")
const { networkInterfaces } = require("node:os")

checkEnvVariables()

/**
 * Medusa Cloud-related environment variables
 */
const S3_HOSTNAME = process.env.MEDUSA_CLOUD_S3_HOSTNAME
const S3_PATHNAME = process.env.MEDUSA_CLOUD_S3_PATHNAME
const MEDUSA_BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || "gb"
const LOCAL_DEV_ORIGINS = [
  ...new Set(
    Object.values(networkInterfaces())
      .flatMap((network) => network || [])
      .filter(({ family, internal }) => family === "IPv4" && !internal)
      .map(({ address }) => address)
  ),
]

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: LOCAL_DEV_ORIGINS,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [{ key: "Link", value: '</.well-known/ucp>; rel="ucp"' }],
      },
      {
        source: "/products/:handle",
        headers: [{ key: "Vary", value: "Accept" }],
      },
    ]
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/medusa/:path*",
          destination: `${MEDUSA_BACKEND_URL}/:path*`,
        },
        {
          source: "/:countryCode/medusa/:path*",
          destination: `${MEDUSA_BACKEND_URL}/:path*`,
        },
        {
          source: "/products/:handle([^/.]+).md",
          destination: `/${DEFAULT_REGION}/products/:handle/markdown`,
        },
        {
          source: "/:countryCode/products/:handle([^/.]+).md",
          destination: "/:countryCode/products/:handle/markdown",
        },
        {
          source: "/:countryCode/products/:handle([^/.]+)",
          has: [{ type: "header", key: "accept", value: ".*text/markdown.*" }],
          destination: "/:countryCode/products/:handle/markdown",
        },
      ],
    }
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    qualities: [50, 75],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "*.s3.*.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "*.s3.amazonaws.com",
      },
      ...(S3_HOSTNAME && S3_PATHNAME
        ? [
            {
              protocol: "https",
              hostname: S3_HOSTNAME,
              pathname: S3_PATHNAME,
            },
          ]
        : []),
    ],
  },
}

module.exports = nextConfig
