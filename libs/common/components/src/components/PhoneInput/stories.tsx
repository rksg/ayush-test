import { ComponentStory } from '@storybook/react'
import { Form }           from 'antd'

import { PhoneInput, PhoneInputProps } from '.'

const story = {
  title: 'PhoneInput',
  component: PhoneInput
}

export default story

const Template: ComponentStory<typeof PhoneInput> = (args: PhoneInputProps) => (
  <Form style={{ width: 300 }}>
    <Form.Item label='Phone Number'>
      <PhoneInput {...args} />
    </Form.Item>
  </Form>
)

export const Default = Template.bind({})
Default.args = {}
