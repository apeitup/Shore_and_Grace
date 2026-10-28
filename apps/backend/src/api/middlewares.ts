import {
  authenticate,
  configureStoreSearch,
  defineMiddlewares,
  validateAndTransformBody,
  validateAndTransformQuery,
} from "@medusajs/framework/http"
import { GetAdminReviewsSchema } from "./admin/reviews/route"
import { PostAdminUpdateReviewsStatusSchema } from "./admin/reviews/status/route"
import { GetStoreReviewsSchema } from "./store/products/[id]/reviews/route"
import { PostStoreReviewSchema } from "./store/reviews/route"
import { PostStoreWishlistSchema } from "./store/wishlist/route"
import { GetStoreFloristDeliveryOptionsSchema } from "./store/florist-delivery/options/route"
import { PostStoreDeliveryReservationSchema } from "./store/florist-delivery/reservations/route"
import { PostStoreGiftOrderSchema } from "./store/gift-order/route"
import { PostAdminDeliveryZoneSchema } from "./admin/florist-delivery/route"
import { PostAdminBlockedDeliveryDateSchema } from "./admin/florist-delivery/blocked-dates/route"
import { PostAdminOccasionSchema } from "./admin/occasions/route"
import { PostAdminOccasionUpdateSchema } from "./admin/occasions/[id]/route"
import { PostStoreOccasionSchema } from "./store/occasions/route"
import { PostStoreOccasionUpdateSchema } from "./store/occasions/personal/[id]/route"
import { PostStoreOccasionPreferenceSchema } from "./store/occasions/preferences/route"
import { PostCustomerPreferencesSchema } from "./store/customer-preferences/route"
import { PostStorePrivacyRequestSchema } from "./store/privacy-requests/route"
import { GetAdminPrivacyRequestsSchema } from "./admin/privacy-requests/route"
import { PostAdminPrivacyRequestSchema } from "./admin/privacy-requests/[id]/route"

// The product index declares filterable `status` and `sales_channel_ids`, so
// the route narrows it to published products in the key's sales channels.
export default defineMiddlewares({
  routes: [
    {
      method: ["POST"],
      matcher: "/store/search",
      middlewares: [
        configureStoreSearch({
          allowed_indexes: {
            product: true,
          },
        }),
      ],
    },
    {
      matcher: "/store/reviews",
      methods: ["POST"],
      middlewares: [validateAndTransformBody(PostStoreReviewSchema)],
    },
    {
      matcher: "/store/florist-delivery/options",
      methods: ["GET"],
      middlewares: [
        validateAndTransformQuery(GetStoreFloristDeliveryOptionsSchema, {}),
      ],
    },
    {
      matcher: "/store/florist-delivery/reservations",
      methods: ["POST"],
      middlewares: [
        validateAndTransformBody(PostStoreDeliveryReservationSchema),
      ],
    },
    {
      matcher: "/store/gift-order",
      methods: ["POST"],
      middlewares: [validateAndTransformBody(PostStoreGiftOrderSchema)],
    },
    {
      matcher: "/admin/florist-delivery",
      methods: ["POST"],
      middlewares: [validateAndTransformBody(PostAdminDeliveryZoneSchema)],
    },
    {
      matcher: "/admin/florist-delivery/blocked-dates",
      methods: ["POST"],
      middlewares: [
        validateAndTransformBody(PostAdminBlockedDeliveryDateSchema),
      ],
    },
    {
      matcher: "/store/wishlist*",
      middlewares: [authenticate("customer", ["session", "bearer"])],
    },
    {
      matcher: "/store/wishlist",
      methods: ["POST"],
      middlewares: [validateAndTransformBody(PostStoreWishlistSchema)],
    },
    {
      matcher: "/store/occasions*",
      middlewares: [authenticate("customer", ["session", "bearer"])],
    },
    {
      matcher: "/store/customer-preferences*",
      middlewares: [authenticate("customer", ["session", "bearer"])],
    },
    {
      matcher: "/store/customer-data-export",
      middlewares: [authenticate("customer", ["session", "bearer"])],
    },
    {
      matcher: "/store/customer-account",
      middlewares: [authenticate("customer", ["session", "bearer"])],
    },
    {
      matcher: "/store/customer-preferences",
      methods: ["POST"],
      middlewares: [validateAndTransformBody(PostCustomerPreferencesSchema)],
    },
    {
      matcher: "/store/privacy-requests",
      methods: ["POST"],
      middlewares: [validateAndTransformBody(PostStorePrivacyRequestSchema)],
    },
    {
      matcher: "/store/occasions",
      methods: ["POST"],
      middlewares: [validateAndTransformBody(PostStoreOccasionSchema)],
    },
    {
      matcher: "/store/occasions/personal/:id",
      methods: ["POST"],
      middlewares: [validateAndTransformBody(PostStoreOccasionUpdateSchema)],
    },
    {
      matcher: "/store/occasions/preferences",
      methods: ["POST"],
      middlewares: [
        validateAndTransformBody(PostStoreOccasionPreferenceSchema),
      ],
    },
    {
      matcher: "/admin/occasions",
      methods: ["POST"],
      middlewares: [validateAndTransformBody(PostAdminOccasionSchema)],
    },
    {
      matcher: "/admin/occasions/:id",
      methods: ["POST"],
      middlewares: [
        validateAndTransformBody(PostAdminOccasionUpdateSchema),
      ],
    },
    {
      matcher: "/store/products/:id/reviews",
      methods: ["GET"],
      middlewares: [
        validateAndTransformQuery(GetStoreReviewsSchema, {
          isList: true,
          defaults: [
            "id",
            "rating",
            "name",
            "content",
            "created_at",
          ],
        }),
      ],
    },
    {
      matcher: "/admin/reviews",
      methods: ["GET"],
      middlewares: [
        validateAndTransformQuery(GetAdminReviewsSchema, {
          isList: true,
          defaults: [
            "id",
            "content",
            "rating",
            "name",
            "email",
            "product_id",
            "customer_id",
            "status",
            "created_at",
            "updated_at",
            "product.*",
          ],
        }),
      ],
    },
    {
      matcher: "/admin/reviews/status",
      methods: ["POST"],
      middlewares: [
        validateAndTransformBody(PostAdminUpdateReviewsStatusSchema),
      ],
    },
    {
      matcher: "/admin/privacy-requests",
      methods: ["GET"],
      middlewares: [
        validateAndTransformQuery(GetAdminPrivacyRequestsSchema, {
          isList: true,
          defaults: [
            "id",
            "reference",
            "request_type",
            "requester_type",
            "name",
            "email",
            "phone",
            "order_reference",
            "details",
            "customer_id",
            "status",
            "identity_status",
            "due_at",
            "completed_at",
            "internal_notes",
            "privacy_notice_version",
            "created_at",
            "updated_at",
          ],
        }),
      ],
    },
    {
      matcher: "/admin/privacy-requests/:id",
      methods: ["POST"],
      middlewares: [validateAndTransformBody(PostAdminPrivacyRequestSchema)],
    },
  ],
})
