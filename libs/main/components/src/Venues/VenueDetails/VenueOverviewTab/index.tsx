import { useState } from 'react'

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
  GridRow,
  GridCol,
  ContentSwitcherProps,
  ContentSwitcher
} from '@acx-ui/components'
import { TopologyFloorPlanWidget, VenueAlarmWidget, VenueDevicesWidget } from '@acx-ui/rc/components'
import { LowPowerBannerAndModal }                                        from '@acx-ui/rc/components'
import { useGetVenueRadioCustomizationQuery }                            from '@acx-ui/rc/services'
import { ShowTopologyFloorplanOn }                                       from '@acx-ui/rc/utils'
import { useNavigateToPath }                                             from '@acx-ui/react-router-dom'
import { generateVenueFilter, useDateFilter }                            from '@acx-ui/utils'
import type { AnalyticsFilter }                                          from '@acx-ui/utils'

import * as UI from './styledComponents'

export function VenueOverviewTab () {
  const { $t } = useIntl()
  const { dateFilter } = useDateFilter()
  const { venueId } = useParams()
  const venueFilter = {
    ...dateFilter,
    filter: generateVenueFilter([venueId as string])
  }
  const { data: venueRadio } = useGetVenueRadioCustomizationQuery( { params: { venueId } })

  console.log(venueRadio)
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
    <LowPowerBannerAndModal from={'venue'} />
    <CommonDashboardWidgets filters={venueFilter}/>
    <ContentSwitcher tabDetails={tabDetails} size='large' />
  </>)
}

function CommonDashboardWidgets (props: { filters: AnalyticsFilter }) {
  const { venueId } = useParams()
  const [incidentCount, setIncidentCount] = useState(0)
  const onIncidentClick =
    useNavigateToPath(`/venues/${venueId}/venue-details/analytics/incidents/overview`)

  const filters = props.filters
  return (
    <GridRow>
      <GridCol col={{ span: 7 }} style={{ height: '176px' }}>
        <VenueAlarmWidget />
      </GridCol>
      <GridCol col={{ span: 7 }} style={{ height: '176px' }}>
        <UI.Container
          incidentCount={incidentCount}
          onClick={incidentCount > 0 ? onIncidentClick : undefined}
        >
          <IncidentBySeverity type='donut' filters={filters} setIncidentCount={setIncidentCount}/>
        </UI.Container>
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
