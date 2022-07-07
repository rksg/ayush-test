import { storiesOf } from '@storybook/react'

import { BasicModal }        from './BasicModal'
import { FormModal }         from './FormModal'

storiesOf('Modal', module)
  .add('Basic', BasicModal)
  .add('Form', FormModal)

export {}
