import { AnalyticsFilter } from '@acx-ui/analytics/utils'
import { Card }            from '@acx-ui/components'
import { Provider }        from '@acx-ui/store'

import ConnectedClientsOverTimeWidget from './components/ConnectedClientsOverTime'
import HealthWidget                   from './components/HealthWidget'
import VenueIncidentsWidget           from './components/IncidentBySeverity/VenueIncidentsDonut'
import IncidentsDashboardWidget       from './components/IncidentsDashboard'
import NetworkHistoryWidget           from './components/NetworkHistory'
import SwitchesTrafficByVolumeWidget  from './components/SwitchesTrafficByVolume'
import TopSwitchModelsWidget          from './components/SwitchModels'
import TopApplicationsByTrafficWidget from './components/TopApplicationsByTraffic'
import TopSSIDsByClientWidget         from './components/TopSSIDsByClient'
import TopSSIDsByTrafficWidget        from './components/TopSSIDsByTraffic'
import TopSwitchesByErrorWidget       from './components/TopSwitchesByError'
import TopSwitchesByPoEUsageWidget    from './components/TopSwitchesByPoEUsage'
import TopSwitchesByTrafficWidget     from './components/TopSwitchesByTraffic'
import TrafficByVolumeWidget          from './components/TrafficByVolume'
import VenueHealthWidget              from './components/VenueHealthWidget'
import HealthPage                     from './pages/Health'
import { IncidentTabContent }         from './pages/Incidents'
const widgetsMap = {
  trafficByVolume: ({ filters }: { filters: AnalyticsFilter }) => (
    <TrafficByVolumeWidget filters={filters} />
  ),
  networkHistory: ({ filters }: { filters: AnalyticsFilter }) => (
    <NetworkHistoryWidget filters={filters} />
  ),
  topApplicationsByTraffic: ({ filters }: { filters: AnalyticsFilter }) => (
    <TopApplicationsByTrafficWidget filters={filters}/>
  ),
  topSSIDsByTraffic: ({ filters }: { filters: AnalyticsFilter }) => (
    <TopSSIDsByTrafficWidget filters={filters}/>
  ),
  topSSIDsByClient: ({ filters }: { filters: AnalyticsFilter }) => (
    <TopSSIDsByClientWidget filters={filters}/>
  ),
  connectedClientsOverTime: ({ filters }: { filters: AnalyticsFilter }) => (
    <ConnectedClientsOverTimeWidget filters={filters}/>
  ),
  topSwitchesByPoeUsage: ({ filters }: { filters: AnalyticsFilter }) => (
    <TopSwitchesByPoEUsageWidget filters={filters}/>
  ),
  switchTrafficByVolume: ({ filters }: { filters: AnalyticsFilter }) => (
    <SwitchesTrafficByVolumeWidget filters={filters}/>
  ),
  topSwitchesByErrors: ({ filters }: { filters: AnalyticsFilter }) => (
    <TopSwitchesByErrorWidget filters={filters}/>
  ),
  topSwitchModelsByCount: ({ filters }: { filters: AnalyticsFilter }) => (
    <TopSwitchModelsWidget filters={filters} />
  ),
  topSwitchesByTraffic: ({ filters }: { filters: AnalyticsFilter }) => (
    <TopSwitchesByTrafficWidget filters={filters}/>
  ),
  incidents: ({ filters }: { filters: AnalyticsFilter }) => (
    <IncidentsDashboardWidget filters={filters} />
  ),
  venueIncidentsDonut: ({ filters }: { filters: AnalyticsFilter }) => (
    <VenueIncidentsWidget filters={filters}/>
  ),
  venueHealth: ({ filters }: { filters: AnalyticsFilter }) => (
    <VenueHealthWidget filters={filters}/>
  ),
  health: ({ filters }: { filters: AnalyticsFilter }) => (
    <HealthWidget filters={filters}/>
  ),
  incidentsPageWidget: ({ filters }: { filters: AnalyticsFilter }) => (
    <IncidentTabContent filters={filters}/>
  ),
  healthPageWidget: ({ filters }: { filters: AnalyticsFilter }) => (
    <HealthPage filters={filters}/>
  )
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
