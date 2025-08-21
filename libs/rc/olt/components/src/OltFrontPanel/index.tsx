import { Tooltip }            from 'antd'
import { useIntl, IntlShape } from 'react-intl'

import { Subtitle }                       from '@acx-ui/components'
import { QuestionMarkCircleOutlined }     from '@acx-ui/icons-new'
import {  OltCageStateEnum, OltSlotType } from '@acx-ui/olt/utils'

import * as UI  from './styledComponents'
import { Unit } from './Unit'

type SlotData = {
  type: OltSlotType,
  slots?: SlotCage[]
}

export type SlotCage = {
  label: string,
  type?: string,
  status?: OltCageStateEnum,
  info?: string,
  portSpeed?: string,
  taggedVlan?: string,
  untaggedVlan?: string
}

const getSlotTitle = ($t: IntlShape['$t'], type: OltSlotType, index: number) => {
  switch (type) {
    case OltSlotType.LT:
      return $t({ defaultMessage: 'PON LC {index}' }, { index })
    case OltSlotType.NT:
      return $t({ defaultMessage: 'NT {index}' }, { index })
    default:
      return ''
  }
}

export const OltFrontPanel = (props: { title?: string, data?: SlotData[] }) => {
  const { title, data } = props
  const counters: Record<string, number> = {}
  return <UI.Card>
    <UI.CardTitle>
      <Subtitle level={5}>{title}</Subtitle>
      <div>
        {/* TODO */}
        <Tooltip title='Front Panel'>
          <QuestionMarkCircleOutlined size='sm' />
        </Tooltip>
      </div>
    </UI.CardTitle>
    <UI.Wrapper>
      { data?.length && data.map((item, index) => {
        counters[item.type] = (counters[item.type] || 0) + 1
        return <Slot key={`${index}-${item.type}`} index={counters[item.type]} data={item} />
      })}
    </UI.Wrapper>
  </UI.Card>
}

export const Slot = (props: {
  index: number,
  data: SlotData
}) => {
  const { $t } = useIntl()
  const { data, index } = props
  return <UI.Slot type={data.type}>
    <UI.SlotTitle>{getSlotTitle($t, data.type, index)}</UI.SlotTitle>
    <UI.SlotUnits type={data.type}>
      { data.slots?.map((item, index) =>
        <Unit
          key={`${index}-${item.label}`}
          num={index+1}
          data={item}
          showLabel={data.type !== OltSlotType.NT}
        />)
      }
    </UI.SlotUnits>
  </UI.Slot>
}