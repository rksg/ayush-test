import { storiesOf } from '@storybook/react'

import { BasicActionModal }  from './BasicModal'
import { CustomActionModal } from './CustomModal'

storiesOf('Action Modal', module)
  .add('Basic Action Modal', BasicActionModal)
  .add('Custom Action Modal', CustomActionModal)

export {}
