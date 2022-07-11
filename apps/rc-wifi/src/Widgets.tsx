import { Card }              from '@acx-ui/components'
import { useSplitTreatment } from '@acx-ui/feature-toggle'
import { Provider }          from '@acx-ui/store'

import { Clients } from './widgets/Clients'
import Devices     from './widgets/Devices'
import { Map }     from './widgets/Map'
import Venues      from './widgets/Venues'

const SPLIT_NAME = 'sara-demo-toggle' // this is sample splitName, needs to be switched based on the epic level FF name

const widgetsMap = {
  alarms: () => <Card title='Alarms' />,
  map: () => <Map />,
  venues: () => <Venues />,
  devices: () => <Devices />,
  clients: () => <Clients />
}

function WifiWidgets ({ name }: { name: keyof typeof widgetsMap }) {
  const treatment = useSplitTreatment(SPLIT_NAME)
  const Widget = widgetsMap[name]

  return <Provider>
    {Widget ? <Widget /> : <Card>{ treatment && name }
      { !treatment && 'Coming soon...' }</Card>}
  </Provider>
}

export default WifiWidgets
