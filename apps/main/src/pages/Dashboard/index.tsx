import React, { useContext, useDebugValue } from 'react'

import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'
import { useSplitTreatmentWithConfig } from '@acx-ui/feature-toggle'

import {
  Button,
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
import { useDateFilter, dateRangeForLast, DashboardFilterProvider, useDashboardFilter } from '@acx-ui/utils'

import VenueFilter from '../../components/VenueFilter'

const WifiWidgets = React.lazy(() => import('rc/Widgets'))
const AnalyticsWidgets = React.lazy(() => import('analytics/Widgets'))

export default function Dashboard () {
  const { $t } = useIntl()
  console.log('PLM FF', useSplitTreatmentWithConfig('ADMIN-BASE'))

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
    <DashboardFilterProvider>
      <DashboardPageHeader />
      <CommonDashboardWidgets />
      <ContentSwitcher tabDetails={tabDetails} size='large' space={15} />
    </DashboardFilterProvider>
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
        <Button key='download' icon={<DownloadOutlined />} />
      ]}
    />
  )
}

function ApWidgets () {
  const { filters } = useDashboardFilter()
  return (
    <GridRow>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <AnalyticsWidgets name='trafficByVolume' filters={filters}/>
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <AnalyticsWidgets name='networkHistory' filters={filters}/>
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <AnalyticsWidgets name='connectedClientsOverTime' filters={filters}/>
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <AnalyticsWidgets name='topApplicationsByTraffic' filters={filters}/>
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <AnalyticsWidgets name='topSSIDsByTraffic' filters={filters}/>
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <AnalyticsWidgets name='topSSIDsByClient' filters={filters}/>
      </GridCol>
    </GridRow>
  )
}

function SwitchWidgets () {
  const { filters } = useDashboardFilter()
  return (
    <GridRow>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <AnalyticsWidgets name='switchTrafficByVolume' filters={filters}/>
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <AnalyticsWidgets name='topSwitchesByPoeUsage' filters={filters}/>
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <AnalyticsWidgets name='topSwitchesByTraffic' filters={filters}/>
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <AnalyticsWidgets name='topSwitchesByErrors'filters={filters} />
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <AnalyticsWidgets name='topSwitchModelsByCount' filters={filters}/>
      </GridCol>
    </GridRow>
  )
}

function CommonDashboardWidgets () {
  const { filters } = useDashboardFilter()

  return (
    <GridRow>
      <GridCol col={{ span: 6 }} style={{ height: '384px' }}>
        <WifiWidgets name='alarms' />
      </GridCol>
      <GridCol col={{ span: 6 }} style={{ height: '384px' }}>
        <AnalyticsWidgets name='incidents' filters={filters}/>
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '384px' }}>
        <AnalyticsWidgets name='health' filters={filters}/>
      </GridCol>

      <GridCol col={{ span: 6 }} style={{ height: '176px' }}>
        <WifiWidgets name='venues' />
      </GridCol>
      <GridCol col={{ span: 10 }} style={{ height: '176px' }}>
        <WifiWidgets name='devices' />
      </GridCol>
      <GridCol col={{ span: 8 }} style={{ height: '176px' }}>
        <WifiWidgets name='clients' />
      </GridCol>

      <GridCol col={{ span: 24 }} style={{ height: '428px' }}>
        <WifiWidgets name='map' />
      </GridCol>

    </GridRow>
  )
}
