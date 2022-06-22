import { Card }              from '@acx-ui/components'
import { useSplitTreatment } from '@acx-ui/feature-toggle'
import { Provider }          from '@acx-ui/store'

import { Map } from './widgets/Map'

const SPLIT_NAME = 'sara-demo-toggle' // this is sample splitName, needs to be switched based on the epic level FF name

const widgetsMap = {
  alarms: () => <Card title='Alarms' />,
  map: () => <Map />
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
