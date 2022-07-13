import React from 'react'

import moment from 'moment'

import { AnalyticsFilterProvider } from '@acx-ui/analytics/utils'
import {
  Button,
  DashboardRow,
  DashboardCol,
  PageHeader,
  DatePicker
} from '@acx-ui/components'
import {
  ArrowExpand,
  DownloadOutlined,
  BulbOutlined
} from '@acx-ui/icons'
import { useDateFilter } from '@acx-ui/utils'

const WifiWidgets = React.lazy(() => import('rc-wifi/Widgets'))
const AnalyticsWidgets = React.lazy(() => import('analytics/Widgets'))

export default function Dashboard () {
  return (
    <AnalyticsFilterProvider>
      <DashboardPageHeader />
      <DashboardWidgets />
    </AnalyticsFilterProvider>
  )
}

function DashboardPageHeader () {
  const { startDate,endDate, setDateFilter } = useDateFilter()
  console.log(startDate)
  console.log(endDate)

  return (
    <PageHeader
      title='Dashboard'
      extra={[
        <Button key='add' type='primary'>Add...</Button>,
        <Button key='hierarchy-filter'>Entire Organization <ArrowExpand /></Button>,
        <DatePicker
          selectedRange={{ 
            startDate: startDate,
            endDate: endDate }}
          rangeOptions
          enableDates={[moment().subtract(3, 'months').seconds(0),
            moment().seconds(0)]}
          onDateApply={setDateFilter}
          showTimePicker
        />,
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
