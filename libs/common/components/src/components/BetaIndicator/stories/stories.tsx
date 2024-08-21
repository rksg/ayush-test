import { storiesOf } from '@storybook/react'

import { Basic }         from './Basic'
import { WithRadioCard } from './WithRadioCard'
import { WithTable }     from './WithTable'
import { WithTabs }      from './WithTabs'


storiesOf('BetaIndicator', module)
  .add('Basic', Basic)
  .add('With Table', WithTable)
  .add('With Tab', WithTabs)
  .add('With RadioCard', WithRadioCard)

