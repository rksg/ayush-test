import { MessageDescriptor, defineMessage, useIntl } from 'react-intl'

import { PageHeader }             from '@acx-ui/components'
import { getPolicyListRoutePath } from '@acx-ui/rc/utils'

import AdaptivePolicyTable       from './AdaptivePolicy/AdaptivePolicyTable'
import AdaptivePolicySetTable    from './AdaptivePolicySet/AdaptivePolicySetTable'
import AdaptivePolicyTabs        from './AdaptivePolicyTabs'
import RadiusAttributeGroupTable from './RadiusAttributeGroup/RadiusAttributeGroupTable'

export enum AdaptivePolicyTabKey {
  ADAPTIVE_POLICY = 'adaptivePolicy',
  ADAPTIVE_POLICY_SET = 'adaptivePolicySet',
  RADIUS_ATTRIBUTE_GROUP = 'radiusAttributeGroup'
}

const tabs: Record<AdaptivePolicyTabKey, () => JSX.Element> = {
  [AdaptivePolicyTabKey.RADIUS_ATTRIBUTE_GROUP]: RadiusAttributeGroupTable,
  [AdaptivePolicyTabKey.ADAPTIVE_POLICY]: AdaptivePolicyTable,
  [AdaptivePolicyTabKey.ADAPTIVE_POLICY_SET]: AdaptivePolicySetTable
}

const tabsName: Record<AdaptivePolicyTabKey, MessageDescriptor> = {
  // eslint-disable-next-line max-len
  [AdaptivePolicyTabKey.RADIUS_ATTRIBUTE_GROUP]: defineMessage({ defaultMessage: 'RADIUS Attribute Groups' }),
  [AdaptivePolicyTabKey.ADAPTIVE_POLICY]: defineMessage({ defaultMessage: 'Adaptive Policy' }),
  // eslint-disable-next-line max-len
  [AdaptivePolicyTabKey.ADAPTIVE_POLICY_SET]: defineMessage({ defaultMessage: 'Adaptive Policy Sets' })
}

export default function AdaptivePolicyList (props: { tabKey: AdaptivePolicyTabKey }) {
  const { $t } = useIntl()
  const Tab = tabs[props.tabKey]
  return <>
    <PageHeader
      breadcrumb={[
        { text: $t({ defaultMessage: 'Network Control' }) },
        {
          text: $t({ defaultMessage: 'Policies & Profiles' }),
          link: getPolicyListRoutePath(true)
        }
      ]}
      title={$t(tabsName[props.tabKey])}
      footer={<AdaptivePolicyTabs activeTab={props.tabKey}/>}
    />
    { Tab && <Tab /> }
  </>
}
