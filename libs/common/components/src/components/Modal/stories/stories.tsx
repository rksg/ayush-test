import { storiesOf } from '@storybook/react'

import { BasicModal } from './BasicModal'
import { FormModal } from './FormModal'
import { SingleButtonModal } from './SingleButtonModal'

storiesOf('Modal', module)
  .add('Basic', BasicModal)
  .add('Form', FormModal)
  .add('SingleButton', SingleButtonModal)

export {}
