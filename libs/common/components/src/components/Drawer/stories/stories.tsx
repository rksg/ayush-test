import { storiesOf } from '@storybook/react'

import { BasicDrawer }          from './BasicDrawer'
import { CustomDrawer }         from './CustomDrawer'
import { DrawerWithBackButton } from './DrawerWithBackButton'
import { DrawerWithIcon }       from './DrawerWithIcon'
import { DrawerWithSubtitle }   from './DrawerWithSubtitle'

storiesOf('Drawer', module)
  .add('Basic Drawer', BasicDrawer)
  .add('Custom Drawer', CustomDrawer)
  .add('Drawer With BackButton', DrawerWithBackButton)
  .add('Drawer With Subtitle', DrawerWithSubtitle)
  .add('Drawer With Icon', DrawerWithIcon)

export {}
