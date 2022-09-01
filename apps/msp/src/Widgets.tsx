import { Card }     from '@acx-ui/components'
import { Provider } from '@acx-ui/store'

const widgetsMap = {
  none: null
}

function Widgets ({ name }: { name: string }) {
  const Widget = widgetsMap[name as keyof typeof widgetsMap] as unknown as React.FC<unknown>

  return <Provider>
    {Widget ? <Widget /> : <Card>{name}</Card>}
  </Provider>
}

export default Widgets
