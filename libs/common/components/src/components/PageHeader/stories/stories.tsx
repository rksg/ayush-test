import { storiesOf } from '@storybook/react'

import { Basic }                                  from './Basic'
import { WithBreadcrumb }                         from './WithBreadcrumb'
import { WithButtons }                            from './WithButtons'
import { WithSubTitle, WithSubTitlesAndDividers } from './WithSubTitle'
import { WithTabs }                               from './WithTabs'
import { WithTitleExtra }                         from './WithTitleExtra'
import { WithTitlePrefix }                        from './WithTitlePrefix'

storiesOf('PageHeader', module)
  .add('Basic', Basic)
  .add('With Tabs', WithTabs)
  .add('With Breadcrumb', WithBreadcrumb)
  .add('With Buttons', WithButtons)
  .add('With Title Extra', WithTitleExtra)
  .add('With Title Prefix', WithTitlePrefix)
  .add('With Subtitle', WithSubTitle)
  .add('With Subtitles & Dividers', WithSubTitlesAndDividers)
export {}
