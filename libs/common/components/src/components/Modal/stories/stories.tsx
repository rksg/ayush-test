import { storiesOf } from '@storybook/react'

import { BasicModal }           from './BasicModal'
import { FormModal }            from './FormModal'
import { MultiStepsFormModal }  from './MultiStepsFormModal'
import { SingleStepsFormModal } from './SingleStepsFormModal'

storiesOf('Modal', module)
  .add('Basic', BasicModal)
  .add('Form', FormModal)
  .add('SingleStepsFormModal', SingleStepsFormModal)
  .add('MultiStepsFormModal', MultiStepsFormModal)

export {}
