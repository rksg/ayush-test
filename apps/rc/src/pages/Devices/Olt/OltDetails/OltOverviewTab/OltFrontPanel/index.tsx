import { Tooltip } from 'antd'
import { useIntl } from 'react-intl'

import { Subtitle }                           from '@acx-ui/components'
import { QuestionMarkCircleOutlined }         from '@acx-ui/icons-new'
import { Olt, OltCageStateEnum, OltSlotType } from '@acx-ui/olt/utils'

import { networkCardSlots, lineCardSlots } from '../../../mockdata'

import * as UI  from './styledComponents'
import { Unit } from './Unit'

type SlotData = {
  type: OltSlotType,
  ports: SlotCage[]
}

export type SlotCage = {
  label: string,
  status?: OltCageStateEnum,
  info?: string,
  portSpeed?: string,
  taggedVlan?: string,
  unTaggedVlan?: string
}

export const OltFrontPanel = (props: { oltDetails?: Olt }) => {
  const { oltDetails } = props
  return <UI.Card>
    <UI.CardTitle>
      <Subtitle level={5}>{ oltDetails?.model }</Subtitle>
      <div>
        <Tooltip title='Front Panel'>
          <QuestionMarkCircleOutlined size='sm' />
        </Tooltip>
      </div>
    </UI.CardTitle>
    <UI.Wrapper>
      { (networkCardSlots as SlotData[]).map((item, index) => {
        return <Slot key={`network-${index}`} index={index+1} data={item} />
      })}
      { (lineCardSlots as SlotData[]).map((item, index) => {
        return <Slot key={`line-${index}`} index={index+1} data={item} />
      })}
    </UI.Wrapper>

    {/*<UI.Wrapper>
      { networkCardSlots.concat(networkCardSlots).map((item, index) => {
        return <Slot index={index+1} data={item} />
      })}
      { lineCardSlots.map((item, index) => {
        return <Slot index={index+1} data={item} />
      })}
    </UI.Wrapper> */}

  </UI.Card>
}

export const Slot = (props: {
  index: number,
  data: SlotData
}) => {
  const { $t } = useIntl()
  const { data, index } = props
  return <UI.Slot type={data.type}>
    <UI.SlotTitle>{
      data.type === OltSlotType.LT
        ? $t({ defaultMessage: 'PON LC {index}' }, { index })
        : $t({ defaultMessage: 'NT {index}' }, { index })
    }</UI.SlotTitle>
    <UI.SlotUnits type={data.type}>
      { data.ports.map((item, index) =>
        <Unit
          key={`${index}-${item.label}`}
          num={index+1}
          data={item}
          showLabel={data.type === OltSlotType.LT}
        />)
      }
    </UI.SlotUnits>
  </UI.Slot>
}