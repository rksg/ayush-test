import {
  ConnectedClientsOverTime,
  VenuesHealthDashboard,
  IncidentBySeverity,
  IncidentsDashboard,
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
import { AnalyticsFilter } from '@acx-ui/analytics/utils'
import { Card }            from '@acx-ui/components'
import { Provider }        from '@acx-ui/store'

const widgetsMap = {
  trafficByVolume: TrafficByVolume,
  networkHistory: NetworkHistory,
  topApplicationsByTraffic: TopApplicationsByTraffic,
  topSSIDsByTraffic: TopSSIDsByTraffic,
  topSSIDsByClient: TopSSIDsByClient,
  connectedClientsOverTime: ConnectedClientsOverTime,
  topSwitchesByPoeUsage: TopSwitchesByPoEUsage,
  switchTrafficByVolume: SwitchesTrafficByVolume,
  topSwitchesByErrors: TopSwitchesByError,
  topSwitchModelsByCount: TopSwitchModels,
  topSwitchesByTraffic: TopSwitchesByTraffic,
  incidents: IncidentsDashboard,
  venueIncidentsDonut: ({ filters }: { filters: AnalyticsFilter }) => (
    <IncidentBySeverity type='donut' filters={filters} />
  ),
  venueHealth: VenueHealth,
  health: VenuesHealthDashboard
}

function AnalyticsWidgets ({
  name,
  filters
}: {
  name: keyof typeof widgetsMap;
  filters: AnalyticsFilter;
}) {
  const Widget = widgetsMap[name]
  return <Provider>{Widget ? <Widget filters={filters} /> : <Card>{name}</Card>}</Provider>
}

export default AnalyticsWidgets
