import { Typography } from 'antd'
import { useIntl }    from 'react-intl'

import {
  cssStr,
  Loader,
  StackedBarChart,
  Subtitle
} from '@acx-ui/components'
import { SpaceWrapper }           from '@acx-ui/rc/components'
import {
  useGetEntitlementSummaryQuery
} from '@acx-ui/rc/services'
import {
  EntitlementDeviceType,
  EntitlementSummary,
  EntitlementDeviceTypes,
  getEntitlementDeviceTypes
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

import * as UI from './styledComponent'

interface SubscriptionUtilizationWidgetProps {
  deviceType: EntitlementDeviceType;
  title: string;
  used: number;
  total: number;
  barColors?: string[];
}

const SubscriptionUtilizationWidget = (props: SubscriptionUtilizationWidgetProps) => {
  const {
    deviceType,
    title,
    used,
    total,
    barColors = [
      cssStr('--acx-accents-blue-50'),
      cssStr('--acx-neutrals-30')
    ]
  } = props

  return (
    <SpaceWrapper size='small' justifycontent='space-around'>
      <Typography.Text>{title}</Typography.Text>
      <StackedBarChart
        style={{ height: 16, width: 135 }}
        showLabels={false}
        showTotal={false}
        showTooltip={false}
        barWidth={12}
        data={[{
          category: `${deviceType} Licenses `,
          series: [
            { name: 'used',
              value: used * 100 / total },
            { name: 'available',
              value: (total-used)* 100/total }
          ]
        }]}
        barColors={barColors}
      />
      <Typography.Text>
        {used} / {total}
      </Typography.Text>
    </SpaceWrapper>
  )
}

const subscriptionUtilizationTransformer = (
  deviceTypeList: EntitlementDeviceTypes,
  data: EntitlementSummary[]) => {
  const result = {} as { [key in EntitlementDeviceType]: {
    total: number;
    used: number;
  } }

  deviceTypeList.forEach(item => {
    const deviceType = item.value
    const summaryData = data.filter(n => n.deviceType === deviceType)
    let quantity = 0
    let used = 0

    summaryData.forEach(summary => {
      quantity += summary.quantity + summary.remainingDevices
      used += summary.quantity
    })

    if (quantity > 0) {
      result[deviceType] = {
        total: quantity,
        used: used
      }
    }
  })

  return result
}

export const SubscriptionUtilization = () => {
  const { $t } = useIntl()
  const params = useParams()

  // skip MSP data
  const subscriptionDeviceTypeList = getEntitlementDeviceTypes()
    .filter(o => !o.value.startsWith('MSP'))

  const queryResults = useGetEntitlementSummaryQuery({ params })

  const summaryData = subscriptionUtilizationTransformer(
    subscriptionDeviceTypeList,
    queryResults.data ?? [])

  return (
    <Loader states={[queryResults]}>
      <UI.FullWidthSpace direction='vertical'>
        <Subtitle level={4}>
          {$t({ defaultMessage: 'Subscription Utilization' })}
        </Subtitle>
        <UI.FullWidthSpace size='large'>
          {
            subscriptionDeviceTypeList.map((item) => {
              const summary = summaryData[item.value]
              return summary ? <SubscriptionUtilizationWidget
                key={item.value}
                deviceType={item.value}
                title={item.label}
                total={summary.total}
                used={summary.used}
              /> : ''
            })
          }
        </UI.FullWidthSpace>
      </UI.FullWidthSpace>
    </Loader>
  )
}