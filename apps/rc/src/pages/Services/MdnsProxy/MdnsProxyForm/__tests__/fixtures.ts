import { MdnsProxyForwardingRule, MdnsProxyForwardingRuleTypeEnum } from '@acx-ui/rc/utils'

export const mockedTenantId = '6de6a5239a1441cfb9c7fde93aa613fe'

export const mockedForwardingRules: MdnsProxyForwardingRule[] = [
  {
    type: MdnsProxyForwardingRuleTypeEnum.AIRPLAY,
    fromVlan: 10,
    toVlan: 20
  },
  {
    type: MdnsProxyForwardingRuleTypeEnum.AIRDISK,
    fromVlan: 21,
    toVlan: 30
  }
]
