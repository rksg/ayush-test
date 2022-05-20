import { storiesOf } from '@storybook/react'

import { Basic }      from './Basic'
import { WithFooter } from './WithFooter'
import { WithTabs }   from './WithTabs'

storiesOf('PageHeader', module)
  .add('Basic', Basic)
  .add('With Footer', WithFooter)
  .add('With Tabs', WithTabs)

export {}
