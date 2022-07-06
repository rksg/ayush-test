import { storiesOf } from '@storybook/react'

import { Basic }                              from './Basic'
import { WithButtons }                        from './WithButtons'
import { WithSubTitleText, WithSubTitleComp } from './WithSubTitle'
import { WithTabs }                           from './WithTabs'

storiesOf('PageHeader', module)
  .add('Basic', Basic)
  .add('With Buttons', WithButtons)
  .add('With Tabs', WithTabs)
  .add('With Subtitle Text', WithSubTitleText)
  .add('With Subtitle Component', WithSubTitleComp)
export {}
