import { Typography }                from 'antd'
import { FormattedMessage, useIntl } from 'react-intl'

import {
  Tabs
} from '@acx-ui/components'
import { Features, useIsSplitOn }                            from '@acx-ui/feature-toggle'
import { SpaceWrapper }                                      from '@acx-ui/rc/components'
import { useNavigate, useParams, useTenantLink }             from '@acx-ui/react-router-dom'
import { useGetAccountTierQuery }                            from '@acx-ui/user'
import { AccountTier, getJwtTokenPayload, isDelegationMode } from '@acx-ui/utils'

import ActivatedPurchases         from './ActivatedPurchases'
import { ConvertNonVARMSPButton } from './ConvertNonVARMSPButton'
import MySubscriptions            from './MySubscriptions'
import PendingActivations         from './PendingActivations'


export const SubscriptionTabs = () => {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink('/administration/subscriptions')
    enum SubscriptionTierType {
      Platinum = 'Professional',
      Gold = 'Essentials'
    }
    const isDelegationTierApi = useIsSplitOn(Features.DELEGATION_TIERING) && isDelegationMode()
    const request = useGetAccountTierQuery({ params }, { skip: !isDelegationTierApi })
    const tier = request?.data?.acx_account_tier?? getJwtTokenPayload().acx_account_tier
    const subscriptionVal = ( tier === AccountTier.GOLD? SubscriptionTierType.Gold
      : SubscriptionTierType.Platinum )

    const tabs = {
      mySubscriptions: {
        title: $t({ defaultMessage: 'My Subscriptions' }),
        content: <MySubscriptions />,
        visible: true
      },
      activatedPurchases: {
        title: $t({ defaultMessage: 'Activated Purchases' }),
        content: <ActivatedPurchases />,
        visible: true
      },
      pendingActivations: {
        title: $t({ defaultMessage: 'Pending Activations' }),
        content: <PendingActivations />,
        visible: true
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