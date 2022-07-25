import { Card }     from '@acx-ui/components'
import { Provider } from '@acx-ui/store'

import NetworkHistoryWidget  from './components/NetworkHistory'
import TrafficByVolumeWidget from './components/TrafficByVolume'

const widgetsMap = {
  trafficByVolume: ({ filters } : { filters : any }) => <TrafficByVolumeWidget filters={filters}/>,
  networkHistory: ({ filters } : { filters : any }) => <NetworkHistoryWidget filters={filters}/>
}

function AnalyticsWidgets ({ name, filters }: { name: keyof typeof widgetsMap, filters? : any }) {
  const Widget = widgetsMap[name]
  return <Provider>
    {Widget ? <Widget filters={filters}/> : <Card>{name}</Card>}
  </Provider>
}

export default AnalyticsWidgets
