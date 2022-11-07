import React from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import {
  ConnectedClientsOverTime,
  IncidentBySeverity,
  NetworkHistory,
  SwitchesTrafficByVolume,
  TopSwitchModels,
  TopApplicationsByTraffic,
  TopSSIDsByClient,
  TopSSIDsByTraffic,
  TopSwitchesByError,
  TopSwitchesByPoEUsage,
  TopSwitchesByTraffic,
  TrafficByVolume,
  VenueHealth
} from '@acx-ui/analytics/components'
import {
  AnalyticsFilter,
  useAnalyticsFilter } from '@acx-ui/analytics/utils'
import {
  GridRow,
  GridCol,
  ContentSwitcherProps,
  ContentSwitcher
} from '@acx-ui/components'
import {
  TopologyFloorPlanWidget,
  VenueAlarmWidget,
  VenueDevicesWidget
} from '@acx-ui/rc/components'
import { useVenueDetailsHeaderQuery } from '@acx-ui/rc/services'

export function VenueOverviewTab () {
  const { $t } = useIntl()
  const { filters } = useAnalyticsFilter()
  const params = useParams()
  const { data } = useVenueDetailsHeaderQuery({ params })

  const venueApFilter = {
    ...filters,
    path: [{ type: 'zone', name: data?.venue.name }]
  } as AnalyticsFilter

  const venueSwitchFilter = {
    ...filters,
    path: [{ type: 'switchGroup', name: data?.venue.name }]
  } as AnalyticsFilter

  const tabDetails: ContentSwitcherProps['tabDetails'] = [
    {
      label: $t({ defaultMessage: 'Wi-Fi' }),
      value: 'ap',
      children: <ApWidgets filters={venueApFilter}/>
    },
    {
      label: $t({ defaultMessage: 'Switch' }),
      value: 'switch',
      children: <SwitchWidgets filters={venueSwitchFilter}/>
    }
  ]
  return (<>
    <CommonDashboardWidgets filters={venueApFilter}/>
    <ContentSwitcher tabDetails={tabDetails} size='large' space={15} />
  </>)
}

function CommonDashboardWidgets (props: { filters: AnalyticsFilter }) {
  const filters = props.filters
  return (
    <GridRow>
      <GridCol col={{ span: 7 }} style={{ height: '176px' }}>
        <VenueAlarmWidget />
      </GridCol>
      <GridCol col={{ span: 7 }} style={{ height: '176px' }}>
        <IncidentBySeverity type='donut' filters={filters}/>
      </GridCol>
      <GridCol col={{ span: 10 }} style={{ height: '176px' }}>
        <VenueDevicesWidget />
      </GridCol>

      <GridCol col={{ span: 24 }} style={{ height: '88px' }}>
        <VenueHealth filters={filters}/>
      </GridCol>

      <GridCol col={{ span: 24 }} style={{ height: '520px' }}>
        <TopologyFloorPlanWidget />
      </GridCol>
    </GridRow>
  )
}

function ApWidgets (props: { filters: AnalyticsFilter }) {
  const filters = props.filters
  return (
    <GridRow>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <TrafficByVolume filters={filters} />
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <NetworkHistory filters={filters} />
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <ConnectedClientsOverTime filters={filters} />
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <TopApplicationsByTraffic filters={filters} />
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <TopSSIDsByTraffic filters={filters} />
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <TopSSIDsByClient filters={filters} />
      </GridCol>
    </GridRow>
  )
}

function SwitchWidgets (props: { filters: AnalyticsFilter }) {
  const filters = props.filters
  return (
    <GridRow>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <SwitchesTrafficByVolume filters={filters} />
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <TopSwitchesByPoEUsage filters={filters} />
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <TopSwitchesByTraffic filters={filters} />
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <TopSwitchesByError filters={filters} />
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <TopSwitchModels filters={filters} />
      </GridCol>
    </GridRow>
  )
}
