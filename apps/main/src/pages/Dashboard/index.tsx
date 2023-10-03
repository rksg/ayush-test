import React, { createContext, useState, useContext, Dispatch, SetStateAction  } from 'react'

import { Divider, Menu } from 'antd'
import moment            from 'moment-timezone'
import { useIntl }       from 'react-intl'

import {
  ConnectedClientsOverTime,
  IncidentsDashboardv2,
  ClientExperience,
  SwitchesTrafficByVolume,
  TopAppsByTraffic,
  TopSwitchesByError,
  TopSwitchesByPoEUsage,
  TopSwitchesByTraffic,
  TopSwitchModels,
  TrafficByVolume,
  DidYouKnow,
  TopWiFiNetworks,
  TopEdgesByTraffic,
  TopEdgesByResources } from '@acx-ui/analytics/components'
import {
  Button,
  Dropdown,
  GridRow,
  GridCol,
  PageHeader,
  RangePicker,
  ContentSwitcher,
  ContentSwitcherProps
} from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { VenueFilter }                              from '@acx-ui/main/components'
import {
  AlarmWidgetV2,
  ClientsWidgetV2,
  DevicesDashboardWidgetV2,
  MapWidgetV2,
  VenuesDashboardWidgetV2
} from '@acx-ui/rc/components'
import { TenantLink }                                                                    from '@acx-ui/react-router-dom'
import { filterByAccess, getShowWithoutRbacCheckKey }                                    from '@acx-ui/user'
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
  const isEdgeEnabled = useIsTierAllowed(Features.EDGES)
  const isEdgeReady = useIsSplitOn(Features.EDGES_TOGGLE)

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
    },
    ...(isEdgeEnabled && isEdgeReady ? [
      {
        label: $t({ defaultMessage: 'SmartEdge' }),
        value: 'edge',
        children: <EdgeWidgets />
      }
    ] : [])
  ]

  /**
   * Sets the selected tab value in local storage.
   *
   * @param {string} value - The value of the selected tab.
   * @return {void} This function does not return anything.
   */
  const onTabChange = (value: string): void => {
    localStorage.setItem('dashboard-tab', value)
  }

  return (
    <DashboardFilterProvider>
      <DashboardPageHeader />
      <CommonDashboardWidgets />
      <Divider dashed
        style={{
          borderColor: 'var(--acx-neutrals-30)',
          margin: '20px 0px 5px 0px' }}/>
      <ContentSwitcher
        tabDetails={tabDetails}
        size='large'
        defaultValue={localStorage.getItem('dashboard-tab') || tabDetails[0].value}
        onChange={onTabChange}
        extra={
          <UI.Wrapper>
            <TenantLink to={'/reports'}>
              {$t({ defaultMessage: 'See more reports' })} <UI.ArrowChevronRightIcons />
            </TenantLink>
          </UI.Wrapper>
        }
      />
      <Divider dashed
        style={{
          borderColor: 'var(--acx-neutrals-30)',
          margin: '20px 0px' }}/>
      <DashboardMapWidget />
    </DashboardFilterProvider>
  )
}

function DashboardPageHeader () {
  const { dashboardFilters, setDateFilterState } = useDashBoardUpdatedFilter()
  const { startDate , endDate, range } = dashboardFilters
  const { $t } = useIntl()

  const addMenu = <Menu
    expandIcon={<UI.MenuExpandArrow />}
    items={[{
      key: 'add-venue',
      label: <TenantLink to='venues/add'>{$t({ defaultMessage: 'Venue' })}</TenantLink>
    }, {
      key: 'add-wifi-network',
      label: <TenantLink to='networks/wireless/add'>{
        $t({ defaultMessage: 'Wi-Fi Network' })}
      </TenantLink>
    }, {
      key: 'add-device',
      label: $t({ defaultMessage: 'Device' }),
      // type: 'group',
      children: [{
        key: 'add-ap',
        label: <TenantLink to='devices/wifi/add'>{$t({ defaultMessage: 'Wi-Fi AP' })}</TenantLink>
      }, {
        key: 'add-switch',
        label: <TenantLink to='devices/switch/add'>{$t({ defaultMessage: 'Switch' })}</TenantLink>
      }, {
        key: 'add-edge',
        label: <TenantLink to='devices/edge/add'>{$t({ defaultMessage: 'SmartEdge' })}</TenantLink>
      }]
    }]}
  />

  return (
    <PageHeader
      title={''}
      extra={[
        ...filterByAccess([
          <Dropdown overlay={addMenu} placement={'bottomRight'}>{() =>
            <Button type='primary'>{ $t({ defaultMessage: 'Add...' }) }</Button>
          }</Dropdown>
        ]),
        <VenueFilter key={getShowWithoutRbacCheckKey('hierarchy-filter')}/>,
        <RangePicker
          key={getShowWithoutRbacCheckKey('range-picker')}
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
        <TrafficByVolume filters={dashboardFilters} vizType={'area'} />
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <ConnectedClientsOverTime filters={dashboardFilters} vizType={'area'} />
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <TopWiFiNetworks filters={dashboardFilters}/>
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <TopAppsByTraffic filters={dashboardFilters}/>
      </GridCol>
    </GridRow>
  )
}

function DashboardMapWidget () {
  return (
    <GridRow>
      <GridCol col={{ span: 24 }} style={{ height: '428px' }}>
        <MapWidgetV2 />
      </GridCol>
    </GridRow>
  )
}

function SwitchWidgets () {
  const { dashboardFilters } = useDashBoardUpdatedFilter()
  return (
    <GridRow>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <SwitchesTrafficByVolume filters={dashboardFilters} vizType={'area'} />
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

function EdgeWidgets () {
  const { dashboardFilters } = useDashBoardUpdatedFilter()
  return (
    <GridRow>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <TopEdgesByTraffic filters={dashboardFilters} />
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <TopEdgesByResources filters={dashboardFilters} />
      </GridCol>
    </GridRow>
  )
}

function CommonDashboardWidgets () {
  const { dashboardFilters } = useDashBoardUpdatedFilter()

  return (
    <GridRow>
      <GridCol col={{ span: 18 }} style={{ height: '410px' }}>
        <GridRow>
          <GridCol col={{ span: 8 }} style={{ height: '200px' }}>
            <AlarmWidgetV2 />
          </GridCol>
          <GridCol col={{ span: 8 }} style={{ height: '200px' }}>
            <IncidentsDashboardv2 filters={dashboardFilters} />
          </GridCol>
          <GridCol col={{ span: 8 }} style={{ height: '200px' }}>
            <ClientExperience filters={dashboardFilters}/>
          </GridCol>
        </GridRow>
        <GridRow style={{ marginTop: '10px' }}>
          <GridCol col={{ span: 8 }} style={{ height: '200px' }}>
            <VenuesDashboardWidgetV2 />
          </GridCol>
          <GridCol col={{ span: 8 }} style={{ height: '200px' }}>
            <DevicesDashboardWidgetV2 />
          </GridCol>
          <GridCol col={{ span: 8 }} style={{ height: '200px' }}>
            <ClientsWidgetV2 />
          </GridCol>
        </GridRow>
      </GridCol>
      <GridCol col={{ span: 6 }} style={{ height: '410px' }}>
        <DidYouKnow filters={dashboardFilters}/>
      </GridCol>
    </GridRow>
  )
}
