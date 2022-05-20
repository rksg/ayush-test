import { Card }     from '@acx-ui/components'
import { Provider } from '@acx-ui/store'

const widgetsMap = {
  'dashboard/alarms': () => <Card>Alarms</Card>
}

function WifiWidgets ({ name }: { name: keyof typeof widgetsMap }) {
  const Widget = widgetsMap[name]

  return <Provider>
    {Widget ? <Widget /> : <Card>{name}</Card>}
  </Provider>
}

export default WifiWidgets
