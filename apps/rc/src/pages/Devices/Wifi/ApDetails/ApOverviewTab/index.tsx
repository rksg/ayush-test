import { AnalyticsFilter, useAnalyticsFilter }    from '@acx-ui/analytics/utils'
import { GridCol, GridRow }                       from '@acx-ui/components'

import { ApProperties } from './ApProperties'

export function ApOverviewTab () {
  const { filters } = useAnalyticsFilter()

  const venueApFilter = {
    ...filters
    // path: [{ type: 'zone', name: data?.venue.name }]
  } as AnalyticsFilter

  return (  // TODO: Remove background: '#F7F7F7' and Add other widgets
    <GridRow>
      <GridCol col={{ span: 18 }} style={{ height: '152px', background: '#F7F7F7' }}>
        Charts
      </GridCol>
      <GridCol col={{ span: 6 }} style={{ height: '152px', background: '#F7F7F7' }}>
        AP
      </GridCol>
      <GridCol col={{ span: 18 }} style={{ background: '#F7F7F7' }}>
       Floor Plan
      </GridCol>
      <GridCol col={{ span: 6 }} style={{ background: '#F7F7F7' }}>
        <ApProperties />
      </GridCol>
      <ApWidgets filters={venueApFilter}/>
    </GridRow>
  )
}

function ApWidgets (props: { filters: AnalyticsFilter }) { // TODO: Add charts
  const filters = props.filters
  console.log(filters) // eslint-disable-line no-console
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