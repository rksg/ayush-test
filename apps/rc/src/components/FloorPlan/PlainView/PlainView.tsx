import { useState } from 'react'

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

  const [selectedFloorPlan, setSelectedFloorPlan] = useState(floorPlans[0])

  function onFloorPlanSelectionHandler (floorPlan: FloorPlanDto) {
    setSelectedFloorPlan(floorPlan)
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
        <UI.ImageContainer>
          <UI.FloorPlanImage preview={false}
            width='100%'
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
