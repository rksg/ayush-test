import { Tooltip, Typography } from 'antd'

import { cssStr, StackedBarChart } from '@acx-ui/components'
import { EntitlementDeviceType }   from '@acx-ui/rc/utils'

import { SpaceWrapper } from '../SpaceWrapper'

import * as UI from './styledComponent'

interface MspSubscriptionUtilizationWidgetProps {
  deviceType: EntitlementDeviceType;
  title: string;
  used: number;
  assigned: number;
  total: number;
  barColors?: string[];
  tooltip?: string;
}

export const MspSubscriptionUtilizationWidget = (props: MspSubscriptionUtilizationWidgetProps) => {
  const {
    deviceType,
    title,
    used,
    assigned,
    total,
    tooltip
  } = props

  const isZeroQuantity = total <= 0

  let usedBarColors = [
    cssStr('--acx-accents-blue-50'),
    cssStr('--acx-semantics-green-50'),
    cssStr('--acx-neutrals-30')
  ]

  let series = [
    { name: 'used',
      value: isZeroQuantity ? 0: (used / total)*100 },
    { name: 'used2',
      value: isZeroQuantity ? 0: (assigned / total)*100 },
    { name: 'available',
      value: isZeroQuantity ? 100 : ((total-used-assigned) / total)*100 }
  ]

  return <>
    <SpaceWrapper full size='small' justifycontent='space-around'>
      <Typography.Text>{title}</Typography.Text>
      <StackedBarChart
        style={{ height: 16, width: 190 }}
        showLabels={false}
        showTotal={false}
        showTooltip={false}
        total={100}
        barWidth={12}
        data={[{
          category: `${deviceType} Licenses `,
          series
        }]}
        barColors={usedBarColors}
      />
      {tooltip ?
        <Tooltip
          title={tooltip}
          placement={'top'}
        >Total: {total}</Tooltip>
        : <Typography.Text>
          {used} / {total}
        </Typography.Text>}
    </SpaceWrapper>
    <div style={{ marginTop: '15px' }}>
      <UI.LegendDot style={{ marginLeft: '15px', backgroundColor: usedBarColors[0] }} />
      <span >MSP EC ({used})</span>
      <UI.LegendDot style={{ marginLeft: '15px', backgroundColor: usedBarColors[1] }} />
      <span >MSP Assigned ({assigned})</span>
      <UI.LegendDot style={{ marginLeft: '15px', backgroundColor: usedBarColors[2] }} />
      <span >Pending ({total - used - assigned})</span>
    </div>

  </>
}