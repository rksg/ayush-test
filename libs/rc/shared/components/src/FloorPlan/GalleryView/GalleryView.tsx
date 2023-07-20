import { RefObject, useEffect, useRef, useState } from 'react'

import { Col, Row }                            from 'antd'
import { DropTargetMonitor, useDrop, XYCoord } from 'react-dnd'

import { Card }                                                                   from '@acx-ui/components'
import { FloorPlanDto, NetworkDevice, NetworkDeviceType, TypeWiseNetworkDevices } from '@acx-ui/rc/utils'
import { loadImageWithJWT }                                                       from '@acx-ui/utils'

import NetworkDevices from '../NetworkDevices'

import * as UI from './styledComponents'

export default function GalleryView (props: {
  setCoordinates: Function,
  floorPlans: FloorPlanDto[],
  onFloorPlanClick: Function,
  networkDevices: {
    [key: string]: TypeWiseNetworkDevices
  },
  networkDevicesVisibility: NetworkDeviceType[] }) {
  const {
    setCoordinates,
    floorPlans,
    onFloorPlanClick,
    networkDevices,
    networkDevicesVisibility
  } = { ...props }
  const [span, setSpan] = useState(12)

  useEffect(() => {
    (floorPlans?.length > 4) ? setSpan(8) : setSpan(12)
  }, [floorPlans])

  const onFloorplanImageClick = function (floorPlan: FloorPlanDto) {
    onFloorPlanClick(floorPlan)
  }

  return (
    <Row gutter={[16, 20]} style={{ marginLeft: '0px', marginRight: '0px', paddingBottom: '8px' }}>
      { floorPlans?.map((floorPlan, index) => <Col key={index} span={span}>
        <GalleryCard
          setCoordinates={setCoordinates}
          floorPlan={floorPlan}
          networkDevicesVisibility={networkDevicesVisibility}
          networkDevices={networkDevices}
          onFloorPlanClick={onFloorplanImageClick}
        />
      </Col>) }
    </Row>)
}

function GalleryCard (props: {
  setCoordinates: Function
  floorPlan: FloorPlanDto,
  networkDevicesVisibility: NetworkDeviceType[],
  networkDevices: {
    [key: string]: TypeWiseNetworkDevices
  },
  onFloorPlanClick: Function,
  }) {
  const {
    setCoordinates,
    floorPlan,
    networkDevicesVisibility,
    networkDevices,
    onFloorPlanClick
  } = { ...props }

  const [imageUrl, setImageUrl] = useState('')

  useEffect(() => {
    if (floorPlan?.imageId) {
      const response = loadImageWithJWT(floorPlan?.imageId)
      response.then((_imageUrl) => {
        setImageUrl(_imageUrl)
      })
    }
  }, [floorPlan?.imageId])

  const imageRef = useRef<HTMLImageElement>(null)

  const onFloorplanImageClick = function (floorPlan: FloorPlanDto) {
    onFloorPlanClick(floorPlan)
  }

  const [{ isActive }, drop] = useDrop(
    () => ({
      accept: 'device',
      drop: (item: { device: NetworkDevice, markerRef: RefObject<HTMLDivElement> },
        monitor: DropTargetMonitor<{
          device: NetworkDevice;
          markerRef: RefObject<HTMLDivElement>;
      }, unknown>) => {


        const marker = item.markerRef.current?.children[0] as HTMLDivElement

        const newCoords = monitor.getDifferenceFromInitialOffset() as XYCoord

        const markerCoords: {
          x: number,
          y: number
        } = {
          x: marker && marker?.offsetLeft || 0,
          y: marker && marker?.offsetTop || 0
        }

        const placementCoords: {
          x: number,
          y: number
        } = {
          x: newCoords.x + markerCoords.x + 36,
          y: newCoords.y + markerCoords.y + 36
        }

        setUpdatedLocation(item.device, placementCoords)
      },
      collect: (monitor: DropTargetMonitor) => ({
        isActive: monitor.canDrop() && monitor.isOver()
      })
    })
  )

  function setUpdatedLocation (device: NetworkDevice,
    placementCoords: XYCoord) {

    const imageCoords = {
      x: imageRef?.current?.offsetWidth || 0,
      y: imageRef?.current?.offsetHeight || 0
    }
    if (placementCoords.x <= imageCoords.x && placementCoords.y <= imageCoords.y) {
      Object.assign(device.position, {
        floorplanId: device?.floorplanId,
        x: placementCoords.x,
        y: placementCoords.y,
        xPercent: (placementCoords.x / imageCoords.x) * 100,
        yPercent: (placementCoords.y / imageCoords.y) * 100
      })
    }
    setCoordinates(device)
  }


  return <Card>
    <Card.Title>
      { floorPlan?.name }
    </Card.Title>
    <UI.StyledImageWrapper
      onClick={() => onFloorplanImageClick(floorPlan)}>
      <div ref={drop}
        data-testid='dropContainer'
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%'
        }}></div>
      <NetworkDevices
        networkDevicesVisibility={networkDevicesVisibility}
        selectedFloorPlan={floorPlan}
        networkDevices={networkDevices}
        contextAlbum={false}
        galleryMode={true}/>
      <img alt='img'
        ref={imageRef}
        data-testid='fpImage'
        style={{
          width: 'auto',
          height: '100%',
          border: isActive ? '2px solid var(--acx-accents-orange-50)' : 'none'
        }}
        src={imageUrl} />
    </UI.StyledImageWrapper>
  </Card>
}