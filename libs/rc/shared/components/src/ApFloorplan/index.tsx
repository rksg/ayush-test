import { useEffect, useRef, useState } from 'react'

import { Col, Row, Switch } from 'antd'
import { DndProvider }      from 'react-dnd'
import { HTML5Backend }     from 'react-dnd-html5-backend'
import { useIntl }          from 'react-intl'
import { Link, useParams }  from 'react-router-dom'

import { Features, useIsSplitOn }                                           from '@acx-ui/feature-toggle'
import { useApListQuery, useGetFloorPlanQuery, useGetRogueApLocationQuery } from '@acx-ui/rc/services'
import {
  ApPosition,
  DetectingNode,
  FloorplanContext,
  getImageFitPercentage,
  NetworkDevice,
  NetworkDeviceType
} from '@acx-ui/rc/utils'
import { useTenantLink }    from '@acx-ui/react-router-dom'
import { loadImageWithJWT } from '@acx-ui/utils'

import { NetworkDeviceMarker }           from '../FloorPlan/NetworkDevices/NetworkDeviceMarker'
import { RogueApLocationMarker }         from '../FloorPlan/NetworkDevices/RogueApLocationMarker'
import { ApMeshConnections }             from '../FloorPlan/NetworkDevices/useApMeshDevice'
import { ApMeshTopologyContextProvider } from '../FloorPlan/PlainView/ApMeshTopologyContext'


export function ApFloorplan (props: {
  activeDevice: NetworkDevice,
  venueId: string,
  apPosition: ApPosition,
  rogueApMac?: string,
  rogueCategory?: string,
  numLocatingAps?: number
}) {

  const {
    activeDevice,
    venueId,
    apPosition,
    rogueApMac = '',
    rogueCategory = '',
    numLocatingAps = 0
  } = props

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

  const { data: extendedApList } = useApListQuery({
    params, payload: {
      pageSize: 10000,
      page: 1,
      filters: {
        floorplanId: [apPosition?.floorplanId]
      }
    }
  })

  const { data: rogueApDevices } = useGetRogueApLocationQuery({ params: {
    ...params,
    rogueMac: rogueApMac,
    numLocatingAps: numLocatingAps.toString()
  } }, { skip: !rogueApMac })

  useEffect(() => {
    if (!extendedApList) return

    const detectingNodes = rogueApDevices?.detectingNodes
      .reduce((a, device) => {
        if (!a.hasOwnProperty(device.serialNumber)) {
          a[device.serialNumber] = device
        }
        return a
      }, {} as { [key: string]: DetectingNode })
    const _apDeviceList: NetworkDevice[] = []
    extendedApList?.data
      .filter(apDevice => {
        if (rogueApMac && detectingNodes) {
          return Object.keys(detectingNodes).includes(apDevice.serialNumber)
        }
        return true
      })
      .map(apDevice => {
        let rogueApLocationInfo = {}
        if (rogueApMac && detectingNodes) {
          rogueApLocationInfo = {
            snr: detectingNodes[apDevice.serialNumber].snr,
            macAddress: detectingNodes[apDevice.serialNumber].apMac
          }
        }
        const _apDevice: NetworkDevice = {
          id: apDevice.serialNumber,
          name: apDevice.name,
          serialNumber: apDevice.serialNumber,
          networkDeviceType: rogueApMac ? NetworkDeviceType.rogue_ap : NetworkDeviceType.ap,
          deviceStatus: apDevice.deviceStatus,
          position: {
            floorplanId: apPosition?.floorplanId,
            xPercent: apDevice?.xPercent || 0,
            yPercent: apDevice?.yPercent || 0
          },
          rogueCategory: apDevice?.rogueCategory,
          rogueCategoryType: rogueCategory,
          isActive: rogueApMac ? true : apDevice.serialNumber === activeDevice?.serialNumber,
          ...rogueApLocationInfo
        } as NetworkDevice

        _apDeviceList.push(_apDevice)
      })

    setApList(_apDeviceList)
  }, [extendedApList, rogueApDevices])

  const { data: floorplan } =
    useGetFloorPlanQuery({
      params: {
        tenantId: params.tenantId, venueId,
        floorPlanId: apPosition?.floorplanId
      }
    })

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
            <Switch onChange={setIsApMeshTopologyEnabled} checked={isApMeshTopologyEnabled}/>
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
      {imageLoaded && <DndProvider backend={HTML5Backend}>
        {apList && apPosition?.floorplanId && <ApMeshTopologyContextProvider
          isApMeshTopologyEnabled={isApMeshTopologyEnabled}
          floorplanId={apPosition.floorplanId}
          venueId={venueId}
          children={<>{
            apList.map((device: NetworkDevice) =>
              <NetworkDeviceMarker
                key={device?.serialNumber}
                galleryMode={false}
                contextAlbum={false}
                showRogueAp={!!rogueApMac}
                perRogueApModel={!!rogueApMac}
                context={FloorplanContext['ap']}
                device={device}
                forbidDrag={true}/>
            )
          }
          <RogueApLocationMarker
            rogueApDevices={rogueApDevices}
          />
          <ApMeshConnections/>
          </>}
        />}
      </DndProvider>}
      <img
        data-testid='floorPlanImage'
        onLoad={onImageLoad}
        style={{
          maxHeight: '100%',
          width: '100%',
          border: 'none'
        }}
        ref={imageRef}
        alt={floorplan?.name}
        src={imageUrl}/>
    </div>
  </div>
}
