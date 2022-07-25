import React from 'react'

import moment      from 'moment'
import { useIntl } from 'react-intl'

import { AnalyticsFilterProvider } from '@acx-ui/analytics/utils'
import {
  Button,
  DashboardRow,
  DashboardCol,
  PageHeader,
  RangePicker
} from '@acx-ui/components'
import {
  ArrowExpand,
  DownloadOutlined,
  BulbOutlined
} from '@acx-ui/icons'
import { useDateFilter } from '@acx-ui/utils'

const WifiWidgets = React.lazy(() => import('rc-wifi/Widgets'))
const AnalyticsWidgets = React.lazy(() => import('analytics/Widgets'))
const defaultEnabledDates = [moment().subtract(1, 'months').seconds(0), moment().seconds(0)]
export default function Dashboard () {
  return (
    <AnalyticsFilterProvider>
      <DashboardPageHeader />
      <DashboardWidgets />
    </AnalyticsFilterProvider>
  )
}

function DashboardPageHeader () {
  const { startDate, endDate, setDateFilter, range } = useDateFilter()
  const { $t } = useIntl()
  return (
    <PageHeader
      title={$t({ id: 'title', defaultMessage: 'Dashboard' })}
      extra={[
        <Button key='add' type='primary'>Add...</Button>,
        <Button key='hierarchy-filter'>Entire Organization <ArrowExpand /></Button>,
        <RangePicker
          key='range-picker'
          selectedRange={{ startDate: moment(startDate), endDate: moment(endDate) }}
          enableDates={defaultEnabledDates as [moment.Moment, moment.Moment]}
          onDateApply={setDateFilter as Function}
          showTimePicker
          selectionType={range}
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
