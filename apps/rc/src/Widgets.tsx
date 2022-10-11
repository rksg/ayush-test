import { useIntl } from 'react-intl'

import { Card }                    from '@acx-ui/components'
import { useSplitTreatment }       from '@acx-ui/feature-toggle'
import { ApGroupModalWidgetProps } from '@acx-ui/rc/utils'
import { Provider }                from '@acx-ui/store'

import AlarmWidget             from './components/AlarmWidget'
import VenueAlarmDonut         from './components/AlarmWidget/VenueAlarmDonut'
import Clients                 from './components/ClientsDonut'
import Devices                 from './components/DevicesDonut/DashboardWidget'
import VenueDevicesWidget      from './components/DevicesDonut/VenueWidget'
import Map                     from './components/Map'
import NetworkApGroupDialog    from './components/NetworkApGroupDialog'
import TopologyFloorPlanWidget from './components/TopologyFloorPlanWidget'
import Venues                  from './components/VenuesDonut'

const SPLIT_NAME = 'sara-demo-toggle' // this is sample splitName, needs to be switched based on the epic level FF name

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function widgetFactory (props:any) {
  switch (props.name) {
    case 'alarms':
      return <AlarmWidget />
    case 'map':
      return <Map />
    case 'venues':
      return <Venues />
    case 'devices':
      return <Devices />
    case 'clients':
      return <Clients />
    case 'floorPlans':
      return <TopologyFloorPlanWidget />
    case 'networkApGroupDialog':
      return <NetworkApGroupDialog {...props as ApGroupModalWidgetProps} />
    case 'venueAlarmDonut':
      return <VenueAlarmDonut />
    case 'venueDevices':
      return <VenueDevicesWidget/>
    default:
      return null
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function WifiWidgets (props:any) {
  const { $t } = useIntl()
  const treatment = useSplitTreatment(SPLIT_NAME)
  const Widget = widgetFactory(props)

  return <Provider>
    { Widget
      ? Widget
      : <Card>
        { treatment && props.name }
        { !treatment && $t({ defaultMessage: 'Coming soon...' }) }
      </Card>
    }
  </Provider>
}

export default WifiWidgets
