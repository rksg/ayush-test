import React from 'react'

import { useIntl } from 'react-intl'

import { GlobalFilterProvider } from '@acx-ui/analytics/utils'
import {
  Button,
  DashboardRow,
  DashboardCol,
  PageHeader,
  ContentToggle,
  ContentToggleProps
} from '@acx-ui/components'
import {
  ArrowExpand,
  ClockOutlined,
  DownloadOutlined,
  BulbOutlined
} from '@acx-ui/icons'

const WifiWidgets = React.lazy(() => import('rc-wifi/Widgets'))
const AnalyticsWidgets = React.lazy(() => import('analytics/Widgets'))

export default function Dashboard () {
  return (
    <GlobalFilterProvider>
      <DashboardPageHeader />
      <CommonDashboardWidgets />
      <ContentToggle tabDetails={tabDetails} size='large' />
    </GlobalFilterProvider>
  )
}

function DashboardPageHeader () {
  const { $t } = useIntl()
  return (
    <PageHeader
      title={$t({ id: 'title', defaultMessage: 'Dashboard' })}
      extra={[
        <Button key='add' type='primary'>
          {$t({ id: 'pageHeaderMenu.add', defaultMessage: 'Add...' })}
        </Button>,
        <Button key='hierarchy-filter'>
          {$t({ id: 'pageHeaderMenu.entireOrg', defaultMessage: 'Entire Organization' })}
          <ArrowExpand />
        </Button>,
        <Button key='date-filter' icon={<ClockOutlined />}>
          {$t({ id: 'pageHeaderMenu.last24Hrs', defaultMessage: 'Last 24 Hours' })}
        </Button>,
        <Button key='download' icon={<DownloadOutlined />} />,
        <Button key='insight' icon={<BulbOutlined />} />
      ]}
    />
  )
}

function ApWidgets () {
  return (
    <DashboardRow gutter={[20, 20]}>
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

function SwitchWidgets () {
  return (
    <DashboardRow gutter={[20, 20]}>
      <DashboardCol col={{ span: 12 }} style={{ height: '280px' }}>
        <AnalyticsWidgets name='switchTrafficByVolume' />
      </DashboardCol>
      <DashboardCol col={{ span: 12 }} style={{ height: '280px' }}>
        <AnalyticsWidgets name='topSwitchesByPoeUsage' />
      </DashboardCol>
      <DashboardCol col={{ span: 12 }} style={{ height: '280px' }}>
        <AnalyticsWidgets name='topSwitchesByTraffic' />
      </DashboardCol>
      <DashboardCol col={{ span: 12 }} style={{ height: '280px' }}>
        <AnalyticsWidgets name='topSwitchesByErrors' />
      </DashboardCol>
      <DashboardCol col={{ span: 12 }} style={{ height: '280px' }}>
        <AnalyticsWidgets name='topSwitchesByModels' />
      </DashboardCol>
    </DashboardRow>
  )
}

const tabDetails: ContentToggleProps['tabDetails'] = [
  {
    label: 'Wi-Fi',
    value: 'ap',
    content: ApWidgets()
  },
  {
    label: 'Switch',
    value: 'switch',
    content: SwitchWidgets()
  }
]

function CommonDashboardWidgets () {
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

    </DashboardRow>
  )
}
