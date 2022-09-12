import React from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import {
  AnalyticsFilter,
  AnalyticsFilterProvider,
  useAnalyticsFilter } from '@acx-ui/analytics/utils'
import {
  GridRow,
  GridCol,
  ContentSwitcherProps,
  ContentSwitcher
} from '@acx-ui/components'
import { useVenueDetailsHeaderQuery } from '@acx-ui/rc/services'

const WifiWidgets = React.lazy(() => import('rc/Widgets'))
const AnalyticsWidgets = React.lazy(() => import('analytics/Widgets'))

export function VenueOverviewTab () {
  const { $t } = useIntl()
  const { filters } = useAnalyticsFilter()
  const params = useParams()
  const { data } = useVenueDetailsHeaderQuery({ params })

  const venueFilter = {
    ...filters,
    path: [filters.path[0], { type: 'zone', name: data?.venue.name }]
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
  return (
    <AnalyticsFilterProvider>
      <CommonDashboardWidgets filters={venueFilter}/>
      <ContentSwitcher tabDetails={tabDetails} size='large' space={15} />
    </AnalyticsFilterProvider>
  )
}

function CommonDashboardWidgets (props: { filters: AnalyticsFilter }) {
  const filters = props.filters
  return (
    <GridRow>
      <GridCol col={{ span: 7 }} style={{ height: '176px' }}>
        <WifiWidgets name='venueAlarmDonut' />
      </GridCol>
      <GridCol col={{ span: 7 }} style={{ height: '176px' }}>
        <AnalyticsWidgets name='venueIncidentsDonut' filters={filters}/>
      </GridCol>
      <GridCol col={{ span: 10 }} style={{ height: '176px' }}>
        <AnalyticsWidgets name='venueDevices' filters={filters}/>
      </GridCol>

      <GridCol col={{ span: 24 }} style={{ height: '88px' }}>
        <WifiWidgets name='venueHealth' />
      </GridCol>

      <GridCol col={{ span: 24 }} style={{ height: '440px' }}>
        <WifiWidgets name='topologyAndFloormaps' />
      </GridCol>
    </GridRow>
  )
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

function SwitchWidgets (props: { filters: AnalyticsFilter }) {
  const filters = props.filters
  return (
    <GridRow>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <AnalyticsWidgets name='switchTrafficByVolume' filters={filters}/>
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <AnalyticsWidgets name='topSwitchesByPoeUsage' filters={filters}/>
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <AnalyticsWidgets name='topSwitchesByTraffic' filters={filters}/>
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <AnalyticsWidgets name='topSwitchesByErrors'filters={filters} />
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <AnalyticsWidgets name='topSwitchModelsByCount' filters={filters}/>
      </GridCol>
    </GridRow>
  )
}
