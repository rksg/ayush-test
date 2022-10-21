import { ComponentStory } from '@storybook/react'
import { Form, Input }    from 'antd'

import { Fieldset, FieldsetProps } from '.'

const story = {
  title: 'Fieldset',
  component: Fieldset
}

export default story

const Template: ComponentStory<typeof Fieldset> = (args: FieldsetProps) => {
  return <Form layout='vertical'>
    <Form.Item label='Field 1' children={<Input />} />
    <Fieldset {...args}>
      <Form.Item label='Field 1' children={<Input />} />
      <Form.Item label='Field 2' children={<Input />} />
    </Fieldset>
    <Fieldset {...noSwitchArgs}> test </Fieldset>
  </Form>
}

export const Default = Template.bind({})
Default.args = { label: 'Group 1' }
const noSwitchArgs = { label: 'Title', switchStyle: { display: 'none' }, checked: true }
