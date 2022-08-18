import { storiesOf } from '@storybook/react'

import { Basic }       from './Basic'
import { NoBorder }    from './NoBorder'
import { WithButton }  from './WithButton'
import { WithTab }     from './WithTab'
import { WithTabOnly } from './WithTabOnly'
import { WithTitle }   from './WithTitle'

storiesOf('Card', module)
  .add('Basic', Basic)
  .add('With Title', WithTitle)
  .add('With Button', WithButton)
  .add('With Tab', WithTab)
  .add('With Tab Only', WithTabOnly)
  .add('No Border', NoBorder)

export {}
