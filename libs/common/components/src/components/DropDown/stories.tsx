import { storiesOf } from '@storybook/react'

import { DropDown } from '.'

storiesOf('DropDown', module).add('Basic', () => (
  <DropDown list={['item1', 'item2', 'item3']} selected={'item1'} />
))
