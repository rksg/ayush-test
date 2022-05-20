import React from 'react'

import { Tabs } from 'antd'

import { PageHeader } from '@acx-ui/components'
import {
  useLocation,
  useNavigate,
  useResolvedPath,
  useTenantLink,
  Outlet
} from '@acx-ui/react-router-dom'

export function Monitoring () {
  return (
    <>
      <MonitoringPageHeader />
      <Outlet />
    </>
  )
}

function MonitoringPageHeader () {
  const navigate = useNavigate()
  const monitoringPath = useTenantLink('/monitoring')
  const location = useLocation()
  const path = useResolvedPath(location)
  const tab = path.pathname.split('/').pop()

  const onTabChange = (tab: string) =>
    navigate({
      ...monitoringPath,
      pathname: `${monitoringPath.pathname}/${tab}`
    })

  return (
    <PageHeader
      title='Monitoring'
      footer={
        <Tabs activeKey={tab} onChange={onTabChange}>
          <Tabs.TabPane key='summary' tab='Summary' />
          <Tabs.TabPane key='topology' tab='Topology' />
        </Tabs>
      }
    />
  )
}
