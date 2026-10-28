import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Calendar } from "iconoir-react"

import NativeSelect from "."

const meta = {
  title: "Foundation/Select",
  component: NativeSelect,
  args: {
    label: "Select option",
    required: true,
    defaultValue: "",
    placeholder: "Choose an option",
    children: (
      <>
        <option value="one">Option one</option>
        <option value="two">Option two</option>
      </>
    ),
  },
  decorators: [
    (Story) => (
      <div className="sg-storybook-pad sg-storybook-field">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NativeSelect>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const WithLeadingIcon: Story = {
  args: { leadingIcon: <Calendar /> },
}
export const Validated: Story = {
  args: { defaultValue: "one", validated: true },
}
export const Error: Story = {
  args: { error: "Please choose an option" },
}
export const Disabled: Story = {
  args: { disabled: true },
}
export const ReadOnly: Story = {
  args: { defaultValue: "one", readOnly: true },
}
