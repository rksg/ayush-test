import { AnalyticsFilter } from '@acx-ui/analytics/utils'
import { Card }            from '@acx-ui/components'
import { Provider }        from '@acx-ui/store'

import ConnectedClientsOverTimeWidget from './components/ConnectedClientsOverTime'
import NetworkHistoryWidget           from './components/NetworkHistory'
import SwitchesByPoEUsageWidget       from './components/SwitchesByPoEUsage'
import TopSwitchModelsWidget          from './components/SwitchModels'
import TopApplicationsByTrafficWidget from './components/TopApplicationsByTraffic'
import TopSSIDsByTrafficWidget        from './components/TopSSIDsByTraffic'
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
  connectedClientsOverTime: ({ filters }: { filters: AnalyticsFilter }) => (
    <ConnectedClientsOverTimeWidget filters={filters}/>
  ),
  topSwitchesByPoeUsage: ({ filters }: { filters: AnalyticsFilter }) => (
    <SwitchesByPoEUsageWidget filters={filters}/>
  ),
  topSwitchModelsByCount: ({ filters }: { filters: AnalyticsFilter }) => (
    <TopSwitchModelsWidget filters={filters} />
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
