import { Image }                                     from 'antd'
import { defineMessage, MessageDescriptor, useIntl } from 'react-intl'

import { FloorPlanDto } from '@acx-ui/rc/utils'

import * as UI from './styledComponents'

export default function Thumbnail (props: {
    floorPlan: FloorPlanDto,
    active: number,
    onFloorPlanSelection: CallableFunction }) {
  const { floorPlan, active, onFloorPlanSelection } = props
  const { $t } = useIntl()
  function selectFloorPlan () {
    onFloorPlanSelection(floorPlan)
  }

  const altMessage: MessageDescriptor = defineMessage({
    defaultMessage: 'Thumbnail for {floorPlanName}'
  })

  return <UI.Thumbnail>
    <UI.StyledCardGrid
      onClick={selectFloorPlan}
      hoverable={false}
      active={active}
      data-testid='thumbnailBg'>
      <Image
        style={{ width: '78px', height: '53px' }}
        preview={false}
        src={floorPlan.imageUrl}
        alt={$t(altMessage,
          { floorPlanName: floorPlan?.name })}/>
    </UI.StyledCardGrid>
    <UI.ImageDesc key={floorPlan.name} active={active}>
      {floorPlan.name}
    </UI.ImageDesc>
  </UI.Thumbnail>
}