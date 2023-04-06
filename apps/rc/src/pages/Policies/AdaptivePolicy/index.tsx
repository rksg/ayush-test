import { useIntl } from 'react-intl'

import { PageHeader }             from '@acx-ui/components'
import { getPolicyListRoutePath } from '@acx-ui/rc/utils'

import AdaptivePolicyTable       from './AdaptivePolicy/AdaptivePolicyTable'
import AdaptivePolicySetTable    from './AdaptivePolicySet/AdaptivePolicySetTable'
import AdaptivePolicyTabs        from './AdaptivePolicyTabs'
import RadiusAttributeGroupTable from './RadiusAttributeGroup/RadiusAttributeGroupTable'

const tabs = {
  radiusAttributeGroup: RadiusAttributeGroupTable,
  adaptivePolicy: AdaptivePolicyTable,
  adaptivePolicySet: AdaptivePolicySetTable
}

const tabsName = {
  radiusAttributeGroup: 'RADIUS Attribute Groups',
  adaptivePolicy: 'Adaptive Policy',
  adaptivePolicySet: 'Adaptive Policy Sets'
}

export enum AdaptivePolicyTabKey {
  ADAPTIVE_POLICY = 'adaptivePolicy',
  ADAPTIVE_POLICY_SET = 'adaptivePolicySet',
  RADIUS_ATTRIBUTE_GROUP = 'radiusAttributeGroup'
}

export default function AdaptivePolicyList (props: { tabKey: AdaptivePolicyTabKey }) {
  const { $t } = useIntl()
  const Tab = tabs[props.tabKey as keyof typeof tabs]
  return <>
    <PageHeader
      breadcrumb={
        [
          { text: $t({ defaultMessage: 'Policies & Profiles' }),
            link: getPolicyListRoutePath(true) }
        ]}
      title={tabsName[props.tabKey as keyof typeof tabs]}
      footer={<AdaptivePolicyTabs activeTab={props.tabKey}/>}
    />
    { Tab && <Tab /> }
  </>
}
