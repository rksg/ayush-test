import React from 'react'

import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'

import { AnalyticsFilterProvider } from '@acx-ui/analytics/utils'
import {
  Button,
  DashboardRow,
  DashboardCol,
  PageHeader,
  RangePicker,
  ContentSwitcher,
  ContentSwitcherProps
} from '@acx-ui/components'
import {
  ArrowExpand,
  DownloadOutlined,
  BulbOutlined
} from '@acx-ui/icons'
import { useDateFilter } from '@acx-ui/utils'

const WifiWidgets = React.lazy(() => import('rc/Widgets'))
const AnalyticsWidgets = React.lazy(() => import('analytics/Widgets'))
const defaultEnabledDates = [moment().subtract(3, 'months').seconds(0), moment().seconds(0)]
export default function Dashboard () {
  return (
    <AnalyticsFilterProvider>
      <DashboardPageHeader />
      <CommonDashboardWidgets />
      <ContentSwitcher tabDetails={tabDetails} size='large' />
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
        <Button key='add' type='primary'>
          {$t({ id: 'pageHeaderMenu.add', defaultMessage: 'Add...' })}
        </Button>,
        <Button key='hierarchy-filter'>
          {$t({ id: 'pageHeaderMenu.entireOrg', defaultMessage: 'Entire Organization' })}
          <ArrowExpand />
        </Button>,
        <RangePicker
          key='range-picker'
          selectedRange={{ startDate: moment(startDate), endDate: moment(endDate) }}
          enableDates={defaultEnabledDates as [moment.Moment, moment.Moment]}
          onDateApply={setDateFilter as CallableFunction}
          showTimePicker
          selectionType={range}
        />,
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

const tabDetails: ContentSwitcherProps['tabDetails'] = [
  {
    label: 'Wi-Fi',
    value: 'ap',
    children: ApWidgets()
  },
  {
    label: 'Switch',
    value: 'switch',
    children: SwitchWidgets()
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
