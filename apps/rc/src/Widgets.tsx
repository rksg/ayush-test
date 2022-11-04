import { useIntl } from 'react-intl'

import { Card }              from '@acx-ui/components'
import { useSplitTreatment } from '@acx-ui/feature-toggle'
import {
  AlarmWidget,
  ClientsWidget,
  DevicesDashboardWidget,
  MapWidget,
  TopologyFloorPlanWidget,
  VenueAlarmWidget,
  VenueDevicesWidget,
  VenuesDashboardWidget
} from '@acx-ui/rc/components'
import { Provider } from '@acx-ui/store'

const SPLIT_NAME = 'sara-demo-toggle' // this is sample splitName, needs to be switched based on the epic level FF name

const widgetsMap = {
  alarms: AlarmWidget,
  map: MapWidget,
  venues: VenuesDashboardWidget,
  devices: DevicesDashboardWidget,
  clients: ClientsWidget,
  floorPlans: TopologyFloorPlanWidget,
  // Venue Overview Page Widgets
  venueAlarmDonut: VenueAlarmWidget,
  venueDevices: VenueDevicesWidget,
  none: null
}

function WifiWidgets ({ name }: { name: keyof typeof widgetsMap }) {
  const { $t } = useIntl()
  const treatment = useSplitTreatment(SPLIT_NAME)
  const Widget = widgetsMap[name]

  return <Provider>
    { Widget
      ? <Widget />
      : <Card>
        { treatment && name }
        { !treatment && $t({ defaultMessage: 'Coming soon...' }) }
      </Card>
    }
  </Provider>
}

export default WifiWidgets
