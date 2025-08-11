import { Space, Tooltip } from 'antd'

import { TagsSolid, TagsOutline } from '@acx-ui/icons-new'
import { OltCageStateEnum }       from '@acx-ui/olt/utils'
import { getIntl }                from '@acx-ui/utils'

import { OltStatus } from '../OltStatus'

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
  const hasTagInfo = data.taggedVlan || data.unTaggedVlan

  return <div>
    <UI.TooltipDescriptions labelWidthPercent={50}>
      <UI.TooltipDescriptions.Item
        label={$t({ defaultMessage: 'Port' })}
        children={data.label}
      />
      <UI.TooltipDescriptions.Item
        label={$t({ defaultMessage: 'Status' })}
        children={<OltStatus
          type='cage'
          status={data.status as OltCageStateEnum}
          showText
          style={{ color: 'var(--acx-primary-white)' }}
        />}
      />
      { hasTagInfo && <UI.TooltipDescriptions.Item
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
      <UI.TooltipDescriptions.Item
        label={$t({ defaultMessage: 'Optic information' })}
        children={data.info}
      />
      <UI.TooltipDescriptions.Item
        label={$t({ defaultMessage: 'Port Speed' })}
        children={data.portSpeed}
      />
    </UI.TooltipDescriptions>
  </div>
}