import { ComponentStory }                    from '@storybook/react'
import { CascaderProps }                     from 'antd'
import { BaseOptionType, DefaultOptionType } from 'antd/lib/cascader'

import { FlattenCascader } from './FlattenCascader'

const story = {
  title: 'FlattenCascader',
  component: FlattenCascader
}

export default story

interface StoryTemplate <
  OptionType extends DefaultOptionType | BaseOptionType = DefaultOptionType
> extends ComponentStory<(typeof FlattenCascader)> {
  (args: CascaderProps<OptionType>): JSX.Element
}

const Template: StoryTemplate = (args) => {
  return <FlattenCascader {...args} />
}

const item = (value: string, children?: DefaultOptionType[]) => ({
  label: `Item ${value}`,
  value: value,
  children
}) as DefaultOptionType

const options = [
  item('1', [item('1.1')]),
  item('2', [
    item('2.1'),
    item('2.2', [
      item('2.2.1'),
      item('2.2.2')
    ])
  ]),
  item('3', [item('3.1')]),
  item('4', [item('4.1')]),
  item('5', [item('5.1')]),
  item('6', [item('6.1')]),
  item('7', [item('7.1')]),
  item('8', [item('8.1')]),
  item('9', [item('9.1')]),
  item('10', [item('10.1')]),
  item('11', [item('11.1')])
]

export const Default = Template.bind({})
Default.args = { options }
