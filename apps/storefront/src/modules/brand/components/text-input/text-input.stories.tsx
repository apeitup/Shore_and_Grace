import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import BrandTextInput from "."

const meta = {
  title: "Foundation/Text input",
  component: BrandTextInput,
  args: {
    label: "Email address",
    placeholder: "Enter your email address",
    type: "email",
  },
  decorators: [
    (Story) => (
      <div className="sg-storybook-pad sg-storybook-field">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BrandTextInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Disabled: Story = { args: { disabled: true } }
