import { Space, Typography } from 'antd'
import { useIntl }           from 'react-intl'

import { cssStr, StackedBarChart } from '@acx-ui/components'
import { EntitlementDeviceType }   from '@acx-ui/rc/utils'

import { SpaceWrapper } from '../SpaceWrapper'

import * as UI from './styledComponent'

interface SubscriptionUtilizationWidgetProps {
  deviceType: EntitlementDeviceType;
  title: string;
  title2?: string;
  used: number;
  total: number;
  barColors?: string[];
}

export const SubscriptionUtilizationWidget = (props: SubscriptionUtilizationWidgetProps) => {
  const { $t } = useIntl()
  const {
    deviceType,
    title,
    title2,
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

  const utilBar =
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

  const utilBar2 =
  <Space size={10} direction='vertical'>
    <UI.FieldLabelUtil>
      <div>
        <div>{title}</div>
        <div>{title2}</div>
      </div>
      <Space size={10} direction='vertical'>
        <StackedBarChart
          style={{ height: 12, width: 250 }}
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
        <div style={{ fontSize: '11px' }}>
          <UI.LegendDot style={{ marginLeft: '25px', backgroundColor: usedBarColors[0] }} />
          <span >{$t({ defaultMessage: 'Used' })} ({used})</span>
          <UI.LegendDot style={{ marginLeft: '15px', backgroundColor: usedBarColors[1] }} />
          <span >{$t({ defaultMessage: 'Available' })} ({total - used})</span>
        </div>
      </Space>
      <Typography.Text>
        {
          isOverused
            ? <UI.OverutilizationText>{used}</UI.OverutilizationText>
            : used
        } / {total}
      </Typography.Text>
    </UI.FieldLabelUtil>
  </Space>

  return title2 ? utilBar2 : utilBar
}