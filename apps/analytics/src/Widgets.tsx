import { Card }     from '@acx-ui/components'
import { Provider } from '@acx-ui/store'

import NetworkHistoryWidget           from './components/NetworkHistory'
import { TrafficByApplicationWidget } from './components/TrafficByApplication'
import TrafficByVolumeWidget          from './components/TrafficByVolume'

const widgetsMap = {
  trafficByVolume: () => <TrafficByVolumeWidget/>,
  networkHistory: () => <NetworkHistoryWidget/>,
  topApplicationsByTraffic: () => <TrafficByApplicationWidget/>
}

function AnalyticsWidgets ({ name }: { name: keyof typeof widgetsMap }) {
  const Widget = widgetsMap[name]
  return <Provider>
    {Widget ? <Widget /> : <Card>{name}</Card>}
  </Provider>
}

export default AnalyticsWidgets
