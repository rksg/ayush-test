
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
import { TenantLink }                        from '@acx-ui/react-router-dom'
import { filterByAccess }                    from '@acx-ui/user'
import { useDateFilter, useDashboardFilter } from '@acx-ui/utils'

import * as UI from './styledComponents'

export default function Dashboardv2 () {
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
    <>
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
    </>
  )
}

function DashboardPageHeader () {
  const { startDate, endDate, setDateFilter, range } = useDateFilter()
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
      extra={filterByAccess([
        <Dropdown overlay={addMenu} placement={'bottomRight'}>{() =>
          <Button type='primary'>{ $t({ defaultMessage: 'Add...' }) }</Button>
        }</Dropdown>,
        <VenueFilter key='hierarchy-filter'/>,
        <RangePicker
          key='range-picker'
          selectedRange={{ startDate: moment(startDate), endDate: moment(endDate) }}
          onDateApply={setDateFilter as CallableFunction}
          showTimePicker
          selectionType={range}
        />
      ])}
    />
  )
}

function ApWidgets () {
  const { filters } = useDashboardFilter()
  return (
    <GridRow>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <TrafficByVolume filters={filters} vizType={'area'} />
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <ConnectedClientsOverTime filters={filters} vizType={'area'} />
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <TopWiFiNetworks filters={filters}/>
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <TopAppsByTraffic filters={filters}/>
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
  const { filters } = useDashboardFilter()
  return (
    <GridRow>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <SwitchesTrafficByVolume filters={filters} vizType={'area'} />
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

function EdgeWidgets () {
  const { filters } = useDashboardFilter()
  return (
    <GridRow>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <TopEdgesByTraffic filters={filters} />
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <TopEdgesByResources filters={filters} />
      </GridCol>
    </GridRow>
  )
}

function CommonDashboardWidgets () {
  const { filters } = useDashboardFilter()

  return (
    <GridRow>
      <GridCol col={{ span: 18 }} style={{ height: '410px' }}>
        <GridRow>
          <GridCol col={{ span: 8 }} style={{ height: '200px' }}>
            <AlarmWidgetV2 />
          </GridCol>
          <GridCol col={{ span: 8 }} style={{ height: '200px' }}>
            <IncidentsDashboardv2 filters={filters} />
          </GridCol>
          <GridCol col={{ span: 8 }} style={{ height: '200px' }}>
            <ClientExperience filters={filters}/>
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
        <DidYouKnow filters={filters}/>
      </GridCol>
    </GridRow>
  )
}
