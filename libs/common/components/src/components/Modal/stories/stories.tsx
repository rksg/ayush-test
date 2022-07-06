import { storiesOf } from '@storybook/react'

import { BasicModal }  from './BasicModal'
import { CustomModal } from './CustomModal'

storiesOf('Modal', module)
  .add('Basic Modal', BasicModal)
  .add('Custom Modal', CustomModal)

export {}
