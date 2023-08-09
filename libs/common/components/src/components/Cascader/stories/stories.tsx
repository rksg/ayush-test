import { storiesOf } from '@storybook/react'

import { FlatListMulti }                                              from './FlatListMulti'
import { LazyNested, LazyNestedWithBand, LazyNestedWithBandDisabled } from './LazyNested'
import { NestedListSingle }                                           from './NestedListSingle'

storiesOf('Cascader', module)
  .add('With Nested List - single', NestedListSingle)
  .add('With Simple List - multi', FlatListMulti)
  .add('With Lazy Loading', LazyNested)
  .add('With Lazy Loading and Bands', LazyNestedWithBand)
  .add('With Lazy Loading having Bands disabled', LazyNestedWithBandDisabled)

export {}
