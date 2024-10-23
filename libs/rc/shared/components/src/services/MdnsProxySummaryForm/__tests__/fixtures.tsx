import {
  MdnsProxyFormData,
  MdnsProxyForwardingRule,
  BridgeServiceEnum,
  ApMdnsProxyScopeData
} from '@acx-ui/rc/utils'

export const mockedForwardingRules: MdnsProxyForwardingRule[] = [
  {
    id: '__UUID__rule1',
    ruleIndex: '__UUID__rule1',
    service: BridgeServiceEnum.AIRPLAY,
    fromVlan: 10,
    toVlan: 20
  },
  {
    id: '__UUID__rule2',
    ruleIndex: '__UUID__rule2',
    service: BridgeServiceEnum.APPLETV,
    fromVlan: 21,
    toVlan: 30
  }
]

export const mockedScope: ApMdnsProxyScopeData[] = [
  {
    venueId: '4ca20c8311024ac5956d366f15d96e0c',
    venueName: 'Venue 1',
    aps: [
      {
        serialNumber: '900000005500',
        name: 'Venue 1 - AP 1'
      },
      {
        serialNumber: '900000005501',
        name: 'Venue 1 - AP 2'
      }
    ]
  },
  {
    venueId: 'd6062edbdf57451facb33967c2160c72',
    venueName: 'Venue 2',
    aps: [
      {
        serialNumber: '121749001049',
        name: 'Venue 2 - AP 1'
      }
    ]
  }
]

export const mockedFormData: MdnsProxyFormData = {
  name: 'mDNS Proxy 123',
  rules: mockedForwardingRules,
  scope: mockedScope
}