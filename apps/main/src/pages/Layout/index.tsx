import {
  Layout as LayoutComponent,
  LayoutUI
} from '@acx-ui/components'
import { SplitProvider } from '@acx-ui/feature-toggle'
import {
  AccountCircleSolid,
  QuestionMarkCircleSolid,
  SearchOutlined
} from '@acx-ui/icons'
import { Outlet }             from '@acx-ui/react-router-dom'
import { DateFilterProvider } from '@acx-ui/utils'

import { AlarmsHeaderButton } from '../../components/Alarms/HeaderButton'

import { useMenuConfig } from './menuConfig'

function Layout () {
  return (
    <SplitProvider>
      <DateFilterProvider>
        <LayoutComponent
          menuConfig={useMenuConfig()}
          content={<Outlet />}
          rightHeaderContent={<>
            <LayoutUI.ButtonOutlined shape='circle' icon={<SearchOutlined />} />
            <LayoutUI.Divider />
            <AlarmsHeaderButton />
            <LayoutUI.ButtonSolid icon={<QuestionMarkCircleSolid />} />
            <LayoutUI.ButtonSolid icon={<AccountCircleSolid />} />
          </>}
        />
      </DateFilterProvider>
    </SplitProvider>
  )
}
export default Layout
