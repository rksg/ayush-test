import { AnalyticsFilter } from '@acx-ui/analytics/utils'
import { Card }            from '@acx-ui/components'
import { Provider }        from '@acx-ui/store'

import ConnectedClientsOverTimeWidget from './components/ConnectedClientsOverTime'
import NetworkHistoryWidget           from './components/NetworkHistory'
import SwitchesByErrorsWidget         from './components/SwitchesByErrors'
import TopSwitchModelsWidget          from './components/SwitchModels'
import TopApplicationsByTrafficWidget from './components/TopApplicationsByTraffic'
import TopSSIDsByClientWidget         from './components/TopSSIDsByClient'
import TopSSIDsByTrafficWidget        from './components/TopSSIDsByTraffic'
import TopSwitchesByPoEUsageWidget    from './components/TopSwitchesByPoEUsage'
import TopSwitchesByTrafficWidget     from './components/TopSwitchesByTraffic'
import TrafficByVolumeWidget          from './components/TrafficByVolume'

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
  topSwitchesByErrors: ({ filters }: { filters: AnalyticsFilter }) => (
    <SwitchesByErrorsWidget filters={filters}/>
  ),
  topSwitchModelsByCount: ({ filters }: { filters: AnalyticsFilter }) => (
    <TopSwitchModelsWidget filters={filters} />
  ),
  topSwitchesByTraffic: ({ filters }: { filters: AnalyticsFilter }) => (
    <TopSwitchesByTrafficWidget filters={filters}/>
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
