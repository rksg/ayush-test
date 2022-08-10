import { AnalyticsFilter } from '@acx-ui/analytics/utils'
import { Card }            from '@acx-ui/components'
import { Provider }        from '@acx-ui/store'

import ConnectedClientsOverTimeWidget from './components/ConnectedClientsOverTime'
import NetworkHistoryWidget           from './components/NetworkHistory'
import { TrafficByApplicationWidget } from './components/TrafficByApplication'
import TrafficByVolumeWidget          from './components/TrafficByVolume'

const widgetsMap = {
  trafficByVolume: ({ filters }: { filters: AnalyticsFilter }) => (
    <TrafficByVolumeWidget filters={filters} />
  ),
  networkHistory: ({ filters }: { filters: AnalyticsFilter }) => (
    <NetworkHistoryWidget filters={filters} />
  ),
  topApplicationsByTraffic: ({ filters }: { filters: AnalyticsFilter }) => (
    <TrafficByApplicationWidget filters={filters}/>
  ),
  connectedClientsOverTime: ({ filters }: { filters: AnalyticsFilter }) => (
    <ConnectedClientsOverTimeWidget filters={filters}/>
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
