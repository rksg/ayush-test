import { Typography, Row, Col }      from 'antd'
import { useIntl, FormattedMessage } from 'react-intl'

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
import { useParams }          from '@acx-ui/react-router-dom'
import { getJwtTokenPayload } from '@acx-ui/utils'

import { ConvertNonVARMSPButton } from './ConvertNonVARMSPButton'
import * as UI                    from './styledComponent'

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

  const isZeroQuantity = total <= 0

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
              value: isZeroQuantity ? 0: (used * 100 / total) },
            { name: 'available',
              value: isZeroQuantity ? 100 : ((total-used) * 100 / total) }
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

    // only display types that has data in summary
    if (summaryData.length > 0) {
      summaryData.forEach(summary => {
        quantity += summary.quantity
        used += summary.deviceCount
      })

      // including to display 0 quantity.
      result[deviceType] = {
        total: quantity,
        used: used
      }
    }
  })

  return result
}

export const SubscriptionHeader = () => {
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
        <Row>
          <Col span={12}>
            <Subtitle level={4}>
              {$t({ defaultMessage: 'Subscription Utilization' })}
            </Subtitle>
          </Col>
          <Col span={12}>
            <SpaceWrapper justifycontent='flex-end' size='large'>
              <Typography.Text>
                <FormattedMessage
                  defaultMessage='Current Subscription Tier: <b>{tier}</b>'
                  values={{
                    tier: getJwtTokenPayload().acx_account_tier,
                    b: (chunk) => <b>{chunk}</b>
                  }}
                />
              </Typography.Text>
              <ConvertNonVARMSPButton />
            </SpaceWrapper>
          </Col>
        </Row>
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
