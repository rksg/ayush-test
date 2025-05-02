import { Typography }                from 'antd'
import { FormattedMessage, useIntl } from 'react-intl'

import {
  Tabs
} from '@acx-ui/components'
import { Features, useIsSplitOn }                                                    from '@acx-ui/feature-toggle'
import { LicenseCompliance, PendingActivations }                                     from '@acx-ui/msp/components'
import { MspRbacUrlsInfo }                                                           from '@acx-ui/msp/utils'
import { SpaceWrapper }                                                              from '@acx-ui/rc/components'
import { AdministrationUrlsInfo, LicenseUrlsInfo }                                   from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink }                                     from '@acx-ui/react-router-dom'
import { hasAllowedOperations, useGetAccountTierQuery }                              from '@acx-ui/user'
import { AccountTier, AccountType, getJwtTokenPayload, getOpsApi, isDelegationMode } from '@acx-ui/utils'

// import MySubscriptions            from './MySubscriptions'
import { RbacSubscriptionsTabHeader } from './RbacSubscriptionsTabHeader'
import { RbacSubscriptionTable }      from './RbacSubscriptionTable'
import { SubscriptionsTabHeader }     from './SubscriptionsTabHeader'

import { SubscriptionTable } from '.'

export const SubscriptionTabs = (props: { tenantType: string }) => {
  const { $t } = useIntl()
  const { tenantType } = props
  const params = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink('/administration/subscriptions')
    enum SubscriptionTierType {
      Platinum = 'Professional',
      Gold = 'Essentials',
      Core = 'Core'
    }
    const isDelegationTierApi = isDelegationMode()
    const isEntitlementRbacApiEnabled = useIsSplitOn(Features.ENTITLEMENT_RBAC_API)
    const isvSmartEdgeEnabled = useIsSplitOn(Features.ENTITLEMENT_VIRTUAL_SMART_EDGE_TOGGLE)
    const isComplianceEnabled = useIsSplitOn(Features.ENTITLEMENT_LICENSE_COMPLIANCE_TOGGLE)
    const showCompliance = isvSmartEdgeEnabled && isComplianceEnabled

    const request = useGetAccountTierQuery({ params }, { skip: !isDelegationTierApi })
    const tier = request?.data?.acx_account_tier?? getJwtTokenPayload().acx_account_tier
    const subscriptionVal = (
      tier === AccountTier.GOLD
        ? SubscriptionTierType.Gold
        : tier === AccountTier.CORE
          ? SubscriptionTierType.Core
          : SubscriptionTierType.Platinum
    )

    const tabs = {
      mySubscriptions: {
        title: $t({ defaultMessage: 'My Subscriptions' }),
        content: <SpaceWrapper fullWidth size='large' direction='vertical'>
          {isEntitlementRbacApiEnabled
            ? <RbacSubscriptionsTabHeader /> : <SubscriptionsTabHeader />}
          {isEntitlementRbacApiEnabled
            ? <RbacSubscriptionTable /> : <SubscriptionTable />}
        </SpaceWrapper>,
        visible: hasAllowedOperations([getOpsApi(LicenseUrlsInfo.getMspEntitlement)])
      },
      pendingActivations: {
        title: $t({ defaultMessage: 'Pending Activations' }),
        content: <PendingActivations />,
        visible: (tenantType === AccountType.REC || tenantType === AccountType.MSP_REC) &&
          hasAllowedOperations([getOpsApi(AdministrationUrlsInfo.getEntitlementsActivations)])
      },
      compliance: {
        title: $t({ defaultMessage: 'Compliance' }),
        content: <LicenseCompliance isMsp={false}/>,
        visible: showCompliance &&
          (tenantType === AccountType.REC || tenantType === AccountType.MSP_REC) &&
          hasAllowedOperations([getOpsApi(MspRbacUrlsInfo.getEntitlementsCompliances)])
      }
    }

    const onTabChange = (activeKey: string) => {
      navigate({
        ...basePath,
        pathname: `${basePath.pathname}/${activeKey}`
      })
    }

    return (<>
      <SpaceWrapper justifycontent='flex-end' size='large'>
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
      <Tabs
        defaultActiveKey='mySubscriptions'
        type='card'
        onChange={onTabChange}
        activeKey={params.activeSubTab}
      >
        {
          Object.entries(tabs).map((item) =>
            item[1].visible &&
            <Tabs.TabPane
              key={item[0]}
              tab={item[1].title}
              children={item[1].content}
            />)
        }
      </Tabs>
    </>
    )
}
