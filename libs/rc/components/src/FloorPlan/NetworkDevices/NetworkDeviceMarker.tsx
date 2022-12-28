import { useContext, useRef } from 'react'

import { Tooltip } from 'antd'
import { isEmpty } from 'lodash'
import { useDrag } from 'react-dnd'

import { DeviceOutlined, SignalUp }         from '@acx-ui/icons'
import { NetworkDevice, NetworkDeviceType } from '@acx-ui/rc/utils'

import { NetworkDeviceContext } from '..'

import * as UI                  from './styledComponent'
import { calculateDeviceColor } from './utils'



export function NetworkDeviceMarker ({
  galleryMode,
  contextAlbum,
  context,
  device,
  forbidDrag = false
}:{ galleryMode: boolean,
    contextAlbum: boolean,
    context: string,
    device: NetworkDevice,
    forbidDrag?: boolean
}) {

  const markerContainerRef = useRef<HTMLDivElement>(null)
  const deviceContext = useContext(NetworkDeviceContext) as Function

  const [{ isDragging }, drag] = useDrag(() => ({
    canDrag: forbidDrag,
    type: 'device',
    item: { device, markerRef: markerContainerRef },
    collect: monitor => ({
      isDragging: !!monitor.isDragging()
    }),
    end: (item, monitor) => {
      const didDrop = monitor.didDrop()
      if (!didDrop) {
        // device unplaced
        deviceContext(item.device)
      }
    }
  }), [device])

  let className = 'device-container'

  if (!isEmpty(context))
    className += ' context-' + context

  if (galleryMode)
    className += ' gallery'

  if (contextAlbum)
    className += ' context-Album'


  return <div ref={markerContainerRef}><Tooltip
    title={device?.name || device?.switchName || device?.serialNumber}>
    <UI.DeviceContainer
      ref={drag}
      className={className}
      style={
        {
          top: 'calc(' + device?.position?.yPercent + '%)',
          left: 'calc(' + device?.position?.xPercent + '%)',
          opacity: device?.isActive ? (isDragging ? 0.5 : 1) : 0.3
        }
      }>
      <div className={`marker ${calculateDeviceColor(device)}`}
        style={{
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'center',
          cursor: 'pointer'
        }}>
        {
          !contextAlbum && (
            device?.networkDeviceType === NetworkDeviceType.switch
              ? <DeviceOutlined/>
              : <SignalUp />)
        } </div>
    </UI.DeviceContainer>
  </Tooltip>
  </div>
}