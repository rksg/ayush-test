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
  AnalyticsFilter
} from '@acx-ui/analytics/utils'
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
import { ShowTopologyFloorplanOn }            from '@acx-ui/rc/utils'
import { generateVenueFilter, useDateFilter } from '@acx-ui/utils'

export function VenueOverviewTab () {
  const { $t } = useIntl()
  const { dateFilter } = useDateFilter()
  const { venueId } = useParams()
  const venueFilter = {
    ...dateFilter,
    filter: generateVenueFilter([venueId as string])
  }
  const tabDetails: ContentSwitcherProps['tabDetails'] = [
    {
      label: $t({ defaultMessage: 'Wi-Fi' }),
      value: 'ap',
      children: <ApWidgets filters={venueFilter}/>
    },
    {
      label: $t({ defaultMessage: 'Switch' }),
      value: 'switch',
      children: <SwitchWidgets filters={venueFilter}/>
    }
  ]
  return (<>
    <CommonDashboardWidgets filters={venueFilter}/>
    <ContentSwitcher tabDetails={tabDetails} size='large' />
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
        <TopologyFloorPlanWidget
          showTopologyFloorplanOn={ShowTopologyFloorplanOn.VENUE_OVERVIEW}/>
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
