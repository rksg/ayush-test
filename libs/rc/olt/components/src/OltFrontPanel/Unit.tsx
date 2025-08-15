import { Space, Tooltip } from 'antd'

import { TagsSolid, TagsOutline }                    from '@acx-ui/icons-new'
import { UplinkPortSolid, LagMemberSolid, PoeUsage } from '@acx-ui/icons-new'
import { OltCageStateEnum }                          from '@acx-ui/olt/utils'
import { getIntl }                                   from '@acx-ui/utils'

import { OltStatus } from '../OltStatus'

import * as UI from './styledComponents'

import { SlotCage } from './index'

enum UnitType {
  UPLINK = 'uplink',
  LAG = 'lag',
  POE = 'poe',
  // LACP = 'lacp',
  // CG = 'cage_group'
}
const formatNumber = (num: number) => String(num).padStart(2, '0')

//TODO: wait for new icons
const UnitIcon = ({ type }: { type?: string }) => {
  switch (type) {
    case UnitType.UPLINK:
      return <UplinkPortSolid size='sm' />
    case UnitType.LAG:
      return <LagMemberSolid size='sm' />
    case UnitType.POE:
      return <PoeUsage size='sm' />
    // case UnitType.LACP:
    //   return
    // case UnitType.CG:
    //   return
    default:
      return <> </>
  }
}

export const Unit = (props: {
    num: number,
    showLabel: boolean,
    data: SlotCage
  }) => {
  const { num, showLabel, data } = props
  return <UI.UnitWrapper>
    <Tooltip title={getTooltip(data)}>
      <UI.Unit status={data.status}>
        <UnitIcon type={data.type?.toLowerCase()} />
      </UI.Unit>
    </Tooltip>
    { showLabel && <UI.UnitTitle>{formatNumber(num)}</UI.UnitTitle>}
  </UI.UnitWrapper>
}

const getTooltip = (data: SlotCage) => {
  const { $t } = getIntl()
  const hasTagInfo = data.taggedVlan || data.untaggedVlan

  return <div>
    <UI.TooltipDescriptions labelWidthPercent={50}>
      { data.label && <UI.TooltipDescriptions.Item
        label={$t({ defaultMessage: 'Port' })}
        children={data.label}
      />}
      { data.status && <UI.TooltipDescriptions.Item
        label={$t({ defaultMessage: 'Status' })}
        children={<OltStatus
          type='cage'
          status={data.status as OltCageStateEnum}
          showText
          style={{ color: 'var(--acx-primary-white)' }}
        />}
      />}
      { hasTagInfo && <UI.TooltipDescriptions.Item
        label={$t({ defaultMessage: 'VLAN' })}
        children={<>
          <Space size={4} style={{ width: '100%' }}>
            <TagsOutline size='sm' style={{ display: 'flex' }}/>{data.untaggedVlan}
          </Space>
          <Space size={4} style={{ width: '100%', alignItems: 'start' }}>
            <TagsSolid size='sm' style={{ display: 'flex' }}/>{data.taggedVlan}
          </Space>
        </>
        }
      />}
      { data.info && <UI.TooltipDescriptions.Item
        label={$t({ defaultMessage: 'Optic information' })}
        children={data.info}
      />}
      { data.portSpeed && <UI.TooltipDescriptions.Item
        label={$t({ defaultMessage: 'Port Speed' })}
        children={data.portSpeed}
      />}
    </UI.TooltipDescriptions>
  </div>
}