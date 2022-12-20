import { useContext, useEffect } from 'react'

import { useDrag }       from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import { useIntl }       from 'react-intl'

import { DeviceOutlined, SignalUp }         from '@acx-ui/icons'
import { NetworkDevice, NetworkDeviceType } from '@acx-ui/rc/utils'

import { NetworkDeviceContext } from '..'

import CustomDragLayer from './CustomDragLayer'
import * as UI         from './styledComponents'

export default function UnplacedDevice (props: { device: NetworkDevice }) {

  const { device } = props
  const { $t } = useIntl()
  const deviceContext = useContext(NetworkDeviceContext) as Function

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
    }
  }), [device])

  useEffect(() => {
    dragPreview(getEmptyImage())
  }, [])

  return <> <div key={device?.id}>
    <UI.ListItem
      ref={drag}
      isdragging={isDragging ? true : false}>
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
              device?.networkDeviceType === NetworkDeviceType.switch
                ? <DeviceOutlined/>
                : <SignalUp/>
            }
          </div> {device?.name || device?.switchName || device?.serialNumber}
        </>
      }
      { isDragging && <CustomDragLayer key={device?.id} device={device}/> }
    </UI.ListItem>
  </div>
  </>
}