export enum DdosAttackType {
  ALL = 'ALL',
  ICMP = 'ICMP',
  TCP_SYN = 'TCP_SYN',
  IP_FRAGMENT = 'IP_FRAGMENT',
  DNS_RESPONSE = 'DNS_RESPONSE',
  NTP_REFLECTION = 'NTP_REFLECTION'
}

export enum ACLDirection {
  OUTBOUND = 'OUTBOUND',
  INBOUND = 'INBOUND'
}

export interface EdgeFirewallViewData {
  id?: string
  tenantId?: string
  firewallName?: string
  tags?: string[]
  ddosEnabled?: boolean
  ddosRateLimitingRules?: {
     [key in DdosAttackType]?: number
  }
  statefulAclEnabled?: boolean
  statefulAcls?: {
        aclName: string,
        aclDirection: ACLDirection,
        aclRuleNum: number
    }[]
  edgeIds?: string[]
}