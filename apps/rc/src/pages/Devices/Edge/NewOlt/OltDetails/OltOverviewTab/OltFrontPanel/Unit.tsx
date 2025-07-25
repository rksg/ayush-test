import { Space, Tooltip } from 'antd'

import { TagsSolid, TagsOutline } from '@acx-ui/icons-new'
import { getIntl }                from '@acx-ui/utils'

import * as UI from './styledComponents'

import { SlotCage } from './index'

export const Unit = (props: {
    num: number,
    showLabel: boolean,
    data: SlotCage
  }) => {
  const { num, showLabel, data } = props
  return <UI.UnitWrapper>
    <Tooltip title={getTooltip(data)}>
      <UI.Unit />
    </Tooltip>
    { showLabel && <UI.UnitTitle>{num}</UI.UnitTitle>}
  </UI.UnitWrapper>
}

const getTooltip = (data: SlotCage) => {
  const { $t } = getIntl()

  return <div>
    <UI.TooltipStyle labelWidthPercent={50}>
      <UI.TooltipStyle.Item
        label={$t({ defaultMessage: 'Port' })}
        children={data.label}
      />
      <UI.TooltipStyle.Item
        label={$t({ defaultMessage: 'Status' })}
        children={data.status}
      />
      { data.unTaggedVlan && <UI.TooltipStyle.Item
        label={$t({ defaultMessage: 'VLAN' })}
        children={<>
          <Space size={4} style={{ width: '100%' }}>
            <TagsOutline size='sm' style={{ display: 'flex' }}/>{data.unTaggedVlan}
          </Space>
          <Space size={4} style={{ width: '100%', alignItems: 'start' }}>
            <TagsSolid size='sm' style={{ display: 'flex' }}/>{data.taggedVlan}
          </Space>
        </>
        }
      />}
      <UI.TooltipStyle.Item
        label={$t({ defaultMessage: 'Optic information' })}
        children={data.info}
      />
      <UI.TooltipStyle.Item
        label={$t({ defaultMessage: 'Port Speed' })}
        children={data.portSpeed}
      />
    </UI.TooltipStyle>
  </div>
}