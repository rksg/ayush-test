import { Tooltip, Typography } from 'antd'
import { useIntl }             from 'react-intl'

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
  const { $t } = useIntl()
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
    // name does not need i18n as these will not shown, just for ordering purpose.
    { name: '<3>used',
      value: isZeroQuantity ? 0: (used / total)*100 },
    { name: '<2>assigned',
      value: isZeroQuantity ? 0: (assigned / total)*100 },
    { name: '<1>available',
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
      <span >{$t({ defaultMessage: 'MSP EC' })} ({used})</span>
      <UI.LegendDot style={{ marginLeft: '15px', backgroundColor: usedBarColors[1] }} />
      <span >{$t({ defaultMessage: 'MSP Assigned' })} ({assigned})</span>
      <UI.LegendDot style={{ marginLeft: '15px', backgroundColor: usedBarColors[2] }} />
      <span >{$t({ defaultMessage: 'Pending' })} ({total - used - assigned})</span>
    </div>

  </>
}