import { ComponentStory, ComponentMeta } from '@storybook/react'

import { BrowserRouter } from '@acx-ui/react-router-dom'

import { Anchor, AnchorLayout, AnchorLayoutProps } from './index'

export default {
  title: 'AnchorLayout',
  component: AnchorLayout,
  subcomponents: { Anchor }
} as ComponentMeta<typeof AnchorLayout>

const AnchorTemplate: ComponentStory<typeof Anchor> = () => (
  <Anchor onClick={(e) => e.preventDefault()}>
    <Anchor.Link href='#1' title='Anchor 1' />
    <Anchor.Link href='#2' title='Anchor 2' />
    <Anchor.Link href='#3' title='Anchor 3'>
      <Anchor.Link href='#31' title='Anchor 3-1' />
      <Anchor.Link href='#32' title='Anchor 3-2' />
    </Anchor.Link>
  </Anchor>
)

const Template: ComponentStory<typeof AnchorLayout> = (args: AnchorLayoutProps) => (
  <BrowserRouter>
    <AnchorLayout {...args} />
  </BrowserRouter>
)

export const Basic_Anchor = AnchorTemplate.bind({})
export const Anchor_with_Page_Layout = Template.bind({})

Anchor_with_Page_Layout.args = {
  items: [{
    title: 'Anchor 1',
    content: 'Content 1'
  }, {
    title: 'Anchor 2',
    content: (
      <div>
        <p>Content 2</p>
        <p>Content 2</p>
        <p>Content 2</p>
        <p>Content 2</p>
        <p>Content 2</p>
        <p>Content 2</p>
        <p>Content 2</p>
        <p>Content 2</p>
        <p>Content 2</p>
        <p>Content 2</p>
        <p>Content 2</p>
        <p>Content 2</p>
        <p>Content 2</p>
        <p>Content 2</p>
        <p>Content 2</p>
        <p>Content 2</p>
        <p>Content 2</p>
        <p>Content 2</p>
      </div>
    )
  }, {
    title: 'Anchor 3',
    content: 'Content 3'
  }],
  offsetTop: 50
}
