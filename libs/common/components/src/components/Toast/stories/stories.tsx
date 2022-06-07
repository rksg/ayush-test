import { storiesOf } from '@storybook/react'

import { BasicToast } from './BasicToast'
import { RcToast }    from './RcToast/RcToast'
storiesOf('Toast', module)
  .add('Basic Toast', BasicToast)
  .add('RC Toast', RcToast)

export {}
