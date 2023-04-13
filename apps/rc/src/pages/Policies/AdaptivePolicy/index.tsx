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
  radiusAttributeGroup: RadiusAttributeGroupTable,
  adaptivePolicy: AdaptivePolicyTable,
  adaptivePolicySet: AdaptivePolicySetTable
}

const tabsName: Record<AdaptivePolicyTabKey, MessageDescriptor> = {
  radiusAttributeGroup: defineMessage({ defaultMessage: 'RADIUS Attribute Groups' }),
  adaptivePolicy: defineMessage({ defaultMessage: 'Adaptive Policy' }),
  adaptivePolicySet: defineMessage({ defaultMessage: 'Adaptive Policy Sets' })
}

export default function AdaptivePolicyList (props: { tabKey: AdaptivePolicyTabKey }) {
  const { $t } = useIntl()
  const Tab = tabs[props.tabKey]
  return <>
    <PageHeader
      breadcrumb={
        [
          { text: $t({ defaultMessage: 'Policies & Profiles' }),
            link: getPolicyListRoutePath(true) }
        ]}
      title={$t(tabsName[props.tabKey])}
      footer={<AdaptivePolicyTabs activeTab={props.tabKey}/>}
    />
    { Tab && <Tab /> }
  </>
}
