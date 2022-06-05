import React from 'react'

import { DashboardRow, DashboardCol } from '@acx-ui/components'

const WifiWidgets = React.lazy(() => import('rc-wifi/Widgets'))
const AnalyticsWidgets = React.lazy(() => import('analytics/Widgets'))

export function Summary () {
  return (
    <DashboardRow gutter={[20, 20]}>

      <DashboardCol col={{ span: 6 }} style={{ height: '384px' }}>
        <WifiWidgets name='alarms' />
      </DashboardCol>
      <DashboardCol col={{ span: 6 }} style={{ height: '384px' }}>
        <AnalyticsWidgets name='incidents' />
      </DashboardCol>
      <DashboardCol col={{ span: 12 }} style={{ height: '384px' }}>
        <AnalyticsWidgets name='health' />
      </DashboardCol>

      <DashboardCol col={{ span: 6 }} style={{ height: '176px' }}>
        <WifiWidgets name='venues' />
      </DashboardCol>
      <DashboardCol col={{ span: 10 }} style={{ height: '176px' }}>
        <WifiWidgets name='devices' />
      </DashboardCol>
      <DashboardCol col={{ span: 8 }} style={{ height: '176px' }}>
        <WifiWidgets name='clients' />
      </DashboardCol>

      <DashboardCol col={{ span: 24 }} style={{ height: '428px' }}>
        <WifiWidgets name='map' />
      </DashboardCol>

      <DashboardCol col={{ span: 12 }} style={{ height: '280px' }}>
        <AnalyticsWidgets name='trafficByVolume' />
      </DashboardCol>
      <DashboardCol col={{ span: 12 }} style={{ height: '280px' }}>
        <AnalyticsWidgets name='networkHistory' />
      </DashboardCol>

      <DashboardCol col={{ span: 12 }} style={{ height: '280px' }}>
        <AnalyticsWidgets name='connectedClientsOverTime' />
      </DashboardCol>
      <DashboardCol col={{ span: 12 }} style={{ height: '280px' }}>
        <AnalyticsWidgets name='topApplicationsByTraffic' />
      </DashboardCol>

    </DashboardRow>
  )
}
