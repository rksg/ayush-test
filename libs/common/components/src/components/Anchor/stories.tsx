import { storiesOf } from '@storybook/react'

import { Anchor, AnchorLayout } from './index'

const { Link } = Anchor

const items = [{
  title: 'Anchor 1',
  content: 'Content 1'
}, {
  title: 'Anchor 2',
  content: 'Content 2'
}, {
  title: 'Anchor 3',
  content: 'Content 3'
}]

storiesOf('Anchor', module)
  .add('Basic', () =>
    <Anchor>
      <Link href='#1' title='Anchor 1' />
      <Link href='#2' title='Anchor 2' />
      <Link href='#3' title='Anchor 3'>
        <Link href='#31' title='Anchor 3-1' />
        <Link href='#32' title='Anchor 3-2' />
      </Link>
    </Anchor>
  ).add('Anchor with Page Layout', () =>
    <AnchorLayout items={items} />
  )