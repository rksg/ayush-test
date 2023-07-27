import { storiesOf } from '@storybook/react'

import { BasicSummaryCard } from './BasicSummaryCard'
import { CustomItem }       from './CustomItem'
import { CustomLayout }     from './CustomLayout'

storiesOf('SummaryCard', module)
  .add('Basic', BasicSummaryCard)
  .add('Customize Item', CustomItem)
  .add('Customize Layout', CustomLayout)