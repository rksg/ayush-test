
import { useEffect, useRef, useState } from 'react'

import { Col, Row, Switch } from 'antd'
import { DndProvider }      from 'react-dnd'
import { HTML5Backend }     from 'react-dnd-html5-backend'
import { useIntl }          from 'react-intl'
import { Link, useParams }  from 'react-router-dom'

import { Features, useIsSplitOn }                                                                from '@acx-ui/feature-toggle'
import { useApListQuery, useGetFloorPlanQuery }                                                  from '@acx-ui/rc/services'
import { ApPosition, FloorplanContext, getImageFitPercentage, NetworkDevice, NetworkDeviceType } from '@acx-ui/rc/utils'
import { useTenantLink }                                                                         from '@acx-ui/react-router-dom'
import { loadImageWithJWT }                                                                      from '@acx-ui/utils'

import { NetworkDeviceMarker }           from '../FloorPlan/NetworkDevices/NetworkDeviceMarker'
import { ApMeshConnections }             from '../FloorPlan/NetworkDevices/useApMeshDevice'
import { ApMeshTopologyContextProvider } from '../FloorPlan/PlainView/ApMeshTopologyContext'


export function ApFloorplan (props: {
    activeDevice: NetworkDevice,
    venueId: string,
    apPosition: ApPosition,
    allDevices?: NetworkDevice[]
}) {

  const { activeDevice, venueId, apPosition, allDevices = [] } = props

  const params = useParams()
  const imageRef = useRef<HTMLImageElement>(null)
  const imageContainerRef = useRef<HTMLDivElement>(null)
  const [imageLoaded, setImageLoaded] = useState<boolean>(false)
  const [apList, setApList] = useState<NetworkDevice[]>([] as NetworkDevice[])
  const [containerWidth, setContainerWidth] = useState<number>(1)
  const [imageUrl, setImageUrl] = useState('')
  const { $t } = useIntl()
  const isApMeshTopologyFFOn = useIsSplitOn(Features.AP_MESH_TOPOLOGY)
  // eslint-disable-next-line max-len
  const [isApMeshTopologyEnabled, setIsApMeshTopologyEnabled] = useState<boolean>(isApMeshTopologyFFOn)

  const { data: extendedApList } = useApListQuery({ params, payload: {
    filters: {
      floorplanId: [apPosition?.floorplanId]
    }
  } })

  useEffect(() => {
    if (extendedApList) {
      const _apDeviceList: NetworkDevice[] = []
      extendedApList?.data.map(apDevice => {
        let rogueCategory = {}
        if (allDevices.some(device => device.id === apDevice.serialNumber)) {
          rogueCategory = {
            rogueCategory: allDevices
              .filter(device => device.id === apDevice.serialNumber)[0].rogueCategory
          }
        }
        const _apDevice: NetworkDevice = {
          id: apDevice.serialNumber,
          name: apDevice.name,
          serialNumber: apDevice.serialNumber,
          networkDeviceType: NetworkDeviceType.ap,
          deviceStatus: apDevice.deviceStatus,
          position: {
            floorplanId: apPosition?.floorplanId,
            xPercent: apDevice?.xPercent || 0,
            yPercent: apDevice?.yPercent || 0
          },
          // highlighting only current AP device
          // other AP devices will be blured with low opacity
          isActive: apDevice.serialNumber === activeDevice?.serialNumber,
          ...rogueCategory
        } as NetworkDevice

        _apDeviceList.push(_apDevice)
      })

      setApList(_apDeviceList)

    }
  }, [extendedApList, allDevices])

  const { data: floorplan } =
   useGetFloorPlanQuery({ params: { tenantId: params.tenantId, venueId,
     floorPlanId: apPosition?.floorplanId } })

  useEffect(() => {
    if (floorplan?.imageId) {
      const response = loadImageWithJWT(floorplan?.imageId)
      response.then((_imageUrl) => {
        setImageUrl(_imageUrl)
      })
    }
  }, [floorplan?.imageId])

  useEffect(() => {
    if (floorplan?.imageId) {
      const response = loadImageWithJWT(floorplan?.imageId)
      response.then((_imageUrl) => {
        setImageUrl(_imageUrl)
      })
    }
  }, [floorplan?.imageId])

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
    maxHeight: '300px',
    paddingRight: '35px',
    marginBottom: '35px'
  }}>
    <Row justify='space-between' style={{ height: '2rem', alignItems: 'center' }}>
      <Col>
        <Link style={{ marginLeft: 10, lineHeight: '24px', fontSize: '14px' }}
          to={useTenantLink(`/venues/${venueId}/venue-details/overview`)}
          state={{
            param: { floorplan: floorplan }
          }}>
          {floorplan?.name}
        </Link>
      </Col>
      <Col>
        {isApMeshTopologyFFOn &&
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Switch onChange={setIsApMeshTopologyEnabled} checked={isApMeshTopologyEnabled} />
            {$t({ defaultMessage: 'Show Mesh Topology' })}
          </div>
        }
      </Col>
    </Row>
    <div
      ref={imageContainerRef}
      style={{
        position: 'relative',
        margin: '0 auto',
        width: `calc(${100 * containerWidth}%)`
      }}>
      { imageLoaded && <DndProvider backend={HTML5Backend}>
        { apList && apPosition?.floorplanId && <ApMeshTopologyContextProvider
          isApMeshTopologyEnabled={isApMeshTopologyEnabled}
          floorplanId={apPosition.floorplanId}
          venueId={venueId}
          children={<>{
            apList.map( (device: NetworkDevice) =>
              <NetworkDeviceMarker
                key={device?.serialNumber}
                galleryMode={false}
                contextAlbum={false}
                showRogueAp={true}
                context={FloorplanContext['ap']}
                device={device}
                forbidDrag={true}/>)
          }
          <ApMeshConnections />
          </>}
        />}
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
