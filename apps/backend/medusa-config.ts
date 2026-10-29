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
    {
      resolve: "./src/modules/contact-enquiry",
    },
    {
      resolve: "@medusajs/medusa/notification",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/notification-local",
            id: "local",
            options: {
              channels: ["feed"],
            },
          },
          {
            resolve: "./src/modules/smtp-notification",
            id: "smtp",
            options: {
              channels: ["email"],
              host: process.env.SMTP_HOST,
              port: process.env.SMTP_PORT || "465",
              secure: process.env.SMTP_SECURE || "true",
              user: process.env.SMTP_USER,
              password: process.env.SMTP_PASSWORD,
              from: process.env.NOTIFICATION_FROM_EMAIL,
              from_name: "Shore & Grace",
            },
          },
        ],
      },
    },
  ],
})
