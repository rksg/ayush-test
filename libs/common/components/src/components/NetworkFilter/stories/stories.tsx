import { storiesOf } from '@storybook/react'

import { FlatListMulti }              from './FlatListMulti'
import { LazyNestedSingle }           from './LazyNestedSingle'
import { NestedListSingle }           from './NestedListSingle'
import { NestedMultiCheckboxControl } from './NestedMultiCheckboxControl'

storiesOf('NetworkFilter', module)
  .add('nested list, single select', NestedListSingle)
  .add('flat list, multi select', FlatListMulti)
  .add('nested list, multi select, checkboxgroup & control button', NestedMultiCheckboxControl)
  .add('lazy loaded, single select', LazyNestedSingle)

export {}
