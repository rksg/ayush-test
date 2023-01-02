import { storiesOf } from '@storybook/react'

import { FlatListMulti }    from './FlatListMulti'
import { LazyNestedSingle } from './LazyNestedSingle'
import { NestedListSingle } from './NestedListSingle'
import { SingleSelect }     from './SingleSelect'

storiesOf('Select', module)
  .add('With Nested List - single', NestedListSingle)
  .add('With Simple List - multi', FlatListMulti)
  .add('With Lazy Loading', LazyNestedSingle)
  .add('Single Select', SingleSelect)

export {}
