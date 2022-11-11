import { useIntl } from 'react-intl'

import { Tooltip } from '@acx-ui/components'
import {
  Layout as LayoutComponent,
  LayoutUI
}                        from '@acx-ui/components'
import { SplitProvider } from '@acx-ui/feature-toggle'
import {
  AccountCircleSolid,
  QuestionMarkCircleSolid
}                          from '@acx-ui/icons'
import { AlarmsHeaderButton } from '@acx-ui/main/components'
import { Outlet }             from '@acx-ui/react-router-dom'
import { notAvailableMsg }    from '@acx-ui/utils'

import { useMenuConfig } from './menuConfig'
import SearchBar from './SearchBar'

function Layout () {
  return (
    <SplitProvider>
      <LayoutComponent
        menuConfig={useMenuConfig()}
        content={<Outlet />}
        rightHeaderContent={<>
          <SearchBar />
          <LayoutUI.Divider />
          <AlarmsHeaderButton />
          <Tooltip placement='bottomRight' title={useIntl().$t(notAvailableMsg)}>
            <LayoutUI.ButtonSolid disabled icon={<QuestionMarkCircleSolid />} />
          </Tooltip>
          <Tooltip placement='bottomRight' title={useIntl().$t(notAvailableMsg)}>
            <LayoutUI.ButtonSolid disabled icon={<AccountCircleSolid />} />
          </Tooltip>
        </>}
      />
    </SplitProvider>
  )
}
export default Layout
