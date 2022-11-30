import { useEffect, useState } from 'react'

import {
  ConnectedClientsOverTime,
  NetworkHistory,
  TopApplicationsByTraffic,
  TopSSIDsByClient,
  TopSSIDsByTraffic,
  TrafficByVolume
} from '@acx-ui/analytics/components'
import { AnalyticsFilter, useAnalyticsFilter }    from '@acx-ui/analytics/utils'
import { GridCol, GridRow }                       from '@acx-ui/components'
import { ApInfoWidget }                           from '@acx-ui/rc/components'
import { useApDetailsQuery, useApViewModelQuery } from '@acx-ui/rc/services'
import { ApDetails, ApViewModel }                 from '@acx-ui/rc/utils'
import { useParams }                              from '@acx-ui/react-router-dom'

import { ApProperties } from './ApProperties'

export function ApOverviewTab () {
  const { filters } = useAnalyticsFilter()
  const [ apFilter, setApFilter ] = useState(null as unknown as AnalyticsFilter)
  const params = useParams()
  const apViewModelPayload = {
    fields: ['name', 'venueName', 'deviceGroupName', 'description', 'lastSeenTime',
      'serialNumber', 'apMac', 'IP', 'extIp', 'model', 'fwVersion',
      'meshRole', 'hops', 'apUpRssi', 'deviceStatus', 'deviceStatusSeverity',
      'isMeshEnable', 'lastUpdTime', 'deviceModelType', 'apStatusData.APSystem.uptime',
      'venueId', 'uplink', 'apStatusData', 'apStatusData.cellularInfo', 'tags'],
    filters: { serialNumber: [params.serialNumber] }
  }
  const { data: currentAP, isLoading: isLoadingApViewModel, isFetching: isFetchingApViewModel }
  = useApViewModelQuery({
    params, payload: apViewModelPayload
  })
  const { data: apDetails, isLoading: isLoadingApDetails, isFetching: isFetchingApDetails }
  = useApDetailsQuery({ params })
  useEffect(() => {
    if(currentAP) {
      setApFilter({
        ...filters,
        path: [{ type: 'AP', name: currentAP.apMac as string }]
      })
    }
  }, [currentAP])


  return (  // TODO: Remove background: '#F7F7F7' and Add other widgets
    <GridRow>
      <GridCol col={{ span: 18 }} style={{ height: '152px' }}>
        { apFilter && <ApInfoWidget currentAP={currentAP as ApViewModel} filters={apFilter} /> }
      </GridCol>
      <GridCol col={{ span: 6 }} style={{ height: '152px', background: '#F7F7F7' }}>
        AP Photo
      </GridCol>
      <GridCol col={{ span: 18 }} style={{ background: '#F7F7F7' }}>
        Floor Plan
      </GridCol>
      <GridCol col={{ span: 6 }}>
        <ApProperties
          currentAP={currentAP as ApViewModel}
          apDetails={apDetails as ApDetails}
          isLoading={
            isLoadingApViewModel || isLoadingApDetails ||
            isFetchingApViewModel || isFetchingApDetails
          }
        />
      </GridCol>
      { apFilter && <ApWidgets filters={apFilter}/> }
    </GridRow>
  )
}

function ApWidgets (props: { filters: AnalyticsFilter }) {
  const filters = props.filters
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