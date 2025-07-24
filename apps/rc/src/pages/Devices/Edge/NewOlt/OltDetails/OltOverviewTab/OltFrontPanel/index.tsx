import { Tooltip } from 'antd'
import { useIntl } from 'react-intl'

import { Subtitle }                   from '@acx-ui/components'
import { QuestionMarkCircleOutlined } from '@acx-ui/icons-new'
import { EdgeNokiaOltData }           from '@acx-ui/rc/utils'

import * as UI  from './styledComponents'
import { Unit } from './Unit'

enum SlotType {
  NC = 'NC',
  LC = 'LC'
}

type SlotData = {
  type: SlotType,
  ports: SlotPort[]
}

export type SlotPort = {
  label: string,
  status?: string,
  info?: string,
  portSpeed?: string
}

const mockNetworkTermination = [
  {
    type: SlotType.NC,
    ports: [{
      label: 'TOD'
    }, {
      label: 'ALM'
    }, {
      label: 'OOB'
    }, {
      label: 'LEMI'
    }, {
      label: 'UPLINK'
    }, {
      label: 'UPLINK'
    }]
  }
]

const mockLineTermination = [
  {
    type: SlotType.LC,
    ports: Array.from({ length: 32 }, (_, index) => ({
      label: `S1/${index + 1}`,
      status: 'UP',
      info: '%info%',
      portSpeed: '1 Gb/sec'
    }))
  },
  {
    type: SlotType.LC,
    ports: Array.from({ length: 16 }, (_, index) => ({
      label: `S1/${index + 1}`,
      status: 'UP',
      info: '%info%',
      portSpeed: '1 Gb/sec'
    }))
  }
]

export const OltFrontPanel = (props: { oltDetails: EdgeNokiaOltData }) => {
  const { oltDetails } = props
  return <UI.Card>
    <UI.CardTitle>
      <Subtitle level={5}>{ oltDetails.model }</Subtitle>
      <div>
        <Tooltip title='Front Panel'>
          <QuestionMarkCircleOutlined size='sm' />
        </Tooltip>
      </div>
    </UI.CardTitle>
    <UI.Wrapper>
      { mockNetworkTermination.map((item, index) => {
        return <Slot index={index+1} data={item} />
      })}
      { mockLineTermination.map((item, index) => {
        return <Slot index={index+1} data={item} />
      })}
    </UI.Wrapper>

    <br />

    {/* <UI.Wrapper>
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
      data.type === SlotType.LC
        ? $t({ defaultMessage: 'PON LC {index}' }, { index })
        : $t({ defaultMessage: 'NT {index}' }, { index })
    }</UI.SlotTitle>
    <UI.SlotUnits type={data.type}>
      { data.ports.map((item, index) =>
        <Unit
          key={`${index}-${item.label}`}
          num={index+1}
          data={item}
          showLabel={data.type === SlotType.LC}
        />)
      }
    </UI.SlotUnits>
  </UI.Slot>
}