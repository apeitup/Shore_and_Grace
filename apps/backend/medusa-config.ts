import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    }
  },
  modules: [
    {
      resolve: "./src/modules/product-review",
    },
    {
      resolve: "./src/modules/wishlist",
    },
    {
      resolve: "./src/modules/florist-delivery",
    },
    {
      resolve: "./src/modules/gift-order",
    },
    {
      resolve: "./src/modules/special-occasion",
    },
    {
      resolve: "./src/modules/customer-preferences",
    },
    {
      resolve: "./src/modules/privacy-request",
    },
  ],
})
