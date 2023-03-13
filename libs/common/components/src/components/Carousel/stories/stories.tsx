import { storiesOf } from '@storybook/react'

import { Basic }  from './Basic'
import { Nodata } from './Nodata'

storiesOf('Carousel', module)
  .add('Basic', Basic)
  .add('No Data', Nodata)
export {}