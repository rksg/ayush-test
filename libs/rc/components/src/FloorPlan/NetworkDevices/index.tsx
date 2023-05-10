import { FloorplanContext, FloorPlanDto, NetworkDeviceType, TypeWiseNetworkDevices } from '@acx-ui/rc/utils'


import { NetworkDeviceMarker } from './NetworkDeviceMarker'
import { ApMeshConnections }   from './useApMeshDevice'


export default function NetworkDevices ({
  networkDevicesVisibility,
  selectedFloorPlan,
  networkDevices,
  galleryMode,
  contextAlbum,
  context,
  showRogueAp
} : {
    networkDevicesVisibility: NetworkDeviceType[],
    selectedFloorPlan: FloorPlanDto,
    networkDevices: { [key: string]: TypeWiseNetworkDevices },
    galleryMode: boolean,
    contextAlbum: boolean,
    context?: FloorplanContext,
    showRogueAp?: boolean
    }) {

  const networkDeviceTypeArray = Object.values(NetworkDeviceType)

  return <div> {
    networkDeviceTypeArray.map(device => {
      return (
        (networkDevicesVisibility.indexOf(device) !== -1)
            && networkDevices[selectedFloorPlan.id]
        && networkDevices[selectedFloorPlan.id][device].map(obj => {
          // isActive will highlight devices, while in case of false
          // it will blur device. this field is required for floorplan
          // to highlight certain device only on AP device overview page.
          obj = { ...obj, isActive: true }
          return <NetworkDeviceMarker
            key={obj?.id}
            galleryMode={galleryMode}
            contextAlbum={contextAlbum}
            context={context as FloorplanContext}
            device={obj}
            showRogueAp={showRogueAp}/>
        }))
    })
  }
  <ApMeshConnections />
  </div>
}
