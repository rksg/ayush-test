import { storiesOf } from '@storybook/react'

import { Basic }  from './Basic'
import { NoData } from './Nodata'

storiesOf('Carousel', module)
  .add('Basic', Basic)
  .add('No Data', NoData)
export {}
