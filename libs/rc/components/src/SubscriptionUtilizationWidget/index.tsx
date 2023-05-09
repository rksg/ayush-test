import { Typography } from 'antd'

import { cssStr, StackedBarChart } from '@acx-ui/components'
import { EntitlementDeviceType }   from '@acx-ui/rc/utils'

import { SpaceWrapper } from '../SpaceWrapper'

import * as UI from './styledComponent'

interface SubscriptionUtilizationWidgetProps {
  deviceType: EntitlementDeviceType;
  title: string;
  used: number;
  total: number;
  barColors?: string[];
}

export const SubscriptionUtilizationWidget = (props: SubscriptionUtilizationWidgetProps) => {
  const {
    deviceType,
    title,
    used,
    total
  } = props

  const isZeroQuantity = total <= 0
  const isOverused = used > total

  let usedBarColors = [
    cssStr('--acx-accents-blue-50'),
    cssStr('--acx-neutrals-30')
  ]

  let series = [
    { name: 'used',
      value: isZeroQuantity ? 0: (used / total)*100 },
    { name: 'available',
      value: isZeroQuantity ? 100 : ((total-used) / total)*100 }
  ]

  if (isOverused) {
    usedBarColors = [
      cssStr('--acx-accents-blue-50'),
      cssStr('--acx-semantics-red-50')
    ]

    const overPercent = (Math.abs(total-used) / total)*100
    series = [
      { name: 'used',
        value: isZeroQuantity ? 0 : (100 - (overPercent > 100 ? 100 : overPercent)) },
      { name: 'overused',
        value: isZeroQuantity ? 100: overPercent }
    ]
  }

  return (
    <SpaceWrapper full size='small' justifycontent='space-around'>
      <Typography.Text>{title}</Typography.Text>
      <StackedBarChart
        style={{ height: 16, width: 135 }}
        showLabels={false}
        showTotal={false}
        showTooltip={false}
        barWidth={12}
        data={[{
          category: `${deviceType} Licenses `,
          series
        }]}
        barColors={usedBarColors}
      />
      <Typography.Text>
        {
          isOverused
            ? <UI.OverutilizationText>{used}</UI.OverutilizationText>
            : used
        } / {total}
      </Typography.Text>
    </SpaceWrapper>
  )
}