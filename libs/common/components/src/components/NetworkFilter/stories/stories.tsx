import { storiesOf } from '@storybook/react'

import { WithCheckboxGroupMulti } from './withNestedListButtons'
import { WithSingleList }         from './withSingleList'
import { WithSingleListMulti }    from './withSingleListMulti'

storiesOf('NetworkFilter', module)
  .add('with single list, single select', WithSingleList)
  .add('with single list, multi select', WithSingleListMulti)
  .add('with nested list, radio & multi select', WithCheckboxGroupMulti)

export {}
