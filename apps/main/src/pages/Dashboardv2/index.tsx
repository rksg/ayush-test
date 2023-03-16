
import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'

import {
  ConnectedClientsOverTime,
  SwitchesTrafficByVolume,
  TopAppsByTraffic,
  TopSSIDsByTraffic,
  TopSwitchesByError,
  TopSwitchesByPoEUsage,
  TopSwitchesByTraffic,
  TopSwitchModels,
  TrafficByVolume } from '@acx-ui/analytics/components'
import {
  GridRow,
  GridCol,
  PageHeader,
  RangePicker,
  ContentSwitcher,
  ContentSwitcherProps,
  Card
} from '@acx-ui/components'
import { VenueFilter }      from '@acx-ui/main/components'
import {
  AlarmWidgetV2,
  ClientsWidgetV2,
  DevicesDashboardWidgetV2,
  MapWidgetV2,
  VenuesDashboardWidgetV2
} from '@acx-ui/rc/components'
import { TenantLink }                        from '@acx-ui/react-router-dom'
import { useDateFilter, useDashboardFilter } from '@acx-ui/utils'

import * as UI from './styledComponents'

export default function Dashboardv2 () {
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
      <DashboardMapWidget />
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
          onDateApply={setDateFilter as CallableFunction}
          showTimePicker
          selectionType={range}
        />
      ]}
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
        <TopSSIDsByTraffic filters={filters}/>
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <TopAppsByTraffic filters={filters}/>
      </GridCol>
    </GridRow>
  )
}

function DashboardMapWidget () {
  return (
    <GridRow style={{ marginTop: '20px' }}>
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

function CommonDashboardWidgets () {
  // const { filters } = useDashboardFilter()

  return (
    <GridRow>
      <GridCol col={{ span: 18 }} style={{ height: '410px' }}>
        <GridRow>
          <GridCol col={{ span: 8 }} style={{ height: '200px' }}>
            <AlarmWidgetV2 />
          </GridCol>
          <GridCol col={{ span: 8 }} style={{ height: '200px' }}>
            <Card title='Incidents'>
            </Card>
          </GridCol>
          <GridCol col={{ span: 8 }} style={{ height: '200px' }}>
            <Card title='Client Experience'>
            </Card>
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
        <Card title='Did you know?'>
        </Card>
      </GridCol>
    </GridRow>
  )
}
