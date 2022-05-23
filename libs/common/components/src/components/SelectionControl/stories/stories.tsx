import { storiesOf } from '@storybook/react'

import { Basic }             from './Basic'
import { BasicWithDisabled } from './BasicWithDisabled'
import { WithContent }       from './WithContent'
import { WithIcon }          from './WithIcon'

storiesOf('SelectionControl', module)
  .add('Basic', Basic)
  .add('Basic With Disabled', BasicWithDisabled)
  .add('With Icon', WithIcon)
  .add('With Content', WithContent)

export {}
