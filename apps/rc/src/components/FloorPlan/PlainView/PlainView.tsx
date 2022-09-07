import { useEffect, useRef, useState } from 'react'

import { Col, Divider, Row, Space, Typography } from 'antd'
import { useIntl }                              from 'react-intl'

import { Button }       from '@acx-ui/components'
import { AppIcon }      from '@acx-ui/icons'
import { FloorPlanDto } from '@acx-ui/rc/utils'

import * as UI   from './styledComponents'
import Thumbnail from './Thumbnail'



export default function PlainView (props: { floorPlans: FloorPlanDto[] }) {
  const { floorPlans } = { ...props }
  const { $t } = useIntl()
  const imageRef = useRef<HTMLImageElement>(null)
  const imageContainerRef = useRef<HTMLDivElement>(null)

  const [selectedFloorPlan, setSelectedFloorPlan] = useState(floorPlans[0])
  const [currentZoom, setCurrentZoom] = useState(1)
  const [imageLoaded, setImageLoaded] = useState(false)

  function onFloorPlanSelectionHandler (floorPlan: FloorPlanDto) {
    setImageLoaded(false)
    if (floorPlan.imageId !== selectedFloorPlan.imageId)
    {
      setSelectedFloorPlan(floorPlan)
      setCurrentZoom(1)
    }
  }

  useEffect(()=>{
    if (imageLoaded)
      fitFloorplanImage()
  },[selectedFloorPlan, imageLoaded])

  function fitFloorplanImage () {
    let differencePercentage = 0

    const containerCoordsX = imageContainerRef?.current?.offsetWidth || 0
    const containerCoordsY = imageContainerRef?.current?.offsetHeight || 0

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
    
    if (differencePercentage) {
      const _zoom = Math.floor(differencePercentage) / 100
      setCurrentZoom(_zoom)
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
        <UI.ImageContainer ref={imageContainerRef} currentZoom={currentZoom}>
          <img
            onLoad={() => setImageLoaded(true)}
            ref={imageRef}
            width='100%'
            height='100%'
            alt={selectedFloorPlan?.name}
            src={selectedFloorPlan?.imageUrl} />
        </UI.ImageContainer>
      </UI.ImageContainerWrapper>
      {floorPlans.length > 1 && <Row>
        <UI.GallaryWrapper>
          <UI.GallaryIcon
            type='default'
            icon={<AppIcon />}
          />
        </UI.GallaryWrapper>
        <Col span={22}>
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
