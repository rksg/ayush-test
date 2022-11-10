import React from 'react'

import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'

import {
  ConnectedClientsOverTime,
  IncidentsDashboard,
  NetworkHistory,
  SwitchesTrafficByVolume,
  TopApplicationsByTraffic,
  TopSSIDsByClient,
  TopSSIDsByTraffic,
  TopSwitchesByError,
  TopSwitchesByPoEUsage,
  TopSwitchesByTraffic,
  TopSwitchModels,
  TrafficByVolume,
  VenuesHealthDashboard
} from '@acx-ui/analytics/components'
import {
  DisabledButton,
  GridRow,
  GridCol,
  PageHeader,
  RangePicker,
  ContentSwitcher,
  ContentSwitcherProps
} from '@acx-ui/components'
import {
  DownloadOutlined
} from '@acx-ui/icons'
import { VenueFilter }    from '@acx-ui/main/components'
import {
  AlarmWidget,
  ClientsWidget,
  DevicesDashboardWidget,
  MapWidget,
  VenuesDashboardWidget
} from '@acx-ui/rc/components'
import { useDateFilter, dateRangeForLast, useDashboardFilter } from '@acx-ui/utils'

export default function Dashboard () {
  const { $t } = useIntl()
  const tabDetails: ContentSwitcherProps['tabDetails'] = [
    {
      label: $t({ defaultMessage: 'Wi-Fi' }),
      value: 'ap',
      children: <ApWidgets />
    },
    {
      label: $t({ defaultMessage: 'Switch' }),
      value: 'switch',
      children: <SwitchWidgets />
    }
  ]
  return (
    <>
      <DashboardPageHeader />
      <CommonDashboardWidgets />
      <ContentSwitcher tabDetails={tabDetails} size='large' space={15} />
    </>
  )
}

function DashboardPageHeader () {
  const { startDate, endDate, setDateFilter, range } = useDateFilter()

  const { $t } = useIntl()
  return (
    <PageHeader
      title={$t({ defaultMessage: 'Dashboard' })}
      extra={[
        <VenueFilter key='hierarchy-filter'/>,
        <RangePicker
          key='range-picker'
          selectedRange={{ startDate: moment(startDate), endDate: moment(endDate) }}
          enableDates={dateRangeForLast(3,'months')}
          onDateApply={setDateFilter as CallableFunction}
          showTimePicker
          selectionType={range}
        />,
        <DisabledButton
          tooltipPlacement='topRight'
          key='download'
          icon={<DownloadOutlined />} />
      ]}
    />
  )
}

function ApWidgets () {
  const { filters } = useDashboardFilter()
  return (
    <GridRow>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <TrafficByVolume filters={filters}/>
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <NetworkHistory filters={filters}/>
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <ConnectedClientsOverTime filters={filters}/>
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <TopApplicationsByTraffic filters={filters}/>
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <TopSSIDsByTraffic filters={filters}/>
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <TopSSIDsByClient filters={filters}/>
      </GridCol>
    </GridRow>
  )
}

function SwitchWidgets () {
  const { filters } = useDashboardFilter()
  return (
    <GridRow>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <SwitchesTrafficByVolume filters={filters}/>
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <TopSwitchesByPoEUsage filters={filters}/>
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <TopSwitchesByTraffic filters={filters}/>
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <TopSwitchesByError filters={filters} />
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <TopSwitchModels filters={filters}/>
      </GridCol>
    </GridRow>
  )
}

function CommonDashboardWidgets () {
  const { filters } = useDashboardFilter()

  return (
    <GridRow>
      <GridCol col={{ span: 6 }} style={{ height: '384px' }}>
        <AlarmWidget />
      </GridCol>
      <GridCol col={{ span: 6 }} style={{ height: '384px' }}>
        <IncidentsDashboard filters={filters}/>
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '384px' }}>
        <VenuesHealthDashboard filters={filters}/>
      </GridCol>

      <GridCol col={{ span: 6 }} style={{ height: '176px' }}>
        <VenuesDashboardWidget />
      </GridCol>
      <GridCol col={{ span: 10 }} style={{ height: '176px' }}>
        <DevicesDashboardWidget />
      </GridCol>
      <GridCol col={{ span: 8 }} style={{ height: '176px' }}>
        <ClientsWidget />
      </GridCol>

      <GridCol col={{ span: 24 }} style={{ height: '428px' }}>
        <MapWidget />
      </GridCol>

    </GridRow>
  )
}
