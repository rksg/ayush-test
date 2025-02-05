import { useContext, useEffect } from 'react'

import { useDrag }       from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import { useIntl }       from 'react-intl'

import { Features, useIsSplitOn }                    from '@acx-ui/feature-toggle'
import { DeviceOutlined, DevicesOutlined, SignalUp } from '@acx-ui/icons'
import {
  APMeshRole,
  CommonRbacUrlsInfo,
  NetworkDevice,
  NetworkDeviceType
} from '@acx-ui/rc/utils'
import { SwitchScopes, WifiScopes } from '@acx-ui/types'
import { hasPermission }            from '@acx-ui/user'
import { getOpsApi }                from '@acx-ui/utils'

import { NetworkDeviceContext } from '..'
import { getDeviceName }        from '../NetworkDevices/utils'

import CustomDragLayer from './CustomDragLayer'
import * as UI         from './styledComponents'

export const apMeshRoleAbbrMap: Record<APMeshRole, string> = {
  [APMeshRole.RAP]: 'R',
  [APMeshRole.MAP]: 'M',
  [APMeshRole.EMAP]: 'E',
  [APMeshRole.DISABLED]: ''
}

export default function UnplacedDevice (props: { device: NetworkDevice }) {

  const { device } = props
  const { $t } = useIntl()
  const deviceContext = useContext(NetworkDeviceContext) as Function
  const isApMeshTopologyFFOn = useIsSplitOn(Features.AP_MESH_TOPOLOGY)

  const canDrag = () => {
    if(device?.networkDeviceType === NetworkDeviceType.ap) {
      return hasPermission({ scopes: [WifiScopes.UPDATE],
        rbacOpsIds: [getOpsApi(CommonRbacUrlsInfo.UpdateApPosition)]
      })
    } else if(device?.networkDeviceType === NetworkDeviceType.switch) {
      return hasPermission({
        scopes: [SwitchScopes.UPDATE],
        rbacOpsIds: [getOpsApi(CommonRbacUrlsInfo.UpdateSwitchPosition)]
      })
    }
    return true
  }

  const [{ isDragging }, drag, dragPreview] = useDrag(() => ({
    type: 'device',
    item: { device: device, markerRef: null },
    collect: monitor => ({
      isDragging: !!monitor.isDragging(),
      opacity: monitor.isDragging() ? 0.4 : 1
    }),
    end: (item, monitor) => {
      const didDrop = monitor.didDrop()
      if (!didDrop) {
        // device unplaced
        deviceContext(item)
      }
    },
    canDrag: canDrag()
  }), [device])

  const getDeviceIcon = (deviceType: NetworkDeviceType) => {
    switch(deviceType) {
      case NetworkDeviceType.switch:
        return <DeviceOutlined/>
      case NetworkDeviceType.rwg:
        return <DevicesOutlined/>
      default:
        return <SignalUp/>
    }
  }

  const getApMeshRoleAbbr = () => {
    return device.meshRole && device.meshRole !== APMeshRole.DISABLED
      ? `(${apMeshRoleAbbrMap[device.meshRole]})`
      : ''
  }

  useEffect(() => {
    dragPreview(getEmptyImage())
  }, [])

  return <> <div key={device?.id}>
    <UI.ListItem
      ref={drag}
      isdragging={isDragging ? true : false}
      disabled={!canDrag()}
    >
      { isDragging ?
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          lineHeight: '24px',
          width: '100%'
        }}>
          <span>
            { $t({ defaultMessage: 'Drop here to unplace' }) }
          </span>
        </div>
        : <>
          <div style={{
            width: '24px',
            height: '24px',
            margin: '0px 8px'
          }}>  {
              getDeviceIcon(device?.networkDeviceType)
            }
          </div>{getDeviceName(device)} {isApMeshTopologyFFOn && getApMeshRoleAbbr()}
        </>
      }
      { isDragging && <CustomDragLayer key={device?.id} device={device}/> }
    </UI.ListItem>
  </div>
  </>
}
