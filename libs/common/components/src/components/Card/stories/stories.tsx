import { storiesOf } from '@storybook/react'

import { Basic }      from './Basic'
import { NoBorder }   from './NoBorder'
import { WithButton } from './WithButton'
import { WithTitle }  from './WithTitle'

storiesOf('Card', module)
  .add('Basic', Basic)
  .add('With Title', WithTitle)
  .add('With Button', WithButton)
  .add('No Border', NoBorder)

export {}
