import { RefObject, useCallback, useEffect, useRef, useState } from 'react'

import { Col, Divider, Row, Space, Switch, Typography } from 'antd'
import { DropTargetMonitor, useDrop, XYCoord }          from 'react-dnd'
import { useIntl }                                      from 'react-intl'

import { Button, Loader, Tooltip } from '@acx-ui/components'
import { Features, useIsSplitOn }  from '@acx-ui/feature-toggle'
import {
  AccessPointWiFiOutlined,
  ApplicationsSolid,
  MagnifyingGlassMinusOutlined,
  MagnifyingGlassPlusOutlined,
  SearchFitOutlined,
  SearchFullOutlined
} from '@acx-ui/icons'
import { FloorplanContext, FloorPlanDto, FloorPlanFormDto, getImageFitPercentage, NetworkDevice, NetworkDeviceType, TypeWiseNetworkDevices } from '@acx-ui/rc/utils'
import { hasAccess }                                                                                                                         from '@acx-ui/user'
import { loadImageWithJWT }                                                                                                                  from '@acx-ui/utils'

import AddEditFloorplanModal from '../FloorPlanModal'
import NetworkDevices        from '../NetworkDevices'

import { ApMeshTopologyContextProvider } from './ApMeshTopologyContext'
import * as UI                           from './styledComponents'
import Thumbnail                         from './Thumbnail'


export enum ImageMode {
  FIT = 'fit',
  ZOOM_IN = '+',
  ZOOM_OUT = '-',
  ORIGINAL = 'original'
}

export function setUpdatedLocation (device: NetworkDevice,
  placementCoords: XYCoord, imageCoords: XYCoord): NetworkDevice {

  if (!device.position)
    device.position = { floorplanId: '', x: 0, y: 0, xPercent: 0, yPercent: 0 }

  if (placementCoords.x <= imageCoords.x && placementCoords.y <= imageCoords.y) {
    Object.assign(device.position, {
      x: placementCoords.x,
      y: placementCoords.y,
      xPercent: (placementCoords.x / imageCoords.x) * 100,
      yPercent: (placementCoords.y / imageCoords.y) * 100
    })
  }
  return device
}

