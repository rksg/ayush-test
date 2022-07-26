import { storiesOf } from '@storybook/react'

import { withRadio }      from './withRadio'
import { WithSingleList } from './withSingleList'

storiesOf('NetworkFilter', module)
  .add('With singlelist', WithSingleList)
  .add('With Radio', withRadio)

export {}
