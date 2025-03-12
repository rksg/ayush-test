import { Typography, Row, Col }      from 'antd'
import { useIntl, FormattedMessage } from 'react-intl'

import {
  Loader,
  Subtitle
} from '@acx-ui/components'
import { Features, useIsSplitOn }                                      from '@acx-ui/feature-toggle'
import { useGetMspEcProfileQuery }                                     from '@acx-ui/msp/services'
import { MSPUtils }                                                    from '@acx-ui/msp/utils'
import { SpaceWrapper, SubscriptionUtilizationWidget, useIsEdgeReady } from '@acx-ui/rc/components'
import {
  useGetEntitlementSummaryQuery
} from '@acx-ui/rc/services'
import {
  EntitlementDeviceType,
  EntitlementSummary,
  EntitlementDeviceTypes,
  getEntitlementDeviceTypes
} from '@acx-ui/rc/utils'
import { useParams }                                         from '@acx-ui/react-router-dom'
import { useGetAccountTierQuery }                            from '@acx-ui/user'
import { getJwtTokenPayload, isDelegationMode, AccountTier } from '@acx-ui/utils'

enum SubscriptionTierType {
  Platinum = 'Professional',
  Gold = 'Essentials'
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
  const isEdgeEnabled = useIsEdgeReady()
  const isDelegationTierApi = isDelegationMode()
  const isvSmartEdgeEnabled = useIsSplitOn(Features.ENTITLEMENT_VIRTUAL_SMART_EDGE_TOGGLE)
  const mspEcProfileData = useGetMspEcProfileQuery({ params })
  const mspUtils = MSPUtils()
  const isMspEc = mspUtils.isMspEc(mspEcProfileData.data)

  const request = useGetAccountTierQuery({ params }, { skip: !isDelegationTierApi })
  const tier = request?.data?.acx_account_tier?? getJwtTokenPayload().acx_account_tier
  const subscriptionVal = ( tier === AccountTier.GOLD? SubscriptionTierType.Gold
    : SubscriptionTierType.Platinum )
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
          <Col span={12}>
            <SpaceWrapper full justifycontent='flex-end' size='large'>
              <Typography.Text>
                <FormattedMessage
                  defaultMessage='Current Subscription Tier: <b>{tier}</b>'
                  values={{
                    tier: subscriptionVal,
                    b: (chunk) => <b>{chunk}</b>
                  }}
                />
              </Typography.Text>
            </SpaceWrapper>
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
                if (isvSmartEdgeEnabled) {
                  item.label = $t({ defaultMessage: 'Device Networking' })
                }
                return summary ? <SubscriptionUtilizationWidget
                  key={item.value}
                  deviceType={item.value}
                  title={item.label}
                  title2={isvSmartEdgeEnabled
                    ? (isMspEc ? $t({ defaultMessage: 'Assigned Licenses' })
                      : $t({ defaultMessage: 'Paid, Trial & Assigned Licenses' }))
                    : undefined}
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
