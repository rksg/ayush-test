import RadiusAttributeGroupTable from '../RadiusAttributeGroup/RadiusAttributeGroupTable'

import AdaptivePolicyListPageHeader from './AdaptivePolicyListPageHeader'

const tabs = {
  radiusAttributeGroup: RadiusAttributeGroupTable
}

export enum AdaptivePolicyTabKey {
  ADAPTIVE_POLICY = 'adaptivePolicy',
  ADAPTIVE_POLICY_SET = 'adaptivePolicySet',
  RADIUS_ATTRIBUTE_GROUP = 'radiusAttributeGroup'
}

export default function AdaptivePolicyList (props: { tabKey: AdaptivePolicyTabKey }) {
  const Tab = tabs[props.tabKey as keyof typeof tabs]
  return <>
    <AdaptivePolicyListPageHeader/>
    { Tab && <Tab /> }
  </>
}
