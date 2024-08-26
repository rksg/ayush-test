import { storiesOf } from '@storybook/react'

import { Basic }       from './Basic'
import { DynamicIcon } from './DynamicIcon'
import { WithButton }  from './WithButton'

storiesOf('Icon', module)
  .add('Basic', Basic)

storiesOf('Icon (New)', module)
  .add('Basic', DynamicIcon)
  .add('With Button', WithButton)

export {}
