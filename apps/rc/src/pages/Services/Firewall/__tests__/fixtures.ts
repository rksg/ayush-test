import {
  ACLDirection,
  DdosAttackType
} from '@acx-ui/rc/utils'

export const mockedFirewallDataList = {
  totalCount: 2,
  page: 1,
  data: [
    {
      id: '1',
      firewallName: 'TestFirewall1',
      ddosEnabled: true,
      ddosRateLimitingRules: {
        [DdosAttackType.ALL]: 220,
        [DdosAttackType.ICMP]: 200
      },
      statefulAclEnabled: true,
      statefulAcls: [
        {
          aclName: 'ACL1',
          aclDirection: ACLDirection.INBOUND,
          aclRuleNum: 2
        },
        {
          aclName: 'ACL2',
          aclDirection: ACLDirection.OUTBOUND,
          aclRuleNum: 2
        }
      ],
      edgeIds: ['edge1']
    },
    {
      id: '2',
      firewallName: 'TestFirewall2',
      ddosEnabled: true,
      ddosRateLimitingRules: {
        [DdosAttackType.ALL]: 220,
        [DdosAttackType.ICMP]: 200
      },
      statefulAclEnabled: true,
      statefulAcls: [
        {
          aclName: 'ACL1',
          aclDirection: ACLDirection.INBOUND,
          aclRuleNum: 2
        },
        {
          aclName: 'ACL2',
          aclDirection: ACLDirection.OUTBOUND,
          aclRuleNum: 2
        }
      ],
      edgeIds: ['edge2']
    }
  ]
}
