import { storiesOf } from '@storybook/react'

import { FlatListMulti }    from './FlatListMulti'
import { LazyNestedSingle } from './LazyNestedSingle'
import { NestedListSingle } from './NestedListSingle'

storiesOf('NetworkFilter', module)
  .add('With Nested List - single', NestedListSingle)
  .add('With Simple List - multi', FlatListMulti)
  .add('With Lazy Loading', LazyNestedSingle)

export {}
