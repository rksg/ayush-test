import { Typography }                from 'antd'
import { FormattedMessage, useIntl } from 'react-intl'

import {
  Tabs
} from '@acx-ui/components'
import { Features, useIsSplitOn }                                         from '@acx-ui/feature-toggle'
import { LicenseCompliance, PendingActivations }                          from '@acx-ui/msp/components'
import { SpaceWrapper }                                                   from '@acx-ui/rc/components'
import { useNavigate, useParams, useTenantLink }                          from '@acx-ui/react-router-dom'
import { useGetAccountTierQuery }                                         from '@acx-ui/user'
import { AccountTier, AccountType, getJwtTokenPayload, isDelegationMode } from '@acx-ui/utils'

import { ConvertNonVARMSPButton } from './ConvertNonVARMSPButton'
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
      Gold = 'Essentials'
    }
    const isDelegationTierApi = isDelegationMode()
    const isEntitlementRbacApiEnabled = useIsSplitOn(Features.ENTITLEMENT_RBAC_API)
    const isvSmartEdgeEnabled = useIsSplitOn(Features.ENTITLEMENT_VIRTUAL_SMART_EDGE_TOGGLE)
    const isComplianceEnabled = useIsSplitOn(Features.ENTITLEMENT_LICENSE_COMPLIANCE_TOGGLE)
    const showCompliance = isvSmartEdgeEnabled && isComplianceEnabled

    const request = useGetAccountTierQuery({ params }, { skip: !isDelegationTierApi })
    const tier = request?.data?.acx_account_tier?? getJwtTokenPayload().acx_account_tier
    const subscriptionVal = tier === AccountTier.GOLD ? SubscriptionTierType.Gold
      : SubscriptionTierType.Platinum

    const tabs = {
      mySubscriptions: {
        title: $t({ defaultMessage: 'My Subscriptions' }),
        content: <SpaceWrapper fullWidth size='large' direction='vertical'>
          {isEntitlementRbacApiEnabled
            ? <RbacSubscriptionsTabHeader /> : <SubscriptionsTabHeader />}
          {isEntitlementRbacApiEnabled
            ? <RbacSubscriptionTable /> : <SubscriptionTable />}
        </SpaceWrapper>,
        visible: true
      },
      pendingActivations: {
        title: $t({ defaultMessage: 'Pending Activations' }),
        content: <PendingActivations />,
        visible: (tenantType === AccountType.REC || tenantType === AccountType.MSP_REC)
      },
      compliance: {
        title: $t({ defaultMessage: 'Compliance' }),
        content: <LicenseCompliance isMsp={false}/>,
        visible: showCompliance &&
          (tenantType === AccountType.REC || tenantType === AccountType.MSP_REC)
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
        <ConvertNonVARMSPButton />
      </SpaceWrapper>
      <Tabs
        defaultActiveKey='users'
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
