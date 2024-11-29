// @ts-nocheck
import {
  ConnectedClientsOverTime,
  IncidentsDashboardv2,
  ClientExperience,
  SwitchesTrafficByVolume,
  TopAppsByTraffic,
  TopSwitchesByError,
  TopSwitchesByPoEUsage,
  TopSwitchesByTraffic,
  TopSwitchModels,
  TrafficByVolume,
  DidYouKnow,
  TopWiFiNetworks,
  TopEdgesByTraffic,
  TopEdgesByResources } from '@acx-ui/analytics/components'
import {
  AlarmWidgetV2,
  ClientsWidgetV2,
  DevicesDashboardWidgetV2,
  MapWidgetV2,
  TopologyFloorPlanWidget,
  VenuesDashboardWidgetV2
} from '@acx-ui/rc/components'
import { ShowTopologyFloorplanOn } from '@acx-ui/rc/utils'

import * as UI from './styledComponents'

const switchFloorPlanData = {
  currentSwitchDevice: {
    serialNumber: 'FEK3224R0AG',
    switchMac: 'c0:c5:20:aa:32:79'
  },
  venueId: '72cf6720ccba4c37af972b3856b8ac6d',
  position: {
    floorplanId: '21918c4265714b248ae9e0930ff4a600',
    xPercent: 81.82257843017578,
    yPercent: 36.859771728515625
  }
}

export const widgets = {
  SwitchesTrafficByVolume: {
    name: 'SwitchesTrafficByVolume',
    component: <SwitchesTrafficByVolume filters={{
      startDate: '2023-08-21T16:05:00+08:00',
      endDate: '2023-08-22T16:05:59+08:00',
      range: 'Last 24 Hours',
      filter: {} }
    }
    vizType={'area'}
    />,
    size: { w: 6, h: 6, maxH: 8 }
  },
  AlarmWidget: {
    name: 'AlarmWidget',
    component: <AlarmWidgetV2 />,
    size: { w: 3, h: 6 }
  },
  VenuesDashboardWidgetV2: {
    name: 'VenuesDashboardWidgetV2',
    component: <VenuesDashboardWidgetV2 />,
    size: { w: 3, h: 6 }
  },
  MapWidget: {
    name: 'MapWidget',
    component: <MapWidgetV2 />,
    size: { w: 6, h: 6 }
  },
  TopologyFloorPlanWidget: {
    name: 'TopologyFloorPlanWidget',
    component: <TopologyFloorPlanWidget
      showTopologyFloorplanOn={ShowTopologyFloorplanOn.SWITCH_OVERVIEW}
      currentDevice={switchFloorPlanData.currentSwitchDevice}
      venueId={switchFloorPlanData.venueId}
      devicePosition={switchFloorPlanData.position}/>,
    size: { w: 6, h: 10 }
  },
  VenueFloorPlanWidget: {
    name: 'VenueFloorPlanWidget',
    component: <TopologyFloorPlanWidget
      showTopologyFloorplanOn={ShowTopologyFloorplanOn.VENUE_OVERVIEW} />,
    size: { w: 6, h: 12 }
  }
}


export function Widget (props: { id: string, onRemoveItem: (id:string) => {} }) {
  const { id, onRemoveItem } = props
  const widget = id ? widgets[id.split('-')[1]].component : <></>
  return (
    <div style={{ display: 'contents' }}>
      {widget}
    </div>
  )
}
