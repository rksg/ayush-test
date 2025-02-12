import {
  CommonRbacUrlsInfo,
  FloorplanContext,
  FloorPlanDto,
  NetworkDevice,
  NetworkDeviceType,
  TypeWiseNetworkDevices
} from '@acx-ui/rc/utils'
import { getUserProfile, hasAllowedOperations } from '@acx-ui/user'
import { getOpsApi }                            from '@acx-ui/utils'


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
  const { rbacOpsApiEnabled } = getUserProfile()

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

          const getForbidDrag = function (obj: NetworkDevice) {
            if(rbacOpsApiEnabled) {
              switch(obj?.networkDeviceType) {
                case NetworkDeviceType.switch:
                  return !hasAllowedOperations([getOpsApi(CommonRbacUrlsInfo.UpdateSwitchPosition)])
                case NetworkDeviceType.rwg:
                  return !hasAllowedOperations([getOpsApi(CommonRbacUrlsInfo.UpdateRwgPosition)])
                default:
                  return !hasAllowedOperations([getOpsApi(CommonRbacUrlsInfo.UpdateApPosition)])
              }
            }
            return false
          }

          return <NetworkDeviceMarker
            key={obj?.id}
            forbidDrag={getForbidDrag(obj)}
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
