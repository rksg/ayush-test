import { useEffect, useRef, useState } from 'react'

import { Col, Divider, Row, Space, Typography } from 'antd'
import { useIntl }                              from 'react-intl'

import { Button, Loader }                 from '@acx-ui/components'
import {
  AppIcon,
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

export default function PlainView (props: { floorPlans: FloorPlanDto[] }) {
  const { floorPlans } = { ...props }
  const { $t } = useIntl()
  const imageRef = useRef<HTMLImageElement>(null)
  const imageContainerRef = useRef<HTMLDivElement>(null)

  const [selectedFloorPlan, setSelectedFloorPlan] = useState(floorPlans[0])
  const [currentZoom, setCurrentZoom] = useState(1)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageMode, setImageMode] = useState(ImageMode.FIT)
  const [fitContainerSize, setFitContanierSize] = useState(0)

  function onFloorPlanSelectionHandler (floorPlan: FloorPlanDto) {
    if (floorPlan.imageId !== selectedFloorPlan.imageId)
    {
      setImageLoaded(false)
      setSelectedFloorPlan(floorPlan)
      setCurrentZoom(1)
    }
  }

  useEffect(()=>{
    if (imageLoaded)
      fitFloorplanImage()
  },[selectedFloorPlan, imageLoaded])

  function zoom (type: ImageMode) {
    switch (type) {
      case '+':
        if (currentZoom < 5) {
          const calculatedZoom = currentZoom + 0.25
          setCurrentZoom(calculatedZoom)
        }
        setImageMode(ImageMode.ZOOM_IN)
        break
      case '-':
        if (currentZoom > 0.1) {
          if (currentZoom > 0.25) {
            const newZoomVal = currentZoom - 0.25
            const calculatedZoom = (newZoomVal < 0.1) ? 0.1 : newZoomVal
            setCurrentZoom(calculatedZoom)
          } else {
            setCurrentZoom(0.1)
          }
        }
        setImageMode(ImageMode.ZOOM_OUT)
        break
      case 'original':
        setCurrentZoom(1)
        setImageMode(ImageMode.ORIGINAL)
        break
      case 'fit':
        if (!fitContainerSize) {
          fitFloorplanImage()
        } else {
          setCurrentZoom(fitContainerSize)
        }
        setImageMode(ImageMode.FIT)
        break
    }
  }

  function setImageModeHandler (type: ImageMode) {
    zoom(type)
  }

  function fitFloorplanImage () {
    let differencePercentage = 0

    const containerCoordsX = imageContainerRef?.current?.parentElement?.offsetWidth || 0
    const containerCoordsY = imageContainerRef?.current?.parentElement?.offsetHeight || 0

    const imageCoordsX = imageRef?.current?.naturalWidth || 0
    const imageCoordsY = imageRef?.current?.naturalHeight || 0

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
        differencePercentage = (imageCoordsY / containerCoordsY) * 100
      }
      if (imageCoordsY > containerCoordsY) {
        const temp_differencePercentage = (containerCoordsY / imageCoordsY) * 100
        differencePercentage = (temp_differencePercentage < differencePercentage)
          ? temp_differencePercentage : differencePercentage
      }
    }
    
    if (differencePercentage) {
      const _zoom = Math.floor(differencePercentage) / 100
      setCurrentZoom(_zoom)
      setFitContanierSize(_zoom)
    }
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
            <Button key='deleteBtn' type='link'>
              {$t({ defaultMessage: 'Delete' })}
            </Button>
          </Space>
        </Col>
      </Row>
      <Divider style={{ margin: '0' }} />
      <UI.ImageContainerWrapper>
        <UI.ImageContainer imageMode={imageMode} ref={imageContainerRef} currentZoom={currentZoom}>
          <img
            onLoad={() => setImageLoaded(true)}
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
        <Space direction='vertical'
          style={
            {
              border: '1px solid var(--acx-neutrals-30)',
              borderRadius: '4px',
              backgroundColor: 'var(--acx-primary-white)'
            }
          }
          split={<Divider style={{
            lineHeight: '0px',
            margin: '0px',
            border: '1px solid var(--acx-neutrals-30)',
            borderRadius: '4px'
          }} />}
          size={0}>
          <Button
            onClick={() => setImageModeHandler(ImageMode.ZOOM_IN)}
            type='link'
            size='middle'
            icon={<MagnifyingGlassPlusOutlined />} />
          <Button
            onClick={() => setImageModeHandler(ImageMode.ZOOM_OUT)}
            type='link'
            size='middle'
            icon={<MagnifyingGlassMinusOutlined />} />
          <Button
            onClick={() => setImageModeHandler(ImageMode.ORIGINAL)}
            size='middle'
            type='link'
            icon={<SearchFullOutlined />} />
          <Button
            onClick={() => setImageModeHandler(ImageMode.FIT)}
            size='middle'
            type='link'
            icon={<SearchFitOutlined />}/>
        </Space>
      </UI.ImageButtonsContainer>
      {floorPlans.length > 1 && <Row>
        <UI.GallaryWrapper>
          <UI.GallaryIcon
            type='default'
            icon={<AppIcon />}
          />
        </UI.GallaryWrapper>
        <Col span={23}>
          <UI.StyledSpace size={[4,16]}>
            {floorPlans.map((floorPlan, index) => {
              return <Thumbnail
                key={index}
                floorPlan={floorPlan}
                active={selectedFloorPlan?.id === floorPlan?.id ? true : false}
                onFloorPlanSelection={onFloorPlanSelectionHandler} />
            })}
          </UI.StyledSpace>
        </Col>
      </Row>
      }
    </>
  )
}
