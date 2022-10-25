import { ComponentStory } from '@storybook/react'

import { Tabs, TabsProps } from '.'

const story = {
  title: 'Tabs',
  component: Tabs
}

export default story

const Template: ComponentStory<typeof Tabs> = (args: TabsProps) => (
  <Tabs {...args}>
    <Tabs.TabPane tab='Tab 1' key='tab1'>Tab 1 Content</Tabs.TabPane>
    <Tabs.TabPane tab='Tab 2' key='tab2'>Tab 2 Content</Tabs.TabPane>
    <Tabs.TabPane tab='Tab 3' key='tab3'>Tab 3 Content</Tabs.TabPane>
  </Tabs>
)

export const Default = Template.bind({})
Default.args = {}
