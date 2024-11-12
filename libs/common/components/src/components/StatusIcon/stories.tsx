import { ComponentStory } from '@storybook/react'

import { StatusIcon } from '.'

const story = {
  title: 'StatusIcon',
  component: StatusIcon
}

export default story

const Template: ComponentStory<typeof StatusIcon> = () => (
  <>
    <StatusIcon status='SUCCESS'/>
    <StatusIcon status='PENDING'/>
    <StatusIcon status='INPROGRESS'/>
    <StatusIcon status='FAIL'/>
  </>
)

export const Default = Template.bind({})
Default.args = {}
