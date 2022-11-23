import { Tooltip } from 'antd'
import { isEmpty } from 'lodash'

import { DeviceOutlined, SignalUp }                                from '@acx-ui/icons'
import { FloorPlanDto, NetworkDeviceType, TypeWiseNetworkDevices } from '@acx-ui/rc/utils'

import * as UI                  from './styledComponent'
import { calculateDeviceColor } from './utils'


export default function NetworkDevices ({
  imageLoaded,
  networkDevicesVisibility,
  selectedFloorPlan,
  networkDevices,
  galleryMode,
  contextAlbum,
  context
} : {
    imageLoaded: boolean,
    networkDevicesVisibility: NetworkDeviceType[],
    selectedFloorPlan: FloorPlanDto,
    networkDevices: { [key: string]: TypeWiseNetworkDevices },
    galleryMode: boolean,
    contextAlbum: boolean,
    context: string
    }) {

  const networkDeviceTypeArray = Object.values(NetworkDeviceType)


  return <div>{
    imageLoaded && networkDeviceTypeArray.map(device => {
      return (
        (networkDevicesVisibility.indexOf(device) !== -1)
            && networkDevices[selectedFloorPlan.id]
        && networkDevices[selectedFloorPlan.id][device].map(obj => {
          let className = 'device-container'

          if (!isEmpty(context))
            className += ' context-' + context

          if (galleryMode)
            className += ' gallery'

          if (contextAlbum)
            className += ' context-Album'

          return <Tooltip title={obj?.name}>
            <UI.DeviceContainer
              className={className}
              style={
                {
                  top: obj?.position?.yPercent + '%',
                  left: obj?.position?.xPercent + '%'
                }
              }>
              <div className={`marker ${calculateDeviceColor(obj)}`}
                style={
                  {
                    alignItems: 'center',
                    display: 'flex',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }
                }>{
                  !contextAlbum && (
                    obj?.networkDeviceType === NetworkDeviceType.switch
                      ? <DeviceOutlined/>
                      : <SignalUp />)
                } </div>
            </UI.DeviceContainer>
          </Tooltip>
        }))
    })
  }</div>
}