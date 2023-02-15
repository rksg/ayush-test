
import { useEffect, useRef, useState } from 'react'

import { DndProvider }  from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Link }         from 'react-router-dom'

import { NetworkDeviceMarker }                                                                   from '@acx-ui/rc/components'
import { useApListQuery, useGetFloorPlanQuery }                                                  from '@acx-ui/rc/services'
import { ApPosition, FloorplanContext, getImageFitPercentage, NetworkDevice, NetworkDeviceType } from '@acx-ui/rc/utils'
import { useTenantLink }                                                                         from '@acx-ui/react-router-dom'

import { useApContext } from '../../ApContext'

export default function ApFloorplan (props: { activeDevice: NetworkDevice,
    venueId: string,
    apPosition: ApPosition }) {

  const { activeDevice, venueId, apPosition } = props

  const params = useApContext()
  const imageRef = useRef<HTMLImageElement>(null)
  const imageContainerRef = useRef<HTMLDivElement>(null)
  const [imageLoaded, setImageLoaded] = useState<boolean>(false)
  const [apList, setApList] = useState<NetworkDevice[]>([] as NetworkDevice[])
  const [containerWidth, setContainerWidth] = useState<number>(1)

  const { data: extendedApList } = useApListQuery({ params, payload: {
    filters: {
      floorplanId: [apPosition.floorplanId]
    }
  } })

  useEffect(() => {
    if (extendedApList) {
      const _apDeviceList: NetworkDevice[] = []
      extendedApList?.data.map(apDevice => {
        const _apDevice: NetworkDevice = {
          id: apDevice.serialNumber,
          name: apDevice.name,
          serialNumber: apDevice.serialNumber,
          networkDeviceType: NetworkDeviceType.ap,
          deviceStatus: apDevice.deviceStatus,
          position: {
            floorplanId: apPosition.floorplanId,
            xPercent: apDevice?.xPercent || 0,
            yPercent: apDevice?.yPercent || 0
          },
          // highlighting only current AP device
          // other AP devices will be blured with low opacity
          isActive: apDevice.serialNumber === activeDevice?.serialNumber
        } as NetworkDevice

        _apDeviceList.push(_apDevice)
      })

      setApList(_apDeviceList)

    }
  }, [extendedApList])

  const { data: floorplan } =
   useGetFloorPlanQuery({ params: { tenantId: params.tenantId, venueId,
     floorPlanId: apPosition.floorplanId } })

  function onImageLoad () {
    activeDevice.position = apPosition
    const containerCoordsX = imageContainerRef?.current?.parentElement?.offsetWidth || 0
    const containerCoordsY = imageContainerRef?.current?.parentElement?.offsetHeight || 0

    const imageCoordsX = imageRef?.current?.offsetWidth || 0
    const imageCoordsY = imageRef?.current?.offsetHeight || 0
    const differencePercentage = getImageFitPercentage(containerCoordsX,
      containerCoordsY, imageCoordsX, imageCoordsY)

    if (differencePercentage) {
      const _zoom = Math.floor(differencePercentage) / 100
      setContainerWidth(_zoom)
    }
    setTimeout(() => setImageLoaded(true), 400)
  }

  return <div style={{
    width: '100%',
    position: 'relative',
    maxHeight: '500px',
    paddingRight: '35px',
    marginBottom: '35px'
  }}>
    <Link style={{ marginLeft: 10,
      lineHeight: '24px',
      fontSize: '14px' }}
    to={useTenantLink(`/venues/${venueId}/venue-details/overview`)}
    state={{
      param: { floorplan: floorplan }
    }}>
      {floorplan?.name}
    </Link>
    <div
      ref={imageContainerRef}
      style={{
        position: 'relative',
        margin: '0 auto',
        width: `calc(${100 * containerWidth}%)`
      }}>
      { imageLoaded && <DndProvider backend={HTML5Backend}>
        { apList && apList.map( (device: NetworkDevice) =>
          <NetworkDeviceMarker
            key={device?.serialNumber}
            galleryMode={false}
            contextAlbum={false}
            context={FloorplanContext['ap']}
            device={device}
            forbidDrag={true}/>)}
      </DndProvider> }
      <img
        data-testid='floorPlanImage'
        onLoad={onImageLoad}
        style={{ maxHeight: '100%',
          width: '100%',
          border: 'none' }}
        ref={imageRef}
        alt={floorplan?.name}
        src={floorplan?.imageUrl} />
    </div>
  </div>
}