export default function PlainView (props: { floorPlans: FloorPlanDto[],
  toggleGalleryView: Function,
  defaultFloorPlan: FloorPlanDto,
  deleteFloorPlan: Function,
  onAddEditFloorPlan: Function,
  networkDevices: {
    [key: string]: TypeWiseNetworkDevices
  },
  networkDevicesVisibility: NetworkDeviceType[],
  setCoordinates: Function,
  showRogueAp?: boolean }) {
  const { floorPlans,
    toggleGalleryView,
    defaultFloorPlan,
    deleteFloorPlan,
    onAddEditFloorPlan,
    networkDevices,
    networkDevicesVisibility,
    setCoordinates,
    showRogueAp } = props
  const { $t } = useIntl()
  const imageRef = useRef<HTMLImageElement>(null)
  const imageContainerRef = useRef<HTMLDivElement>(null)

  const [selectedFloorPlan, setSelectedFloorPlan] = useState<FloorPlanDto>(defaultFloorPlan)
  const [currentZoom, setCurrentZoom] = useState(1)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageMode, setImageMode] = useState(ImageMode.ORIGINAL)
  const [fitContainerSize, setFitContanierSize] = useState(0)
  const [imageUrl, setImageUrl] = useState('')
  const isApMeshTopologyFFOn = useIsSplitOn(Features.AP_MESH_TOPOLOGY)
  // eslint-disable-next-line max-len
  const [isApMeshTopologyEnabled, setIsApMeshTopologyEnabled] = useState<boolean>(isApMeshTopologyFFOn)

  const prepareImageTofit = useCallback((floorPlan: FloorPlanDto) => {
    zoom(ImageMode.ORIGINAL)
    setFitContanierSize(0)
    setImageLoaded(false)
    setSelectedFloorPlan(floorPlan)
  }, [])

  useEffect(() => {
    prepareImageTofit(defaultFloorPlan)
  },[defaultFloorPlan])

  useEffect(() => {
    if (selectedFloorPlan?.imageId) {
      const response = loadImageWithJWT(selectedFloorPlan?.imageId)
      response.then((_imageUrl) => {
        setImageUrl(_imageUrl)
      })
    }
  }, [selectedFloorPlan?.imageId])

  const [{ isActive }, drop] = useDrop(
    () => ({
      accept: 'device',
      drop: (item: { device: NetworkDevice, markerRef: RefObject<HTMLDivElement> },
        monitor: DropTargetMonitor<{
          device: NetworkDevice;
          markerRef: RefObject<HTMLDivElement>;
      }, unknown>) => {

        item.device.position = {
          ...item.device.position,
          floorplanId: selectedFloorPlan?.id
        }
        const imageCoords = {
          x: imageRef?.current?.offsetWidth || 0,
          y: imageRef?.current?.offsetHeight || 0
        }

        const placementCoords: XYCoord = { x: 0, y: 0 }

        if (item.markerRef) {
          const marker = item.markerRef.current?.children[0] as HTMLDivElement

          const newCoords = monitor.getDifferenceFromInitialOffset() as XYCoord

          const markerCoords: {
            x: number,
            y: number
          } = {
            x: marker && marker?.offsetLeft || 0,
            y: marker && marker?.offsetTop || 0
          }

          placementCoords.x = newCoords.x + markerCoords.x + 36
          placementCoords.y = newCoords.y + markerCoords.y + 36
        } else {
          const newCoords = monitor.getClientOffset() as XYCoord

          const imgX = imageRef?.current?.getBoundingClientRect().x || 0
          const imgY = imageRef?.current?.getBoundingClientRect().y || 0

          placementCoords.x = newCoords.x - imgX || 0
          placementCoords.y = newCoords.y - imgY || 0
        }
        const positionedDevice: NetworkDevice =
            setUpdatedLocation(item.device, placementCoords, imageCoords)
        setCoordinates(positionedDevice)
      },
      collect: (monitor) => ({
        isActive: monitor.canDrop() && monitor.isOver()
      })
    }),
    [selectedFloorPlan]
  )

  function onFloorPlanSelectionHandler (floorPlan: FloorPlanDto) {
    if (floorPlan.imageId !== selectedFloorPlan.imageId)
    {
      prepareImageTofit(floorPlan)
    }
  }

  function onImageLoad () {
    fitFloorplanImage()
    setImageLoaded(true)
  }

  function onEditFloorPlanHandler (floorPlan: FloorPlanFormDto) {
    onAddEditFloorPlan(floorPlan, true)
  }

  function zoom (mode: ImageMode) {
    switch (mode) {
      case ImageMode.ZOOM_IN:
        if (currentZoom < 5) {
          const calculatedZoom = currentZoom + 0.25
          setCurrentZoom(calculatedZoom)
        }
        break
      case ImageMode.ZOOM_OUT:
        if (currentZoom > 0.1) {
          if (currentZoom > 0.25) {
            const newZoomVal = currentZoom - 0.25
            const calculatedZoom = (newZoomVal < 0.1) ? 0.1 : newZoomVal
            setCurrentZoom(calculatedZoom)
          } else {
            setCurrentZoom(0.1)
          }
        }
        break
      case ImageMode.ORIGINAL:
        setCurrentZoom(1)
        break
      case ImageMode.FIT:
        if (!fitContainerSize) {
          fitFloorplanImage()
        } else {
          setCurrentZoom(fitContainerSize)
        }
        break
    }
    setImageMode(mode)
  }

  function setImageModeHandler (mode: ImageMode) {
    zoom(mode)
  }

  function fitFloorplanImage () {
    if (imageMode !== ImageMode.FIT) {
      const containerCoordsX = imageContainerRef?.current?.parentElement?.offsetWidth || 0
      const containerCoordsY = imageContainerRef?.current?.parentElement?.offsetHeight || 0

      const imageCoordsX = imageRef?.current?.offsetWidth || 0
      const imageCoordsY = imageRef?.current?.offsetHeight || 0


      const differencePercentage = getImageFitPercentage(containerCoordsX,
        containerCoordsY, imageCoordsX, imageCoordsY)

      if (differencePercentage) {
        const _zoom = Math.floor(differencePercentage) / 100
        setCurrentZoom(_zoom)
        setFitContanierSize(_zoom)
        setImageMode(ImageMode.FIT)
      }
    }
  }

  const onGalleryIconClick = function () {
    toggleGalleryView()
  }

  const deleteHandler = function () {
    deleteFloorPlan(selectedFloorPlan?.id, selectedFloorPlan?.name)
  }

  return (
    <>
      <Row justify='space-between' style={{ height: '2rem', alignItems: 'center' }}>
        <Col>
          <Typography.Title level={4} style={{ fontWeight: 'bold', marginBottom: '0' }}>
            {selectedFloorPlan?.name}
          </Typography.Title>
        </Col>
        <Col>
          { hasAccess() && !showRogueAp &&
          <Space split={<Divider type='vertical' />}>
            {isApMeshTopologyFFOn &&
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Switch onChange={setIsApMeshTopologyEnabled} checked={isApMeshTopologyEnabled} />
                {$t({ defaultMessage: 'Show Mesh Topology' })}
              </div>
            }
            <AddEditFloorplanModal
              buttonTitle={$t({ defaultMessage: 'Edit' })}
              onAddEditFloorPlan={onEditFloorPlanHandler}
              isEditMode={true}
              selectedFloorPlan={selectedFloorPlan}/>
            <Button key='deleteBtn' type='link' onClick={deleteHandler} >
              {$t({ defaultMessage: 'Delete' })}
            </Button>
          </Space>
          }
        </Col>
      </Row>
      <Divider style={{ margin: '0' }} />
      <UI.ImageContainerWrapper>
        { showRogueAp && <UI.RogueAPHelpIcon className='rogue-help-info'>
          <Tooltip.Question
            trigger='click'
            placement='right'
            title={<RogueAPHelpTooltip/>} />
        </UI.RogueAPHelpIcon> }
        <UI.ImageContainer imageMode={imageMode}
          ref={imageContainerRef}
          currentZoom={currentZoom}
          data-testid='image-container'>
          <div ref={drop}
            data-testid='dropContainer'
            style={{
              backgroundColor: showRogueAp ? 'rgba(0, 0, 0, 0.4)' : '',
              position: 'absolute',
              width: '100%',
              height: '100%'
            }}></div>
          { imageLoaded &&
            <ApMeshTopologyContextProvider
              isApMeshTopologyEnabled={isApMeshTopologyEnabled}
              floorplanId={selectedFloorPlan.id}
              children={<NetworkDevices
                networkDevicesVisibility={networkDevicesVisibility}
                selectedFloorPlan={selectedFloorPlan}
                networkDevices={networkDevices}
                contextAlbum={false}
                context={FloorplanContext['ap']}
                galleryMode={false}
                showRogueAp={showRogueAp}
              />}
            />
          }
          <img
            data-testid='floorPlanImage'
            onLoad={() => onImageLoad()}
            style={{ maxHeight: '100%',
              width: '100%',
              border: isActive ? '2px solid var(--acx-accents-orange-50)' : 'none' }}
            ref={imageRef}
            alt={selectedFloorPlan?.name}
            src={imageUrl} />
        </UI.ImageContainer>
        { !imageLoaded && <UI.ImageLoaderContainer>
          <Loader states={[{ isLoading: !imageLoaded }]}></Loader>
        </UI.ImageLoaderContainer> }
      </UI.ImageContainerWrapper>
      <UI.ImageButtonsContainer
        alignbottom={floorPlans.length > 1 ? 0 : 1}>
        <Button
          data-testid='image-zoom-in'
          onClick={() => setImageModeHandler(ImageMode.ZOOM_IN)}
          type='link'
          size='middle'
          icon={<MagnifyingGlassPlusOutlined />} />
        <Button
          data-testid='image-zoom-out'
          onClick={() => setImageModeHandler(ImageMode.ZOOM_OUT)}
          type='link'
          size='middle'
          icon={<MagnifyingGlassMinusOutlined />} />
        <Button
          data-testid='image-zoom-original'
          onClick={() => setImageModeHandler(ImageMode.ORIGINAL)}
          size='middle'
          type='link'
          icon={<SearchFullOutlined />} />
        <Button
          data-testid='image-zoom-fit'
          onClick={() => setImageModeHandler(ImageMode.FIT)}
          size='middle'
          type='link'
          icon={<SearchFitOutlined />}/>
      </UI.ImageButtonsContainer>
      {!!(floorPlans.length > 1) && <Row style={{ backgroundColor: 'var(--acx-neutrals-10' }}>
        <UI.GallaryWrapper>
          <UI.GallaryIcon
            data-testid='galleryIcon'
            onClick={() => onGalleryIconClick()}
            type='default'
            icon={<ApplicationsSolid />}
          />
        </UI.GallaryWrapper>
        <Col span={23}>
          <UI.StyledSpace size={[4,16]}>
            {floorPlans.map((floorPlan, index) => {
              return <Thumbnail
                key={index}
                floorPlan={floorPlan}
                active={selectedFloorPlan?.id === floorPlan?.id ? 1 : 0}
                onFloorPlanSelection={onFloorPlanSelectionHandler}
                networkDevicesVisibility={networkDevicesVisibility}
                networkDevices={networkDevices}/>
            })}
          </UI.StyledSpace>
        </Col>
      </Row>
      }
    </>
  )
}

export function RogueAPHelpTooltip () {
  const { $t } = useIntl()
  return <UI.TooltipContent className='rogue-ap-tooltip-content'>
    <div className='rogue-help'>
      <div className='rogue-mark malicious'>
        <AccessPointWiFiOutlined />
      </div>
      <div className='info'>{$t({ defaultMessage: 'Detecting Malicious rogue' })}</div>
    </div>
    <div className='rogue-help'>
      <div className='rogue-mark unclassified'>
        <AccessPointWiFiOutlined />
      </div>
      <div className='info'>{$t({ defaultMessage: 'Detecting Unclassified rogue' })}</div>
    </div>
    <div className='rogue-help'>
      <div className='rogue-mark known'>
        <AccessPointWiFiOutlined />
      </div>
      <div className='info'>{$t({ defaultMessage: 'Detecting Known rogue' })}</div>
    </div>
    <div className='rogue-help'>
      <div className='rogue-mark ignored'>
        <AccessPointWiFiOutlined />
      </div>
      <div className='info'>{$t({ defaultMessage: 'Detecting Ignored rogue/ no rogues' })}</div>
    </div>
  </UI.TooltipContent>
}
