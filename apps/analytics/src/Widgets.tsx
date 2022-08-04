import { Card }     from '@acx-ui/components'
import { Provider } from '@acx-ui/store'

import ConnectedClientsOverTimeWidget from './components/ConnectedClientsOverTime'
import NetworkHistoryWidget           from './components/NetworkHistory'
import TrafficByVolumeWidget          from './components/TrafficByVolume'

const widgetsMap = {
  trafficByVolume: () => <TrafficByVolumeWidget/>,
  networkHistory: () => <NetworkHistoryWidget/>,
  connectedClientsOverTime: () => <ConnectedClientsOverTimeWidget/>
  
}

function AnalyticsWidgets ({ name }: { name: keyof typeof widgetsMap }) {
  const Widget = widgetsMap[name]
  return <Provider>
    {Widget ? <Widget /> : <Card>{name}</Card>}
  </Provider>
}

export default AnalyticsWidgets
