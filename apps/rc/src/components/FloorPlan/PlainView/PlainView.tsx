import { useCallback, useEffect, useRef, useState } from 'react'

import { Col, Divider, Row, Space, Typography } from 'antd'
import { useIntl }                              from 'react-intl'

import { Button, Loader }                 from '@acx-ui/components'
import {
  ApplicationsSolid,
  MagnifyingGlassMinusOutlined,
  MagnifyingGlassPlusOutlined,
  SearchFitOutlined, SearchFullOutlined
} from '@acx-ui/icons'
import { FloorPlanDto } from '@acx-ui/rc/utils'

import * as UI   from './styledComponents'
import Thumbnail from './Thumbnail'

export enum ImageMode {
  FIT = 'fit',
  ZOOM_IN = '+',
  ZOOM_OUT = '-',
  ORIGINAL = 'original'
}

export function getImageFitPercentage (containerCoordsX: number,
  containerCoordsY: number, imageCoordsX: number, imageCoordsY: number) {
  let differencePercentage = 0

  if (containerCoordsX !== imageCoordsX || containerCoordsY !== imageCoordsY) {
    if (containerCoordsX > imageCoordsX) {
      differencePercentage = (imageCoordsX / containerCoordsX) * 100
    }
    if (imageCoordsX > containerCoordsX) {
      const temp_differencePercentage = (containerCoordsX / imageCoordsX) * 100
      differencePercentage = (temp_differencePercentage < differencePercentage)
        ? temp_differencePercentage : differencePercentage
    }
    if (containerCoordsY > imageCoordsY) {
      const temp_differencePercentage = (imageCoordsY / containerCoordsY) * 100
      differencePercentage = (temp_differencePercentage < differencePercentage)
        ? temp_differencePercentage : differencePercentage
    }
    if (imageCoordsY > containerCoordsY) {
      const temp_differencePercentage = (containerCoordsY / imageCoordsY) * 100
      differencePercentage = (temp_differencePercentage < differencePercentage)
        ? temp_differencePercentage : differencePercentage
    }
  }
  return differencePercentage
}

export default function PlainView (props: { floorPlans: FloorPlanDto[],
  toggleGalleryView: Function,
  defaultFloorPlan: FloorPlanDto,
  deleteFloorPlan: Function }) {
  const { floorPlans, toggleGalleryView, defaultFloorPlan, deleteFloorPlan } = props
  const { $t } = useIntl()
  const imageRef = useRef<HTMLImageElement>(null)
  const imageContainerRef = useRef<HTMLDivElement>(null)

  const [selectedFloorPlan, setSelectedFloorPlan] = useState<FloorPlanDto>(defaultFloorPlan)
  const [currentZoom, setCurrentZoom] = useState(1)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageMode, setImageMode] = useState(ImageMode.ORIGINAL)
  const [fitContainerSize, setFitContanierSize] = useState(0)

  const prepareImageTofit = useCallback((floorPlan: FloorPlanDto) => {
    zoom(ImageMode.ORIGINAL)
    setFitContanierSize(0)
    setImageLoaded(false)
    setSelectedFloorPlan(floorPlan)
  }, [])

  useEffect(() => {
    prepareImageTofit(defaultFloorPlan)
  },[floorPlans, defaultFloorPlan, prepareImageTofit])

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
    deleteFloorPlan(selectedFloorPlan?.id)
  }

  return (
    <>
      <Row justify='space-between'>
        <Col>
          <Typography.Title level={4} style={{ fontWeight: 'bold', lineHeight: '2rem' }}>
            {selectedFloorPlan?.name}
          </Typography.Title>
        </Col>
        <Col>
          <Space split={<Divider type='vertical' />}>
            <Button key='editBtn' type='link'>
              {$t({ defaultMessage: 'Edit' })}
            </Button>
            <Button key='deleteBtn' type='link'onClick={deleteHandler} >
              {$t({ defaultMessage: 'Delete' })}
            </Button>
          </Space>
        </Col>
      </Row>
      <Divider style={{ margin: '0' }} />
      <UI.ImageContainerWrapper>
        <UI.ImageContainer imageMode={imageMode}
          ref={imageContainerRef}
          currentZoom={currentZoom}
          data-testid='image-container'>
          <img
            data-testid='floorPlanImage'
            onLoad={() => onImageLoad()}
            style={{ maxHeight: '100%', width: '100%' }}
            ref={imageRef}
            alt={selectedFloorPlan?.name}
            src={selectedFloorPlan?.imageUrl} />
        </UI.ImageContainer>
        <UI.ImageLoaderContainer>
          <Loader states={[{ isLoading: !imageLoaded }]}></Loader>
        </UI.ImageLoaderContainer>
      </UI.ImageContainerWrapper>
      <UI.ImageButtonsContainer>
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
      {floorPlans.length > 1 && <Row style={{ backgroundColor: 'var(--acx-neutrals-10' }}>
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
                onFloorPlanSelection={onFloorPlanSelectionHandler} />
            })}
          </UI.StyledSpace>
        </Col>
      </Row>
      }
    </>
  )
}
