import { FloorPlanDto, NetworkDeviceType, TypeWiseNetworkDevices } from '@acx-ui/rc/utils'

import NetworkDeviceMarker from './NetworkDeviceMarker'



export default function NetworkDevices ({
  networkDevicesVisibility,
  selectedFloorPlan,
  networkDevices,
  galleryMode,
  contextAlbum,
  context
} : {
    networkDevicesVisibility: NetworkDeviceType[],
    selectedFloorPlan: FloorPlanDto,
    networkDevices: { [key: string]: TypeWiseNetworkDevices },
    galleryMode: boolean,
    contextAlbum: boolean,
    context: string
    }) {

  const networkDeviceTypeArray = Object.values(NetworkDeviceType)

  return <div> {
    networkDeviceTypeArray.map(device => {
      return (
        (networkDevicesVisibility.indexOf(device) !== -1)
            && networkDevices[selectedFloorPlan.id]
        && networkDevices[selectedFloorPlan.id][device].map(obj => {
          return <NetworkDeviceMarker
            key={obj?.id}
            galleryMode={galleryMode}
            contextAlbum={contextAlbum}
            context={context}
            device={obj}/>
        }))
    })
  }</div>
}