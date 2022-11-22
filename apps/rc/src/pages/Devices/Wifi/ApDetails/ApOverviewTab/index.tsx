import { AnalyticsFilter, useAnalyticsFilter } from '@acx-ui/analytics/utils'
import { GridCol, GridRow }                    from '@acx-ui/components'
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
import { ApInfoWidget } from '@acx-ui/rc/components'
import { useApDetailsQuery, useApViewModelQuery } from '@acx-ui/rc/services'
import { ApViewModel } from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

import { ApProperties } from './ApProperties'

export function ApOverviewTab () {
  const { filters } = useAnalyticsFilter()
  const params = useParams()
  const apViewModelPayload = {
    fields: ['name', 'venueName', 'deviceGroupName', 'description', 'lastSeenTime',
      'serialNumber', 'apMac', 'IP', 'extIp', 'model', 'fwVersion',
      'meshRole', 'hops', 'apUpRssi', 'deviceStatus', 'deviceStatusSeverity',
      'isMeshEnable', 'lastUpdTime', 'deviceModelType', 'apStatusData.APSystem.uptime',
      'venueId', 'uplink', 'apStatusData', 'apStatusData.cellularInfo', 'tags'],
    filters: { serialNumber: [params.serialNumber] }
  }
  const apViewModelQuery = useApViewModelQuery({ params, payload: apViewModelPayload })
  const apDetailsQuery = useApDetailsQuery({ params })
  const venueApFilter = {
    ...filters
    // path: [{ type: 'zone', name: data?.venue.name }]
  } as AnalyticsFilter

  return (  // TODO: Remove background: '#F7F7F7' and Add other widgets
    <GridRow>
      <GridCol col={{ span: 18 }} style={{ height: '152px' }}>
       <ApInfoWidget currentAP={apViewModelQuery.data as ApViewModel} filters={filters} />
      </GridCol>
      <GridCol col={{ span: 6 }} style={{ height: '152px', background: '#F7F7F7' }}>
        AP
      </GridCol>
      <GridCol col={{ span: 18 }} style={{ background: '#F7F7F7' }}>
       Floor Plan
      </GridCol>
      <GridCol col={{ span: 6 }}>
        <ApProperties apViewModelQuery={apViewModelQuery} apDetailsQuery={apDetailsQuery} />
      </GridCol>
      <ApWidgets filters={venueApFilter}/>
    </GridRow>
  )
}

function ApWidgets (props: { filters: AnalyticsFilter }) {
  const filters = props.filters
  console.log(filters) // eslint-disable-line no-console
  return (
    <>
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
    </>
  )
}