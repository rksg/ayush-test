import { Tooltip } from 'antd'
import { useIntl } from 'react-intl'

import { Subtitle }                   from '@acx-ui/components'
import { QuestionMarkCircleOutlined } from '@acx-ui/icons-new'
import { Olt, OltCageStateEnum }      from '@acx-ui/olt/utils'

import * as UI  from './styledComponents'
import { Unit } from './Unit'

enum SlotType {
  NT = 'NT',
  LT = 'LT'
}

type SlotData = {
  type: SlotType,
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

const mockNetworkTermination = [
  {
    type: SlotType.NT,
    ports: [{
      label: 'TOD',
      status: 'up' as OltCageStateEnum,
      info: '%info%',
      portSpeed: '1 Gb/sec'
    }, {
      label: 'ALM',
      status: OltCageStateEnum.UP,
      info: '%info%',
      portSpeed: '1 Gb/sec'
    }, {
      label: 'OOB',
      status: OltCageStateEnum.UP,
      info: '%info%',
      portSpeed: '1 Gb/sec'
    }, {
      label: 'LEMI',
      status: OltCageStateEnum.DOWN,
      info: '%info%',
      portSpeed: '1 Gb/sec'
    }, {
      label: 'UPLINK',
      status: OltCageStateEnum.DOWN,
      info: '%info%',
      portSpeed: '1 Gb/sec',
      taggedVlan: '2,3,4',
      unTaggedVlan: '1'
    }, {
      label: 'UPLINK',
      status: OltCageStateEnum.UP,
      info: '%info%',
      portSpeed: '1 Gb/sec',
      taggedVlan: '2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17',
      unTaggedVlan: '1'
    }]
  }
]

const mockLineTermination = [
  {
    type: SlotType.LT,
    ports: Array.from({ length: 32 }, (_, index) => ({
      label: `S1/${index + 1}`,
      status: OltCageStateEnum.UP,
      info: '%info%',
      portSpeed: '1 Gb/sec'
    }))
  },
  {
    type: SlotType.LT,
    ports: Array.from({ length: 16 }, (_, index) => ({
      label: `S2/${index + 1}`,
      status: OltCageStateEnum.UP,
      info: '%info%',
      portSpeed: '1 Gb/sec'
    }))
  }
]

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
      { mockNetworkTermination.map((item, index) => {
        return <Slot key={`network-${index}`} index={index+1} data={item} />
      })}
      { mockLineTermination.map((item, index) => {
        return <Slot key={`line-${index}`} index={index+1} data={item} />
      })}
    </UI.Wrapper>

    {/* <br />
    <UI.Wrapper>
      { mockNetworkTermination.concat(mockNetworkTermination).map((item, index) => {
        return <Slot index={index+1} data={item} />
      })}
      { mockLineTermination.map((item, index) => {
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
      data.type === SlotType.LT
        ? $t({ defaultMessage: 'PON LC {index}' }, { index })
        : $t({ defaultMessage: 'NT {index}' }, { index })
    }</UI.SlotTitle>
    <UI.SlotUnits type={data.type}>
      { data.ports.map((item, index) =>
        <Unit
          key={`${index}-${item.label}`}
          num={index+1}
          data={item}
          showLabel={data.type === SlotType.LT}
        />)
      }
    </UI.SlotUnits>
  </UI.Slot>
}