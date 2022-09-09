import { storiesOf } from '@storybook/react'

import { BasicActionModal }   from './BasicModal'
import { CustomActionModal }  from './CustomModal'
import { ErrorThrowingModal } from './ErrorThrowingModal'

storiesOf('Action Modal', module)
  .add('Basic Action Modal', BasicActionModal)
  .add('Custom Action Modal', CustomActionModal)
  .add('Error Throwing Modal', ErrorThrowingModal)

export {}
