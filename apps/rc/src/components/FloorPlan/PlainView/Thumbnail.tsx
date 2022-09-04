import { Image } from 'antd'

import { FloorPlanDto } from '@acx-ui/rc/utils'

import * as UI from './styledComponents'

export default function Thumbnail (props: { 
    floorPlan: FloorPlanDto,
    active: boolean,
    onFloorPlanSelection: CallableFunction }) {
  const { floorPlan, active, onFloorPlanSelection } = { ...props }
  function selectFloorPlan () {
    onFloorPlanSelection(floorPlan)
  }

  return <UI.Thumbnail>
    <UI.StyledCardGrid onClick={selectFloorPlan} hoverable={false} active={active}>
      <Image
        style={{ width: '78px', height: '53px' }}
        preview={false}
        src={floorPlan.imageUrl} />
    </UI.StyledCardGrid>
    <UI.ImageDesc key={floorPlan.name} active={active}>
      {floorPlan.name}
    </UI.ImageDesc>
  </UI.Thumbnail>
}