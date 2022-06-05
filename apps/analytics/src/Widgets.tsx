import { Card }     from '@acx-ui/components'
import { Provider } from '@acx-ui/store'

import TrafficByVolumeWidget from './widgets/TrafficByVolume'

const widgetsMap = {
  trafficByVolume: () => <TrafficByVolumeWidget/>
}

function AnalyticsWidgets ({ name }: { name: keyof typeof widgetsMap }) {
  const Widget = widgetsMap[name]
  return <Provider>
    {Widget ? <Widget /> : <Card>{name}</Card>}
  </Provider>
}

export default AnalyticsWidgets
