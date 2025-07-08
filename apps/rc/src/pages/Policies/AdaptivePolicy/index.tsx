import { MessageDescriptor, useIntl } from 'react-intl'

import { PageHeader }                                                          from '@acx-ui/components'
import { PolicyType, adaptivePolicyListLabelMap, useAdaptivePolicyBreadcrumb } from '@acx-ui/rc/utils'
import { goToNotFound }                                                        from '@acx-ui/user'

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
  [AdaptivePolicyTabKey.RADIUS_ATTRIBUTE_GROUP]: adaptivePolicyListLabelMap[PolicyType.RADIUS_ATTRIBUTE_GROUP],
  [AdaptivePolicyTabKey.ADAPTIVE_POLICY]: adaptivePolicyListLabelMap[PolicyType.ADAPTIVE_POLICY],
  // eslint-disable-next-line max-len
  [AdaptivePolicyTabKey.ADAPTIVE_POLICY_SET]: adaptivePolicyListLabelMap[PolicyType.ADAPTIVE_POLICY_SET]
}

export default function AdaptivePolicyList (props: { tabKey: AdaptivePolicyTabKey }) {
  const { $t } = useIntl()
  const Tab = tabs[props.tabKey] || goToNotFound
  const breadcrumb = useAdaptivePolicyBreadcrumb()

  return <>
    <PageHeader
      breadcrumb={breadcrumb}
      title={$t(tabsName[AdaptivePolicyTabKey.ADAPTIVE_POLICY])}
      footer={<AdaptivePolicyTabs activeTab={props.tabKey}/>}
    />
    { Tab && <Tab /> }
  </>
}
