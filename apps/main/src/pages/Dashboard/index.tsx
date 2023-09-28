import React, { createContext, useState, useContext, Dispatch, SetStateAction  } from 'react'

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
  GridRow,
  GridCol,
  PageHeader,
  RangePicker,
  ContentSwitcher,
  ContentSwitcherProps
} from '@acx-ui/components'
import { VenueFilter }    from '@acx-ui/main/components'
import {
  AlarmWidget,
  ClientsWidget,
  DevicesDashboardWidget,
  MapWidget,
  VenuesDashboardWidget
} from '@acx-ui/rc/components'
import { TenantLink }                                                                    from '@acx-ui/react-router-dom'
import { useDashboardFilter, DateFilter,DateRange, getDateRangeFilter, AnalyticsFilter } from '@acx-ui/utils'

import * as UI from './styledComponents'

interface DashboardFilterContextProps {
  dashboardFilters: AnalyticsFilter;
  setDateFilterState: Dispatch<SetStateAction<DateFilter>>;
}

const DashboardFilterContext = createContext<DashboardFilterContextProps>({
  dashboardFilters: getDateRangeFilter(DateRange.last8Hours) as AnalyticsFilter,
  setDateFilterState: () => {}
})

export const DashboardFilterProvider = ({ children }: { children : React.ReactNode }) => {
  const [dateFilterState, setDateFilterState] = useState<DateFilter>(
    getDateRangeFilter(DateRange.last8Hours)
  )
  const { filters } = useDashboardFilter()
  const { startDate, endDate, range } = dateFilterState.range !== DateRange.custom
    ? getDateRangeFilter(dateFilterState.range)
    : dateFilterState
  const dashboardFilters = { ...filters, startDate, endDate, range }

  return (
    <DashboardFilterContext.Provider value={{ dashboardFilters, setDateFilterState }}>
      {children}
    </DashboardFilterContext.Provider>
  )
}

export const useDashBoardUpdatedFilter = () => {
  const context = useContext(DashboardFilterContext)
  return context
}

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
    <DashboardFilterProvider>
      <DashboardPageHeader />
      <CommonDashboardWidgets />
      <ContentSwitcher
        tabDetails={tabDetails}
        size='large'
        extra={
          <UI.Wrapper>
            <TenantLink to={'/reports'}>
              {$t({ defaultMessage: 'See more reports' })} <UI.ArrowChevronRightIcons />
            </TenantLink>
          </UI.Wrapper>
        }
      />
    </DashboardFilterProvider>
  )
}

function DashboardPageHeader () {
  const { dashboardFilters, setDateFilterState } = useDashBoardUpdatedFilter()
  const { startDate , endDate, range } = dashboardFilters
  const { $t } = useIntl()
  return (
    <PageHeader
      title={$t({ defaultMessage: 'Dashboard' })}
      extra={[
        <VenueFilter/>,
        <RangePicker
          selectedRange={{ startDate: moment(startDate), endDate: moment(endDate) }}
          onDateApply={setDateFilterState as CallableFunction}
          showTimePicker
          selectionType={range}
          showLast8hours
        />
      ]}
    />
  )
}

function ApWidgets () {
  const { dashboardFilters } = useDashBoardUpdatedFilter()
  return (
    <GridRow>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <TrafficByVolume filters={dashboardFilters}/>
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <NetworkHistory filters={dashboardFilters}/>
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <ConnectedClientsOverTime filters={dashboardFilters}/>
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <TopApplicationsByTraffic filters={dashboardFilters}/>
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <TopSSIDsByTraffic filters={dashboardFilters}/>
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <TopSSIDsByClient filters={dashboardFilters}/>
      </GridCol>
    </GridRow>
  )
}

function SwitchWidgets () {
  const { dashboardFilters } = useDashBoardUpdatedFilter()
  return (
    <GridRow>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <SwitchesTrafficByVolume filters={dashboardFilters}/>
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <TopSwitchesByPoEUsage filters={dashboardFilters}/>
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <TopSwitchesByTraffic filters={dashboardFilters}/>
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <TopSwitchesByError filters={dashboardFilters} />
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <TopSwitchModels filters={dashboardFilters}/>
      </GridCol>
    </GridRow>
  )
}

function CommonDashboardWidgets () {
  const { dashboardFilters } = useDashBoardUpdatedFilter()
  return (
    <GridRow>
      <GridCol col={{ span: 6 }} style={{ height: '384px' }}>
        <AlarmWidget />
      </GridCol>
      <GridCol col={{ span: 6 }} style={{ height: '384px' }}>
        <IncidentsDashboard filters={dashboardFilters}/>
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '384px' }}>
        <VenuesHealthDashboard filters={dashboardFilters}/>
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
