import React from 'react'

import { useTranslation } from 'react-i18next'

import { GlobalFilterProvider } from '@acx-ui/analytics/utils'
import {
  Button,
  DashboardRow,
  DashboardCol,
  PageHeader
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
      <DashboardWidgets />
    </GlobalFilterProvider>
  )
}

function DashboardPageHeader () {
  const { t } = useTranslation()
  return (
    <PageHeader
      title='Dashboard'
      extra={[
        <p>{t('description')}</p>,
        <Button key='add' type='primary'>{t('add')}...</Button>,
        <Button key='hierarchy-filter'>{t('entirOrg')}<ArrowExpand /></Button>,
        <Button key='date-filter' icon={<ClockOutlined />}>{t('last24Hrs')}</Button>,
        <Button key='download' icon={<DownloadOutlined />} />,
        <Button key='insight' icon={<BulbOutlined />} />
      ]}
    />
  )
}

function DashboardWidgets () {
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
