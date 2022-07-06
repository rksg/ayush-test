import { storiesOf } from '@storybook/react'

import { BasicDrawer }  from './BasicDrawer'
import { CustomDrawer } from './CustomDrawer'

storiesOf('Drawer', module)
  .add('Basic Drawer', BasicDrawer)
  .add('Custom Drawer', CustomDrawer)

export {}