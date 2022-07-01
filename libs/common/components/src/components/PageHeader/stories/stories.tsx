import { storiesOf } from '@storybook/react'

import { Basic }        from './Basic'
import { WithButtons }  from './WithButtons'
import { WithSubTitle } from './WithSubTitleText'
import { WithSubTitle as SubTitleComp } from './WithSubTitleComp'
import { WithTabs }     from './WithTabs'

storiesOf('PageHeader', module)
  .add('Basic', Basic)
  .add('With Buttons', WithButtons)
  .add('With Tabs', WithTabs)
  .add('With Sub Title Text', WithSubTitle)
  .add('With Sub Title Component', SubTitleComp)
export {}
