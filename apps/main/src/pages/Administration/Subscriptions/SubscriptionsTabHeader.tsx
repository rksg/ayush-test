import { Row, Col } from 'antd'
import { useIntl }  from 'react-intl'

import {
  Loader,
  Subtitle
} from '@acx-ui/components'
import { Features, useIsSplitOn }                      from '@acx-ui/feature-toggle'
import { SpaceWrapper, SubscriptionUtilizationWidget } from '@acx-ui/rc/components'
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

export const SubscriptionsTabHeader = () => {
  const { $t } = useIntl()
  const params = useParams()
  const isvSmartEdgeEnabled = useIsSplitOn(Features.ENTITLEMENT_VIRTUAL_SMART_EDGE_TOGGLE)

  // skip MSP data
  const subscriptionDeviceTypeList = getEntitlementDeviceTypes()
    .filter(o => !o.value.startsWith('MSP'))

  const queryResults = useGetEntitlementSummaryQuery({ params })
  const summaryData = subscriptionUtilizationTransformer(
    subscriptionDeviceTypeList,
    queryResults.data ?? [])

  return (
    <Loader states={[queryResults]}>
      <SpaceWrapper fullWidth direction='vertical'>
        <Row>
          <Col span={12}>
            <Subtitle level={4}>
              {$t({ defaultMessage: 'Subscription Utilization' })}
            </Subtitle>
            {!isvSmartEdgeEnabled && <h4 style={{ marginTop: '-8px' }}>
              {$t({ defaultMessage: 'Paid, Assigned & Trial' })}
            </h4>}
          </Col>
        </Row>
        <SpaceWrapper fullWidth size='large' justifycontent='flex-start'>
          {
            subscriptionDeviceTypeList.filter(data =>
              data.value !== EntitlementDeviceType.ANALYTICS
            )
              .map((item) => {
                const summary = summaryData[item.value]
                if (isvSmartEdgeEnabled) {
                  item.label = $t({ defaultMessage: 'Device Networking' })
                }
                return summary ? <SubscriptionUtilizationWidget
                  key={item.value}
                  deviceType={item.value}
                  title={item.label}
                  title2={isvSmartEdgeEnabled
                    ? $t({ defaultMessage: 'Paid & Trial Licenses' }) : undefined}
                  total={summary.total}
                  used={summary.used}
                /> : ''
              })
          }
        </SpaceWrapper>
      </SpaceWrapper>
    </Loader>
  )
}
