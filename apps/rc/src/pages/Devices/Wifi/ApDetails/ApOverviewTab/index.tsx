import { AnalyticsFilter, useAnalyticsFilter } from '@acx-ui/analytics/utils'
import { GridCol, GridRow } from '@acx-ui/components'
import React from 'react'
import { useIntl } from 'react-intl'

const AnalyticsWidgets = React.lazy(() => import('analytics/Widgets'))

export function ApOverviewTab () {
  const { $t } = useIntl()
  const { filters } = useAnalyticsFilter()
  // const params = useParams()
  // const { data } = useVenueDetailsHeaderQuery({ params })

  const venueApFilter = {
    ...filters,
    // path: [{ type: 'zone', name: data?.venue.name }]
  } as AnalyticsFilter

  return (<>
    <ApWidgets filters={venueApFilter}/>
  </>)
}

function ApWidgets (props: { filters: AnalyticsFilter }) {
  const filters = props.filters
  return (
    <GridRow>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <AnalyticsWidgets name='trafficByVolume' filters={filters}/>
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <AnalyticsWidgets name='networkHistory' filters={filters}/>
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <AnalyticsWidgets name='connectedClientsOverTime' filters={filters}/>
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <AnalyticsWidgets name='topApplicationsByTraffic' filters={filters}/>
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <AnalyticsWidgets name='topSSIDsByTraffic' filters={filters}/>
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <AnalyticsWidgets name='topSSIDsByClient' filters={filters}/>
      </GridCol>
    </GridRow>
  )
}