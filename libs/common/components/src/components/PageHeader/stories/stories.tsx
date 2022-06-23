import { storiesOf } from '@storybook/react'

import { Basic }       from './Basic'
import { WithButtons } from './WithButtons'
import { WithTabs }    from './WithTabs'

storiesOf('PageHeader', module)
  .add('Basic', Basic)
  .add('With Buttons', WithButtons)
  .add('With Tabs', WithTabs)

export {}
