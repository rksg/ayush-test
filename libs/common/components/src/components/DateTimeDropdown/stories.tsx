import { action }               from '@storybook/addon-actions'
import { ComponentStory, Meta } from '@storybook/react'
import { Form }                 from 'antd'
import _                        from 'lodash'
import { castArray }            from 'lodash'
import moment                   from 'moment-timezone'

import { Button } from '../Button'

import { DateTimeDropdown, DateTimeDropdownProps } from '.'

type StoryComponentProps = Omit<DateTimeDropdownProps, 'disabledDate'> & {
  initialDate?: string,
  initialTime?: number
}

const story: Meta<StoryComponentProps> = {
  title: 'DateTimeDropdown',
  component: DateTimeDropdown
}

export default story

const onFinish = action('onFinish')
const Template: ComponentStory<React.FC<StoryComponentProps>> = ({
  initialDate,
  initialTime,
  ...props
}) => {
  const iValues = _.set({}, castArray(props.name), {
    date: initialDate ? moment(initialDate) : undefined,
    time: initialTime
  })

  return <Form
    key={JSON.stringify({ ...iValues })}
    initialValues={iValues}
    layout='vertical'
    onFinish={onFinish}
  >
    <DateTimeDropdown {...props} />
    <Button type='primary' htmlType='submit'>Submit</Button>
  </Form>
}

export const Default = Template.bind({})
Default.args = {
  name: ['field', 'name'],
  dateLabel: 'This is Date Label',
  timeLabel: 'This is Time Label'
}
