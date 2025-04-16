import React, { createContext, Dispatch, SetStateAction, useContext, useEffect, useState } from 'react'

import { Divider, Menu } from 'antd'
import moment            from 'moment-timezone'
import { useIntl }       from 'react-intl'

import {
  ClientExperience,
  ConnectedClientsOverTime,
  DidYouKnow,
  IncidentsDashboardv2,
  SwitchesTrafficByVolume,
  SwitchesTrafficByVolumeLegacy,
  TopAppsByTraffic,
  TopEdgesByResources,
  TopEdgesByTraffic,
  TopSwitchesByError,
  TopSwitchesByPoEUsage,
  TopSwitchesByTraffic,
  TopSwitchModels,
  TopWiFiNetworks,
  TrafficByVolume
} from '@acx-ui/analytics/components'
import {
  Button,
  ContentSwitcher,
  ContentSwitcherProps,
  Dropdown,
  GridCol,
  GridRow,
  PageHeader,
  RangePicker
} from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { VenueFilter }            from '@acx-ui/main/components'
import {
  AlarmWidgetV2,
  ClientsWidgetV2,
  DevicesDashboardWidgetV2,
  MapWidgetV2,
  useIsEdgeReady,
  VenuesDashboardWidgetV2
} from '@acx-ui/rc/components'
import {
  CommonUrlsInfo,
  EdgeUrlsInfo,
  SwitchRbacUrlsInfo,
  WifiRbacUrlsInfo
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'
import {
  EdgeScopes,
  RolesEnum,
  SwitchScopes,
  WifiScopes
}                                               from '@acx-ui/types'
import {
  hasCrossVenuesPermission,
  filterByAccess,
  getShowWithoutRbacCheckKey,
  hasPermission,
  hasRoles,
  getUserProfile,
  hasAllowedOperations,
  isCoreTier
} from '@acx-ui/user'
import {
  AnalyticsFilter,
  DateFilter,
  DateRange,
  getDatePickerValues,
  LoadTimeContext,
  getDateRangeFilter,
  getOpsApi,
  useDashboardFilter
} from '@acx-ui/utils'

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
  const { startDate, endDate, range } = getDatePickerValues(dateFilterState)
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
  const { accountTier } = getUserProfile()
  const isEdgeEnabled = useIsEdgeReady()
  const isCore = isCoreTier(accountTier)

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
    ...(isEdgeEnabled ? [
      {
        label: $t({ defaultMessage: 'RUCKUS Edge' }),
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
      {isCore ? <CoreDashboardWidgets /> : <CommonDashboardWidgets />}
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
  const { onPageFilterChange } = useContext(LoadTimeContext)

  const { startDate , endDate, range } = dashboardFilters
  const { rbacOpsApiEnabled } = getUserProfile()
  const { $t } = useIntl()
  const isEdgeEnabled = useIsEdgeReady()
  const isDateRangeLimit = useIsSplitOn(Features.ACX_UI_DATE_RANGE_LIMIT)

  const hasCreatePermission = hasPermission({
    scopes: [WifiScopes.CREATE, SwitchScopes.CREATE, EdgeScopes.CREATE],
    rbacOpsIds: [
      getOpsApi(WifiRbacUrlsInfo.addAp),
      getOpsApi(SwitchRbacUrlsInfo.addSwitch),
      [
        getOpsApi(EdgeUrlsInfo.addEdge),
        getOpsApi(EdgeUrlsInfo.addEdgeCluster)
      ]
    ]
  })

  const hasAddVenuePermission = rbacOpsApiEnabled ?
    hasAllowedOperations([getOpsApi(CommonUrlsInfo.addVenue)])
    : hasRoles([RolesEnum.PRIME_ADMIN, RolesEnum.ADMINISTRATOR]) &&
  hasCrossVenuesPermission()

  const hasAddNetworkPermission = rbacOpsApiEnabled ?
    hasAllowedOperations([getOpsApi(WifiRbacUrlsInfo.addNetworkDeep)])
    : hasPermission({ scopes: [WifiScopes.CREATE] }) &&
  hasCrossVenuesPermission()

  const addMenu = <Menu
    expandIcon={<UI.MenuExpandArrow />}
    items={[
      ...(hasAddVenuePermission ? [{
        key: 'add-venue',
        label: <TenantLink to='venues/add'>
          {$t({ defaultMessage: '<VenueSingular></VenueSingular>' })}
        </TenantLink>
      }]: []),
      ...(hasAddNetworkPermission ? [{
        key: 'add-wifi-network',
        label: <TenantLink to='networks/wireless/add'>{
          $t({ defaultMessage: 'Wi-Fi Network' })}
        </TenantLink>
      }] : []),
      ...( hasCreatePermission ? [{
        key: 'add-device',
        label: $t({ defaultMessage: 'Device' }),
        // type: 'group',
        children: [
          ...( hasPermission({ scopes: [WifiScopes.CREATE],
            rbacOpsIds: [getOpsApi(WifiRbacUrlsInfo.addAp)] }) ? [{
              key: 'add-ap',
              label: <TenantLink to='devices/wifi/add'>
                {$t({ defaultMessage: 'Wi-Fi AP' })}
              </TenantLink>
            }] : []),
          ...( hasPermission({ scopes: [SwitchScopes.CREATE],
            rbacOpsIds: [getOpsApi(SwitchRbacUrlsInfo.addSwitch)]
          }) ? [{
              key: 'add-switch',
              label: <TenantLink to='devices/switch/add'>
                {$t({ defaultMessage: 'Switch' })}
              </TenantLink>
            }] : []),
          ...(isEdgeEnabled &&
            hasPermission({
              scopes: [EdgeScopes.CREATE],
              rbacOpsIds: [
                [
                  getOpsApi(EdgeUrlsInfo.addEdge),
                  getOpsApi(EdgeUrlsInfo.addEdgeCluster)
                ]
              ]
            })) ? [{
              key: 'add-edge',
              label: <TenantLink to='devices/edge/add'>{
                $t({ defaultMessage: 'RUCKUS Edge' })
              }</TenantLink>
            }] : []
        ]
      }] : [])
    ]}
  />

  useEffect(() => {
    onPageFilterChange?.(dashboardFilters, true)
  }, [])

  useEffect(() => {
    onPageFilterChange?.(dashboardFilters)
  }, [dashboardFilters])

  return (
    <PageHeader
      title={''}
      extra={[
        ...filterByAccess([
          <Dropdown overlay={addMenu}
            placement={'bottomRight'}
            rbacOpsIds={[
              getOpsApi(WifiRbacUrlsInfo.addAp),
              getOpsApi(SwitchRbacUrlsInfo.addSwitch),
              [
                getOpsApi(EdgeUrlsInfo.addEdge),
                getOpsApi(EdgeUrlsInfo.addEdgeCluster)
              ],
              getOpsApi(WifiRbacUrlsInfo.addNetworkDeep),
              getOpsApi(CommonUrlsInfo.addVenue)
            ]}
            scopeKey={[WifiScopes.CREATE, SwitchScopes.CREATE, EdgeScopes.CREATE]}>{() =>
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
          maxMonthRange={isDateRangeLimit ? 1 : 3}
        />
      ]}
    />
  )
}

function ApWidgets () {
  const { dashboardFilters } = useDashBoardUpdatedFilter()
  const { accountTier } = getUserProfile()
  const isCore = isCoreTier(accountTier)

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
      {!isCore && <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <TopAppsByTraffic filters={dashboardFilters}/>
      </GridCol>}

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
  const supportPortTraffic = useIsSplitOn(Features.SWITCH_PORT_TRAFFIC)
  return (
    <GridRow>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        {
          supportPortTraffic ?
            <SwitchesTrafficByVolume filters={dashboardFilters} vizType={'area'} />
            :<SwitchesTrafficByVolumeLegacy filters={dashboardFilters} vizType={'area'} />
        }
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

function CoreDashboardWidgets () {
  const { dashboardFilters } = useDashBoardUpdatedFilter()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <GridRow>
      <GridCol col={{ span: 18 }} style={{ height: '410px' }}>
        <GridRow>
          <GridCol col={{ span: 12 }} style={{ height: '200px' }}>
            <AlarmWidgetV2 />
          </GridCol>
          <GridCol col={{ span: 12 }} style={{ height: '200px' }}>
            <VenuesDashboardWidgetV2 />
          </GridCol>
        </GridRow>
        <GridRow style={{ marginTop: '10px' }}>
          <GridCol col={{ span: 12 }} style={{ height: '200px' }}>
            <DevicesDashboardWidgetV2 />
          </GridCol>
          <GridCol col={{ span: 12 }} style={{ height: '200px' }}>
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


function CommonDashboardWidgets () {
  const { dashboardFilters } = useDashBoardUpdatedFilter()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

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
