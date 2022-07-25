import { storiesOf } from '@storybook/react'

import { withRadio }                     from './withRadio'
import { WithSinglelistAndSingleSelect } from './withSinglelistAndSingleSelect'

storiesOf('NetworkFilter', module)
  .add('With singlelist and single select', WithSinglelistAndSingleSelect)
  .add('With Radio', withRadio)

export {}
