import { Card } from '@acx-ui/components'

import TrafficByVolumeWidget from './widgets/TrafficByVolume'

const widgetsMap = {
  'monitoring/trafficByVolume': () => <TrafficByVolumeWidget/>
}

function WifiWidgets ({ name }: { name: keyof typeof widgetsMap }) {
  const Widget = widgetsMap[name]
  if (Widget) return <Widget />

  return <Card>{name}</Card>
}

export default WifiWidgets
