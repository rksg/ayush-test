import { useEffect, useState } from 'react'

import { Col, Row } from 'antd'

import { Card }                                                    from '@acx-ui/components'
import { FloorPlanDto, NetworkDeviceType, TypeWiseNetworkDevices } from '@acx-ui/rc/utils'

import NetworkDevices from '../NetworkDevices'

import * as UI from './styledComponents'



export default function GalleryView (props: {
  floorPlans: FloorPlanDto[],
  onFloorPlanClick: Function,
  networkDevices: {
    [key: string]: TypeWiseNetworkDevices
  },
  networkDevicesVisibility: NetworkDeviceType[] }) {
  const { floorPlans, onFloorPlanClick, networkDevices, networkDevicesVisibility } = { ...props }
  const [span, setSpan] = useState(12)

  useEffect(() => {
    (floorPlans?.length > 4) ? setSpan(8) : setSpan(12)
  }, [floorPlans])

  const onFloorplanImageClick = function (floorPlan: FloorPlanDto) {
    onFloorPlanClick(floorPlan)
  }

  return (
    <Row gutter={[16, 20]}>
      { floorPlans?.map((floorPlan, index) => <Col key={index} span={span}>
        <Card title={floorPlan?.name}>
          <UI.StyledImageWrapper>
            <NetworkDevices
              imageLoaded={true}
              networkDevicesVisibility={networkDevicesVisibility}
              selectedFloorPlan={floorPlan}
              networkDevices={networkDevices}
              contextAlbum={false}
              galleryMode={true}
              context=''/>
            <img alt='img'
              data-testid='fpImage'
              onClick={() => onFloorplanImageClick(floorPlan)}
              style={{ width: 'auto', height: '100%' }}
              src={floorPlan?.imageUrl} />
          </UI.StyledImageWrapper>
        </Card>
      </Col>) }
    </Row>)
}