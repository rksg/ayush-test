import { storiesOf } from '@storybook/react'

import { withRadio }      from './withRadio'
import { WithSingleList } from './withSingleList'

storiesOf('NetworkFilter', module)
  .add('with single list, single select', WithSingleList)
  .add('With Radio', withRadio)

export {}
