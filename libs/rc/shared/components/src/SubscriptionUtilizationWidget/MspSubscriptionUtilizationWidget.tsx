import { Space, Tooltip, Typography } from 'antd'
import { useIntl }                    from 'react-intl'

import { cssStr, StackedBarChart } from '@acx-ui/components'
import { EntitlementDeviceType }   from '@acx-ui/rc/utils'

import { SpaceWrapper } from '../SpaceWrapper'

import * as UI from './styledComponent'

interface MspSubscriptionUtilizationWidgetProps {
  deviceType: EntitlementDeviceType;
  title: string;
  multiLine?: boolean;
  used: number;
  assigned: number;
  total: number;
  barColors?: string[];
  tooltip?: string;
  trial?: boolean;
  extendedTrial: boolean;
}

export const MspSubscriptionUtilizationWidget = (props: MspSubscriptionUtilizationWidgetProps) => {
  const { $t } = useIntl()
  const {
    deviceType,
    title,
    multiLine,
    used,
    assigned,
    total,
    tooltip,
    trial,
    extendedTrial
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
  ].map(item => {
    return { ...item, itemStyle: {
      borderRadius: [0, 0, 0, 0]
    } }
  })

  const utilBar = <>
    <SpaceWrapper full size='small' justifycontent='space-around'>
      <Typography.Text>{title}</Typography.Text>
      <UI.StackedBarContainer>
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
      </UI.StackedBarContainer>
      {tooltip ?
        <Tooltip
          title={trial ? '' : tooltip}
          placement={'top'}
        >{trial ? $t({ defaultMessage: 'Total Trial: {total}' }, { total })
            : $t({ defaultMessage: 'Total Paid: {total}' }, { total })}
        </Tooltip>
        : <Typography.Text>
          {used+assigned} / {total}
        </Typography.Text>}
    </SpaceWrapper>
    {trial ? <div style={{ marginTop: '15px' }}>
      <UI.LegendDot style={{ marginLeft: '45px', backgroundColor: usedBarColors[1] }} />
      <span >{$t({ defaultMessage: 'MSP Assigned' })} ({assigned})</span>
      <UI.LegendDot style={{ marginLeft: '15px', backgroundColor: usedBarColors[2] }} />
      <span >{$t({ defaultMessage: 'Available' })} ({total - assigned})</span>
    </div> : <div style={{ marginTop: '15px' }}>
      <UI.LegendDot style={{ marginLeft: '15px', backgroundColor: usedBarColors[0] }} />
      <span >{$t({ defaultMessage: 'MSP EC' })} ({used})</span>
      <UI.LegendDot style={{ marginLeft: '15px', backgroundColor: usedBarColors[1] }} />
      <span >{$t({ defaultMessage: 'MSP Assigned' })} ({assigned})</span>
      <UI.LegendDot style={{ marginLeft: '15px', backgroundColor: usedBarColors[2] }} />
      <span >{$t({ defaultMessage: 'Available' })} ({total - used - assigned})</span>
    </div>}
  </>

  const utilBar2 =
  <Space size={10} direction='vertical'>
    <UI.FieldLabelUtilMsp>
      <div>
        <li>{title}</li>
        <li>{trial ? $t({ defaultMessage: 'Trial Licenses' })
          : $t({ defaultMessage: 'Paid Licenses' })}
        </li>
      </div>
      <Space size={10} direction='vertical'>
        <UI.StackedBarContainer>
          <StackedBarChart
            style={{ height: 12, width: 290 }}
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
        </UI.StackedBarContainer>
        {trial && (!extendedTrial && used === 0)
          ? <div style={{ marginLeft: '25px', fontSize: '11px' }}>
            <UI.LegendDot style={{ backgroundColor: usedBarColors[1] }} />
            <span >{$t({ defaultMessage: 'MSP Assigned' })} ({assigned})</span>
            <UI.LegendDot style={{ marginLeft: '15px', backgroundColor: usedBarColors[2] }} />
            <span >{$t({ defaultMessage: 'Available' })} ({total - assigned})</span>
          </div>
          : <div style={{ marginLeft: '5px', fontSize: '11px' }}>
            <UI.LegendDot style={{ backgroundColor: usedBarColors[0] }} />
            <span >{$t({ defaultMessage: 'MSP EC' })} ({used})</span>
            <UI.LegendDot style={{ marginLeft: '15px', backgroundColor: usedBarColors[1] }} />
            <span >{$t({ defaultMessage: 'MSP Assigned' })} ({assigned})</span>
            <UI.LegendDot style={{ marginLeft: '15px', backgroundColor: usedBarColors[2] }} />
            <span >{$t({ defaultMessage: 'Available' })} ({total - used - assigned})</span>
          </div>}
      </Space>
      {tooltip ?
        <Tooltip
          title={trial ? '' : tooltip}
          placement={'top'}
        ><Typography.Text>{used+assigned} / {total}</Typography.Text>
        </Tooltip>
        : <Typography.Text>{used+assigned} / {total}</Typography.Text>}
    </UI.FieldLabelUtilMsp>
  </Space>

  return multiLine ? utilBar2 : utilBar
}