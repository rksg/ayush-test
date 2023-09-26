
import { useEffect, useRef, useState } from 'react'

import { DndProvider }     from 'react-dnd'
import { HTML5Backend }    from 'react-dnd-html5-backend'
import { Link, useParams } from 'react-router-dom'

import { useGetFloorPlanQuery, useSwitchListQuery }                                                         from '@acx-ui/rc/services'
import { FloorplanContext, getImageFitPercentage, NetworkDevice, NetworkDevicePosition, NetworkDeviceType } from '@acx-ui/rc/utils'
import { useTenantLink }                                                                                    from '@acx-ui/react-router-dom'
import { loadImageWithJWT }                                                                                 from '@acx-ui/utils'

import { NetworkDeviceMarker } from '../FloorPlan/NetworkDevices/NetworkDeviceMarker'


export function SwitchFloorplan (props: { activeDevice: NetworkDevice,
    venueId: string,
    switchPosition: NetworkDevicePosition }) {

  const { activeDevice, venueId, switchPosition } = props

  const params = useParams()
  const imageRef = useRef<HTMLImageElement>(null)
  const imageContainerRef = useRef<HTMLDivElement>(null)
  const [imageLoaded, setImageLoaded] = useState<boolean>(false)
  const [switchList, setSwitchList] = useState<NetworkDevice[]>([] as NetworkDevice[])
  const [containerWidth, setContainerWidth] = useState<number>(1)
  const [imageUrl, setImageUrl] = useState('')

  const { data: extendedSwitchList } = useSwitchListQuery({ params, payload: {
    pageSize: 10000,
    page: 1,
    filters: {
      floorplanId: [switchPosition?.floorplanId]
    }
  } })

  useEffect(() => {
    if (extendedSwitchList) {
      const _switchDeviceList: NetworkDevice[] = []

      extendedSwitchList?.data.map(switchDevice => {
        const _switchDevice: NetworkDevice = {
          id: switchDevice.serialNumber,
          name: switchDevice.name,
          serialNumber: switchDevice.serialNumber,
          networkDeviceType: NetworkDeviceType.switch,
          deviceStatus: switchDevice.deviceStatus,
          position: {
            floorplanId: switchPosition.floorplanId,
            xPercent: switchDevice?.xPercent || 0,
            yPercent: switchDevice?.yPercent || 0
          },
          // highlighting only current Switch device
          // other Switch devices will be blured with low opacity
          isActive: switchDevice.serialNumber === activeDevice?.serialNumber
        } as NetworkDevice

        _switchDeviceList.push(_switchDevice)
      })

      setSwitchList(_switchDeviceList)

    }
  }, [extendedSwitchList])

  const { data: floorplan } =
   useGetFloorPlanQuery({ params: { tenantId: params.tenantId, venueId,
     floorPlanId: switchPosition?.floorplanId } })

  useEffect(() => {
    if (floorplan?.imageId) {
      const response = loadImageWithJWT(floorplan?.imageId)
      response.then((_imageUrl) => {
        setImageUrl(_imageUrl)
      })
    }
  }, [floorplan?.imageId])

  function onImageLoad () {
    activeDevice.position = switchPosition
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
    maxHeight: '300px',
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
        { switchList && switchList.map( (device: NetworkDevice) =>
          <NetworkDeviceMarker
            key={device?.serialNumber}
            galleryMode={false}
            contextAlbum={false}
            context={FloorplanContext['switch']}
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
        src={imageUrl} />
    </div>
  </div>
}