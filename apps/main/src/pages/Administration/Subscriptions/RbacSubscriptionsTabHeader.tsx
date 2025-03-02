import { Row, Col } from 'antd'
import { useIntl }  from 'react-intl'

import {
  Loader,
  Subtitle
} from '@acx-ui/components'
import { Features, TierFeatures, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { SpaceWrapper, SubscriptionUtilizationWidget }            from '@acx-ui/rc/components'
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
  const solutionTokenFFToggled = useIsSplitOn(Features.ENTITLEMENT_SOLUTION_TOKEN_TOGGLE)

  // skip MSP data
  const subscriptionDeviceTypeList = getEntitlementDeviceTypes()
    .filter(o => !o.value.startsWith('MSP'))

  const entitlementSummaryPayload = {
    filters: {
      licenseType: solutionTokenFFToggled ? ['APSW', 'SLTN_TOKEN'] : ['APSW'],
      usageType: 'SELF'
    }
  }

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
            { !solutionTokenFFToggled && <h4 style={{ marginTop: '-8px' }}>
              {$t({ defaultMessage: 'Paid, Assigned & Trial' })}
            </h4>}
          </Col>
        </Row>
        <SpaceWrapper
          justifycontent='flex-start'
          style={{ marginBottom: '20px' }}>
          {
            subscriptionDeviceTypeList.filter(data =>
              (data.value !== EntitlementDeviceType.EDGE || isEdgeEnabled) &&
               data.value !== EntitlementDeviceType.ANALYTICS
            )
              .map((item) => {
                const summary = summaryData[item.value]

                if (solutionTokenFFToggled && item.value === EntitlementDeviceType.APSW) {
                  item.label = $t({ defaultMessage: 'Device Networking Paid & Trial Licenses' })
                }

                if (solutionTokenFFToggled && item.value === EntitlementDeviceType.SLTN_TOKEN) {
                  item.label = $t({ defaultMessage: 'Solution Tokens Paid & Trial Licenses' })
                }

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
