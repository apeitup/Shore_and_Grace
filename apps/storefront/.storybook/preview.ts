import type { Preview } from "@storybook/nextjs-vite"

import "@fontsource/cormorant-garamond/latin-400.css"
import "@fontsource/cormorant-garamond/latin-500.css"
import "@fontsource/cormorant-garamond/latin-600.css"
import "@fontsource/montserrat/latin-400.css"
import "@fontsource/montserrat/latin-500.css"
import "../src/styles/globals.css"

const preview: Preview = {
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/gb",
        params: { countryCode: "gb" },
      },
    },
    a11y: {
      test: "error",
    },
    viewport: {
      options: {
        mobile: {
          name: "Figma mobile",
          styles: { width: "390px", height: "844px" },
        },
        tablet: {
          name: "Figma tablet",
          styles: { width: "1280px", height: "982px" },
        },
        desktop: {
          name: "Figma desktop",
          styles: { width: "1512px", height: "982px" },
        },
      },
    },
  },
}

export default preview
