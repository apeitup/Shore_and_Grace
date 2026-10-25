import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import SideMenu from "."

const meta = {
  title: "Foundation/Mobile menu",
  component: SideMenu,
  args: {
    regions: null,
    locales: null,
    currentLocale: "en-GB",
  },
  decorators: [
    (Story) => (
      <div className="sg-storybook-menu">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SideMenu>

export default meta
type Story = StoryObj<typeof meta>

export const Closed: Story = {}
