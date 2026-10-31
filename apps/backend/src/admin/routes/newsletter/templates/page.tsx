import { defineRouteConfig } from "@medusajs/admin-sdk"
import { TemplateGallery } from "./template-gallery"

const TemplatesPage = () => <TemplateGallery />

export const config = defineRouteConfig({
  label: "Templates",
  rank: 3,
})

export default TemplatesPage
