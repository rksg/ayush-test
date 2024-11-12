import { Row, Col } from 'antd'
import { useIntl }  from 'react-intl'

import {
  Loader,
  Subtitle
} from '@acx-ui/components'
import { TierFeatures, useIsTierAllowed }              from '@acx-ui/feature-toggle'
import { SpaceWrapper, SubscriptionUtilizationWidget } from '@acx-ui/rc/components'
import {
  useRbacEntitlementSummaryQuery
} from '@acx-ui/rc/services'
import {
  EntitlementDeviceType,
  EntitlementDeviceTypes,
  getEntitlementDeviceTypes,
  EntitlementSummaries
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

const entitlementSummaryPayload = {
  filters: {
    licenseType: ['APSW'],
    usageType: 'SELF'
  }
}

const rbacSubscriptionUtilizationTransformer = (
  deviceTypeList: EntitlementDeviceTypes,
  data: EntitlementSummaries[]) => {
  const result = {} as { [key in EntitlementDeviceType]: {
    total: number;
    used: number;
  } }

  deviceTypeList.forEach(item => {
    const deviceType = item.value
    const summaryData = data.filter(n => n.licenseType === deviceType)
    let quantity = 0
    let used = 0

    // only display types that has data in summary
    if (summaryData.length > 0) {
      summaryData.forEach(summary => {
        quantity += summary.quantity
        used += summary.usedQuantity
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

export const RbacSubscriptionsTabHeader = () => {
  const { $t } = useIntl()
  const isEdgeEnabled = useIsTierAllowed(TierFeatures.SMART_EDGES)

  // skip MSP data
  const subscriptionDeviceTypeList = getEntitlementDeviceTypes()
    .filter(o => !o.value.startsWith('MSP'))

  const rbacSummaryResults =
      useRbacEntitlementSummaryQuery(
        { params: useParams(), payload: entitlementSummaryPayload })

  const summaryData =
    rbacSubscriptionUtilizationTransformer(
      subscriptionDeviceTypeList,
      rbacSummaryResults.data ?? [])

  return (
    <Loader states={[rbacSummaryResults]}>
      <SpaceWrapper fullWidth direction='vertical'>
        <Row>
          <Col span={12}>
            <Subtitle level={4}>
              {$t({ defaultMessage: 'Subscription Utilization' })}
            </Subtitle>
            <h4 style={{ marginTop: '-8px' }}>
              {$t({ defaultMessage: 'Paid, Assigned & Trial' })}
            </h4>
          </Col>
        </Row>
        <SpaceWrapper fullWidth size='large' justifycontent='flex-start'>
          {
            subscriptionDeviceTypeList.filter(data =>
              (data.value !== EntitlementDeviceType.EDGE || isEdgeEnabled) &&
               data.value !== EntitlementDeviceType.ANALYTICS
            )
              .map((item) => {
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
        </SpaceWrapper>
      </SpaceWrapper>
    </Loader>
  )
}
