import { useIntl } from 'react-intl'

import { AnalyticsFilter, useAnalyticsFilter } from '@acx-ui/analytics/utils'
import { GridCol, GridRow }                    from '@acx-ui/components'
import { useApDetailsQuery }                   from '@acx-ui/rc/services'
import { WifiEntityEnum }                      from '@acx-ui/rc/utils'
import { useParams }                           from '@acx-ui/react-router-dom'

import { ApProperties } from './ApProperties/ApProperties'

export function ApOverviewTab () {
  const { $t } = useIntl()
  const { filters } = useAnalyticsFilter()
  const params = useParams()
  const payload = {
    entityType: WifiEntityEnum.apsTree,
    fields: ['name', 'venueName', 'deviceGroupName', 'description', 'lastSeenTime',
      'serialNumber', 'apMac', 'IP', 'extIp', 'model', 'fwVersion',
      'meshRole', 'hops', 'apUpRssi', 'deviceStatus', 'deviceStatusSeverity',
      'isMeshEnable', 'lastUpdTime', 'deviceModelType', 'apStatusData.APSystem.uptime',
      'venueId', 'uplink', 'apStatusData', 'apStatusData.cellularInfo'],
    filters: { serialNumber: [params.serialNumber] }
  }
  const apDetailsQuery = useApDetailsQuery({ params, payload })

  const venueApFilter = {
    ...filters
    // path: [{ type: 'zone', name: data?.venue.name }]
  } as AnalyticsFilter

  return (  // TODO: Remove background: '#F7F7F7'
    <GridRow>
      <GridCol col={{ span: 18 }} style={{ height: '152px', background: '#F7F7F7' }}>
        Charts
      </GridCol>
      <GridCol col={{ span: 6 }} style={{ height: '152px', background: '#F7F7F7' }}>
        AP
      </GridCol>
      <GridCol col={{ span: 18 }} style={{ height: '380px', background: '#F7F7F7' }}>
       Floor Plan
      </GridCol>
      <GridCol col={{ span: 6 }} style={{ height: '380px', background: '#F7F7F7' }}>
        <ApProperties apDetailsQuery={apDetailsQuery} />
      </GridCol>
      <ApWidgets filters={venueApFilter}/>
    </GridRow>
  )
}

function ApWidgets (props: { filters: AnalyticsFilter }) {
  const filters = props.filters
  return (
    <>
      <GridCol col={{ span: 12 }} style={{ height: '280px', background: '#F7F7F7' }}>
      Traffic by Volume
        {/* <AnalyticsWidgets name='trafficByVolume' filters={filters}/> */}
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px', background: '#F7F7F7' }}>
      Network History
        {/* <AnalyticsWidgets name='networkHistory' filters={filters}/> */}
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px', background: '#F7F7F7' }}>
      Connected Clients Over Time
        {/* <AnalyticsWidgets name='connectedClientsOverTime' filters={filters}/> */}
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px', background: '#F7F7F7' }}>
      Top 5 Applications by Traffic
        {/* <AnalyticsWidgets name='topApplicationsByTraffic' filters={filters}/> */}
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px', background: '#F7F7F7' }}>
      Top 5 SSIDs by Traffic
        {/* <AnalyticsWidgets name='topSSIDsByTraffic' filters={filters}/> */}
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px', background: '#F7F7F7' }}>
      Top 5 SSIDs by Clients
        {/* <AnalyticsWidgets name='topSSIDsByClient' filters={filters}/> */}
      </GridCol>
    </>
  )
}