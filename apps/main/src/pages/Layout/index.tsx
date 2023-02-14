import { useState } from 'react'

import { useIntl } from 'react-intl'

import { Tooltip } from '@acx-ui/components'
import {
  Layout as LayoutComponent,
  LayoutUI
} from '@acx-ui/components'
import { SplitProvider } from '@acx-ui/feature-toggle'
import {
  ActivityButton,
  AlarmsButton,
  FetchBot,
  HelpButton,
  UserButton
} from '@acx-ui/main/components'
import { CloudMessageBanner } from '@acx-ui/rc/components'
import { Outlet }             from '@acx-ui/react-router-dom'
import { notAvailableMsg }    from '@acx-ui/utils'


import { useMenuConfig } from './menuConfig'
import SearchBar         from './SearchBar'

function Layout () {
  const [supportStatus,setSupportStatus] = useState('')
  return (
    <LayoutComponent
      menuConfig={useMenuConfig()}
      content={
        <>
          <CloudMessageBanner />
          <Outlet />
        </>
      }
      rightHeaderContent={<>
        <SearchBar />
        <LayoutUI.Divider />
        <AlarmsButton/>
        <ActivityButton/>
        <FetchBot showFloatingButton={false} statusCallback={setSupportStatus}/>
        <Tooltip placement='bottomRight' title={useIntl().$t(notAvailableMsg)}>
          <HelpButton supportStatus={supportStatus}/>
        </Tooltip>
        <Tooltip placement='bottomRight' title={useIntl().$t(notAvailableMsg)}>
          <UserButton/>
        </Tooltip>
      </>}
    />
  )
}

function LayoutWithSplitProvider () {
  return <SplitProvider>
    <Layout />
  </SplitProvider>
}

export default LayoutWithSplitProvider
