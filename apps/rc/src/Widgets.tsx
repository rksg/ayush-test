import { Card }     from '@acx-ui/components'
import { Provider } from '@acx-ui/store'

import AlarmWidget             from './components/AlarmWidget'
import VenueAlarmDonut         from './components/AlarmWidget/VenueAlarmDonut'
import Clients                 from './components/ClientsDonut'
import Devices                 from './components/DevicesDonut/DashboardWidget'
import VenueDevicesWidget      from './components/DevicesDonut/VenueWidget'
import Map                     from './components/Map'
import TopologyFloorPlanWidget from './components/TopologyFloorPlanWidget'
import Venues                  from './components/VenuesDonut'

const widgetsMap = {
  alarms: () => <AlarmWidget />,
  map: () => <Map />,
  venues: () => <Venues />,
  devices: () => <Devices />,
  clients: () => <Clients />,
  floorPlans: () => <TopologyFloorPlanWidget />,
  // Venue Overview Page Widgets
  venueAlarmDonut: () => <VenueAlarmDonut />,
  venueDevices: () => <VenueDevicesWidget />
}

function WifiWidgets ({ name }: { name: keyof typeof widgetsMap }) {
  const Widget = widgetsMap[name]

  return <Provider>
    {Widget ? <Widget /> : <Card>{ name }</Card>}
  </Provider>
}

export default WifiWidgets
