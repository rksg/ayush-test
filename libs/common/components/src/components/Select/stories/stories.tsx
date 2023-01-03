import { storiesOf } from '@storybook/react'

import { FlatListMulti }                                              from './FlatListMulti'
import { LazyNested, LazyNestedWithBand, LazyNestedWithBandDisabled } from './LazyNested'
import { NestedListSingle }                                           from './NestedListSingle'
import { SingleSelect }                                               from './SingleSelect'

storiesOf('Select', module)
  .add('With Nested List - single', NestedListSingle)
  .add('With Simple List - multi', FlatListMulti)
  .add('With Lazy Loading', LazyNested)
  .add('With Lazy Loading and Bands', LazyNestedWithBand)
  .add('With Lazy Loading having Bands disabled', LazyNestedWithBandDisabled)
  .add('Single Select', SingleSelect)

export {}
