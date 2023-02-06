import {
  ConnectedClientsOverTime,
  NetworkHistory,
  TopApplicationsByTraffic,
  TrafficByVolume,
  VenueHealth
} from '@acx-ui/analytics/components'
import { 
  AnalyticsFilter,
  defaultNetworkPath
} from '@acx-ui/analytics/utils'
import {
  GridRow,
  GridCol,
} from '@acx-ui/components'
import { useDateFilter } from '@acx-ui/utils'

import { getSSIDFilter } from '../services'

export function NetworkOverviewTab () {
  const { dateFilter } = useDateFilter()
  const ssids =  getSSIDFilter()
  const filters = {
    ...dateFilter,
    path: defaultNetworkPath,
    filter: { ssids }
  } as AnalyticsFilter
  return (
    <GridRow>
      <GridCol col={{ span: 24 }} style={{ height: '88px' }}>
        Incidents Overview
      </GridCol>
      <GridCol col={{ span: 24 }} style={{ height: '88px' }}>
        <VenueHealth filters={filters}/>
      </GridCol>
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
  </GridRow>
  )
}
