import { DragLayerMonitor, useDragLayer, XYCoord } from 'react-dnd'

import { FloorplanContext, NetworkDevice } from '@acx-ui/rc/utils'

import { NetworkDeviceMarker } from '../NetworkDevices/NetworkDeviceMarker'

import * as UI from './styledComponents'


export default function CustomDragLayer (props: { device: NetworkDevice }) {

  const { device } = { ...props }
  const { isDragging, currentOffset, clientOffset } = useDragLayer(
    (monitor: DragLayerMonitor) => {
      return {
        isDragging: monitor.isDragging(),
        currentOffset: monitor.getSourceClientOffset(),
        clientOffset: monitor.getClientOffset() as XYCoord
      }
    }
  )

  return isDragging && currentOffset
    ? <UI.CustomDeviceMarker clientOffset={clientOffset}>
      <NetworkDeviceMarker
        key={device?.id}
        galleryMode={false}
        contextAlbum={false}
        context={FloorplanContext['ap']}
        device={device}/>
    </UI.CustomDeviceMarker>
    : null
}